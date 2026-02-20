import { create } from 'zustand';
import { format } from 'date-fns';
import { saveToFirestore, loadFromFirestore } from '../lib/firestoreSync';

// ── Types ──

export interface AIKeyConfig {
    key: string;
    label: string;
    enabled: boolean;
    tokensUsedToday: number;
    lastResetDate: string;
}

export interface AIRequestLog {
    timestamp: number;
    model: string;
    tokensInput: number;
    tokensOutput: number;
    feature: string;
    cached: boolean;
}

export interface FoodNutritionCache {
    name: string;
    calories: number;
    sugar: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    source: 'ai' | 'database' | 'user';
    timestamp: number;
    servingSize: string;
}

interface AIState {
    // Internal
    _uid: string | null;

    // API keys
    apiKeys: AIKeyConfig[];
    addApiKey: (key: string, label: string) => void;
    removeApiKey: (key: string) => void;
    toggleApiKey: (key: string) => void;

    // Token budget
    dailyTokenBudget: number;
    setDailyTokenBudget: (budget: number) => void;
    todayTokensUsed: number;
    totalTokensUsed: number;

    // Model preference
    preferredModel: string;
    setPreferredModel: (model: string) => void;
    fallbackEnabled: boolean;
    setFallbackEnabled: (enabled: boolean) => void;

    // Request logging
    requestLog: AIRequestLog[];
    logRequest: (entry: Omit<AIRequestLog, 'timestamp'>) => void;

    // Food cache
    foodCache: Record<string, FoodNutritionCache>;
    getCachedFood: (name: string) => FoodNutritionCache | null;
    cacheFood: (data: FoodNutritionCache) => void;
    getFoodCacheStats: () => { count: number; aiCount: number; dbCount: number };

    // Token management
    addTokenUsage: (input: number, output: number, keyIndex?: number) => void;
    getTokenUsage: () => { today: number; limit: number; remaining: number; percentage: number };
    resetDailyTokens: () => void;

    // Availability
    isAIAvailable: () => boolean;

    // Firestore
    loadData: (uid: string) => Promise<void>;
    clearAllData: () => void;
}

function normalizeKey(name: string): string {
    return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

const today = () => format(new Date(), 'yyyy-MM-dd');

const DATA_KEYS = [
    'apiKeys', 'dailyTokenBudget', 'todayTokensUsed', 'totalTokensUsed',
    'preferredModel', 'fallbackEnabled', 'requestLog', 'foodCache',
] as const;

function getDataSnapshot(state: AIState): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    for (const key of DATA_KEYS) { data[key] = state[key]; }
    return data;
}

function autoSave(get: () => AIState) {
    const state = get();
    if (state._uid) saveToFirestore(state._uid, 'ai_settings', getDataSnapshot(state));
}

