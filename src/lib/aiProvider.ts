import { GoogleGenAI } from '@google/genai';
import { useAIStore } from '../store/aiStore';

// ── Types ──

export interface AIRequest {
    prompt: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
    systemInstruction?: string;
    jsonMode?: boolean;
}

export interface AIResponse {
    text: string;
    tokensUsed: { input: number; output: number };
    model: string;
    keyIndex: number;
}

// ── Models Registry ──

export const AI_MODELS = [
    { id: 'gemini-3-flash', label: 'Gemini 3 Flash', tier: 'fast', costPer1kTokens: 0.0 },
    { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', tier: 'fast', costPer1kTokens: 0.0 },
    { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', tier: 'pro', costPer1kTokens: 0.0 },
    { id: 'gemini-3-pro', label: 'Gemini 3 Pro', tier: 'pro', costPer1kTokens: 0.0 },
] as const;

// ── Client Pool ──

let clientPool: { client: GoogleGenAI; keyIndex: number }[] = [];
let poolInitialized = false;

function initClientPool(): void {
    if (poolInitialized) return;

    const allKeys: { key: string; index: number }[] = [];

    // Scan numbered keys: VITE_GEMINI_API_KEY_1 through _8
    for (let i = 1; i <= 8; i++) {
        const key = import.meta.env[`VITE_GEMINI_API_KEY_${i}`] as string | undefined;
        if (key?.trim()) {
            allKeys.push({ key: key.trim(), index: -(i) });
        }
    }

    // Fallback: legacy single key or comma-separated
    if (allKeys.length === 0) {
        const envKeys = import.meta.env.VITE_GEMINI_API_KEYS as string | undefined;
        const envKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
        if (envKeys) {
            envKeys.split(',').map((k) => k.trim()).filter(Boolean).forEach((k, i) => allKeys.push({ key: k, index: -(i + 1) }));
        } else if (envKey) {
            allKeys.push({ key: envKey, index: -1 });
        }
    }

    // Add user-managed store keys
    const storeKeys = useAIStore.getState().apiKeys.filter((k) => k.enabled);
    storeKeys.forEach((k, i) => allKeys.push({ key: k.key, index: i }));

    clientPool = allKeys.map(({ key, index }) => ({
        client: new GoogleGenAI({ apiKey: key }),
        keyIndex: index,
    }));

    poolInitialized = true;
}

/** Force re-init (e.g., after adding/removing keys) */
export function resetClientPool(): void {
    poolInitialized = false;
    clientPool = [];
}

// ── Rate Limiter ──

const requestTimestamps: number[] = [];
const MAX_REQUESTS_PER_MINUTE = 15;

async function waitForRateLimit(): Promise<void> {
    const now = Date.now();
    // Remove timestamps older than 60s
    while (requestTimestamps.length > 0 && requestTimestamps[0] < now - 60_000) {
        requestTimestamps.shift();
    }
    if (requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
        const waitMs = 60_000 - (now - requestTimestamps[0]);
        if (waitMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, waitMs));
        }
    }
    requestTimestamps.push(Date.now());
}

// ── Retry Logic ──

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            return await fn();
        } catch (err: unknown) {
            lastError = err;
            const errMsg = err instanceof Error ? err.message : String(err);
            // Don't retry on auth or permission errors
            if (/api.key|permission|forbidden|invalid/i.test(errMsg)) throw err;
            // Exponential backoff
            if (attempt < retries - 1) {
                await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
            }
        }
    }
    throw lastError;
}

// ── Estimate Tokens (rough heuristic) ──

function estimateTokens(text: string): number {
    // ~4 chars per token for English text
    return Math.ceil(text.length / 4);
}

// ── Core Generate Function ──

export async function aiGenerate(request: AIRequest): Promise<AIResponse | null> {
    const store = useAIStore.getState();

    // Check budget
    if (store.todayTokensUsed >= store.dailyTokenBudget) {
        console.warn('[AI] Daily token budget exhausted');
        return null;
    }

    initClientPool();

    if (clientPool.length === 0) {
        console.warn('[AI] No API keys available');
        return null;
    }

    await waitForRateLimit();

    const model = request.model ?? store.preferredModel;

    // Try each client in the pool
    for (const { client, keyIndex } of clientPool) {
        try {
            const result = await withRetry(async () => {
                const response = await client.models.generateContent({
                    model,
                    contents: [{ role: 'user', parts: [{ text: request.prompt }] }],
                    config: {
                        maxOutputTokens: request.maxTokens,
                        temperature: request.temperature,
                        responseMimeType: request.jsonMode ? 'application/json' : undefined,
                    },
                });

                return response;
            });

            const text = result.text ?? '';
            const tokensInput = result.usageMetadata?.promptTokenCount ?? estimateTokens(request.prompt);
            const tokensOutput = result.usageMetadata?.candidatesTokenCount ?? estimateTokens(text);

            // Track usage
            store.addTokenUsage(tokensInput, tokensOutput, keyIndex >= 0 ? keyIndex : undefined);
            store.logRequest({
                model,
                tokensInput,
                tokensOutput,
                feature: request.systemInstruction ? 'chat' : 'general',
                cached: false,
            });

            return { text, tokensUsed: { input: tokensInput, output: tokensOutput }, model, keyIndex };
        } catch (err) {
            console.warn(`[AI] Key ${keyIndex} failed:`, err);
            continue; // Try next key
        }
    }

    console.error('[AI] All keys exhausted');
    return null;
}

// ── Convenience: Generate JSON ──

export async function aiGenerateJSON<T>(request: AIRequest): Promise<T | null> {
    const response = await aiGenerate({ ...request, jsonMode: true });
    if (!response) return null;

    try {
        // Handle markdown-wrapped JSON
        let jsonText = response.text.trim();
        if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
        }
        return JSON.parse(jsonText) as T;
    } catch (err) {
        console.error('[AI] Failed to parse JSON response:', err);
        return null;
    }
}

// ── Quick helpers ──

export function isAIAvailable(): boolean {
    return useAIStore.getState().isAIAvailable();
}

export function getTokenStats() {
    return useAIStore.getState().getTokenUsage();
}
