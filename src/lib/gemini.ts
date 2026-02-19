import { GoogleGenAI } from '@google/genai';
import { aiGenerate, isAIAvailable } from './aiProvider';

// Legacy client — uses first available numbered key
const firstKey = (
    import.meta.env.VITE_GEMINI_API_KEY_1 ??
    import.meta.env.VITE_GEMINI_API_KEY ??
    ''
) as string;

export const client: GoogleGenAI | null = firstKey
    ? new GoogleGenAI({ apiKey: firstKey })
    : null;

/**
 * getAlchemistAdvice — routed through aiProvider for token tracking.
 * Falls back to direct client if aiProvider is unavailable.
 */
export const getAlchemistAdvice = async (meal: string, healthProfile: string): Promise<string> => {
    if (!isAIAvailable() && !client) return "The Alchemist is silent. (Missing API keys)";

    const prompt = `You are a wise health alchemist. A user with this profile: ${healthProfile}
just consumed: "${meal}".
Give a short (2-3 sentence) mystical but practical health assessment.
Include an estimated HP impact.`;

    // Try aiProvider first (token-tracked, multi-key)
    const response = await aiGenerate({ prompt, temperature: 0.7 });
    if (response) return response.text;

    // Fallback to direct client
    if (client) {
        try {
            const result = await client.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
            });
            return result.text || "The Alchemist ponders silently...";
        } catch (err) {
            console.error('[Gemini] Direct client error:', err);
        }
    }

    return "The Alchemist is meditating. (Check console for errors)";
};