export const useAIStore = create<AIState>()((set, get) => ({
    _uid: null,

    // Initial state
    apiKeys: [],
    dailyTokenBudget: 1_000_000,
    todayTokensUsed: 0,
    totalTokensUsed: 0,
    preferredModel: 'gemini-2.5-flash',
    fallbackEnabled: true,
    requestLog: [],
    foodCache: {},

    // Firestore
    loadData: async (userUid) => {
        set({ _uid: userUid });
        const data = await loadFromFirestore(userUid, 'ai_settings');
        if (data) {
            const patch: Record<string, unknown> = {};
            for (const key of DATA_KEYS) {
                if (data[key] !== undefined) patch[key] = data[key];
            }
            set(patch as Partial<AIState>);
        }
    },

    // API key management
    addApiKey: (key, label) => {
        set((s) => ({
            apiKeys: [...s.apiKeys, { key, label, enabled: true, tokensUsedToday: 0, lastResetDate: today() }],
        }));
        autoSave(get);
    },

    removeApiKey: (key) => {
        set((s) => ({ apiKeys: s.apiKeys.filter((k) => k.key !== key) }));
        autoSave(get);
    },

    toggleApiKey: (key) => {
        set((s) => ({
            apiKeys: s.apiKeys.map((k) => (k.key === key ? { ...k, enabled: !k.enabled } : k)),
        }));
        autoSave(get);
    },

    // Token budget
    setDailyTokenBudget: (budget) => { set({ dailyTokenBudget: budget }); autoSave(get); },

    // Model preference
    setPreferredModel: (model) => { set({ preferredModel: model }); autoSave(get); },
    setFallbackEnabled: (enabled) => { set({ fallbackEnabled: enabled }); autoSave(get); },

    // Request logging
    logRequest: (entry) => {
        set((s) => ({
            requestLog: [{ ...entry, timestamp: Date.now() }, ...s.requestLog].slice(0, 100),
        }));
        autoSave(get);
    },

    // Food cache
    getCachedFood: (name) => {
        const key = normalizeKey(name);
        return get().foodCache[key] ?? null;
    },

    cacheFood: (data) => {
        set((s) => ({
            foodCache: {
                ...s.foodCache,
                [normalizeKey(data.name)]: { ...data, timestamp: Date.now() },
            },
        }));
        autoSave(get);
    },

    getFoodCacheStats: () => {
        const cache = Object.values(get().foodCache);
        return {
            count: cache.length,
            aiCount: cache.filter((f) => f.source === 'ai').length,
            dbCount: cache.filter((f) => f.source === 'database').length,
        };
    },

    // Token usage
    addTokenUsage: (input, output, keyIndex) => {
        const total = input + output;
        set((s) => {
            const currentDate = today();
            // Auto-reset if new day
            const todayTokens = s.requestLog.length > 0 &&
                format(new Date(s.requestLog[0]?.timestamp ?? 0), 'yyyy-MM-dd') !== currentDate
                ? total
                : s.todayTokensUsed + total;

            const keys = s.apiKeys.map((k, i) => {
                if (i !== keyIndex) return k;
                const resetNeeded = k.lastResetDate !== currentDate;
                return {
                    ...k,
                    tokensUsedToday: resetNeeded ? total : k.tokensUsedToday + total,
                    lastResetDate: currentDate,
                };
            });

            return {
                todayTokensUsed: todayTokens,
                totalTokensUsed: s.totalTokensUsed + total,
                apiKeys: keys,
            };
        });
        autoSave(get);
    },

    getTokenUsage: () => {
        const s = get();
        const remaining = Math.max(0, s.dailyTokenBudget - s.todayTokensUsed);
        return {
            today: s.todayTokensUsed,
            limit: s.dailyTokenBudget,
            remaining,
            percentage: Math.round((s.todayTokensUsed / s.dailyTokenBudget) * 100),
        };
    },

    resetDailyTokens: () => {
        set((s) => ({
            todayTokensUsed: 0,
            apiKeys: s.apiKeys.map((k) => ({ ...k, tokensUsedToday: 0, lastResetDate: today() })),
        }));
        autoSave(get);
    },

    // Availability check
    isAIAvailable: () => {
        const s = get();
        // Check user-added store keys OR numbered env keys OR legacy single key
        let hasKeys = s.apiKeys.some((k) => k.enabled) || !!import.meta.env.VITE_GEMINI_API_KEY;
        if (!hasKeys) {
            for (let i = 1; i <= 16; i++) {
                if (import.meta.env[`VITE_GEMINI_API_KEY_${i}`]) {
                    hasKeys = true;
                    break;
                }
            }
        }
        const hasTokenBudget = s.todayTokensUsed < s.dailyTokenBudget;
        return hasKeys && hasTokenBudget;
    },

    clearAllData: () => set({
        _uid: null,
        apiKeys: [],
        dailyTokenBudget: 1_000_000,
        todayTokensUsed: 0,
        totalTokensUsed: 0,
        preferredModel: 'gemini-2.5-flash',
        fallbackEnabled: true,
        requestLog: [],
        foodCache: {},
    }),
}));
