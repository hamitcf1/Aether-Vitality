import { create } from 'zustand';
import { getLevelFromXP, ACHIEVEMENTS } from '../lib/achievements';
import { format } from 'date-fns';
import { saveToFirestore, saveToFirestoreImmediate, loadFromFirestore } from '../lib/firestoreSync';
import { SHOP_ITEMS } from '../lib/ShopData';

// ── Types ──
export interface Quest {
    id: string;
    title: string;
    description: string;
    type: 'daily' | 'expedition';
    progress: number;
    target: number;
    rewardXP: number;
    completed: boolean;
    icon: string;
}

export interface JournalEntry {
    id: string;
    date: string;
    entry: string;
    mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
    hpAtTime: number;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    gameUpdates?: { hp?: number; mana?: number; xp?: number };
}

export interface MealLog {
    id: string;
    meal: string;
    timestamp: number;
    hpImpact: number;
    advice: string;
}

export interface HPHistory {
    date: string;
    hp: number;
}

export interface UserProfile {
    name: string;
    avatar: string;
    healthGoal: 'liver' | 'anxiety' | 'discipline';
    difficulty: 'casual' | 'committed' | 'ascendant';
    createdAt: number;
    heightCm?: number;
    weightKg?: number;
    age?: number;
    gender?: 'male' | 'female';
    activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    targetWeightKg?: number;
    guildId?: string;
}

export interface EquippedItems {
    theme: string;
    frame: string;
}

export interface ActiveBoost {
    id: string;
    expiresAt: number;
    multiplier: number;
    type: 'xp' | 'coin';
}

interface AetherState {
    // Internal
    _uid: string | null;

    // Profile
    profile: UserProfile | null;
    onboardingComplete: boolean;

    // Stats
    hp: number;
    mana: number;
    xp: number;
    level: number;
    streak: number;
    lastActiveDate: string;

    // Tracking
    mealsLogged: number;
    questsCompleted: number;
    daysActive: number;
    unlockedAchievements: string[];
    coins: number;
    inventory: string[];
    equipped: EquippedItems;
    activeBoosts: ActiveBoost[];

    // Data
    quests: Quest[];
    journal: JournalEntry[];
    chatHistory: ChatMessage[];
    mealHistory: MealLog[];
    hpHistory: HPHistory[];

    // Loading
    isAILoading: boolean;

    // Actions — Firestore
    loadData: (uid: string) => Promise<void>;

    // Actions — Profile
    setProfile: (profile: UserProfile) => void;
    completeOnboarding: () => void;

    // Actions — Stats
    setHP: (val: number) => void;
    setMana: (val: number) => void;
    addXP: (amount: number) => void;
    updateStreak: () => void;

    // Actions — Logging
    logMeal: (meal: string, hpImpact: number, advice: string) => void;

    // Actions — Quests
    addQuest: (quest: Quest) => void;
    updateQuestProgress: (questId: string, progress: number) => void;
    completeQuest: (questId: string) => void;
    generateDailyQuests: () => void;

    // Actions — Journal
    addJournalEntry: (entry: string, mood: JournalEntry['mood']) => void;

    // Actions — Chat
    addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
    setAILoading: (loading: boolean) => void;
    clearChat: () => void;

    // Actions — Achievements
    checkAchievements: () => string[];

    // Actions — Data
    resetProgress: () => void;
    clearAllData: () => void;
    exportData: () => string;

    // Actions — Economy
    addCoins: (amount: number) => void;
    purchaseItem: (itemId: string) => boolean;
    equipItem: (itemId: string, category: 'theme' | 'frame') => void;
    checkBoosts: () => void;
}

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));
const uid = () => Math.random().toString(36).slice(2, 10);

const DAILY_QUESTS_POOL: Omit<Quest, 'id' | 'completed' | 'progress'>[] = [
    { title: 'Substance Analysis', description: 'Log 3 meals today', type: 'daily', target: 3, rewardXP: 30, icon: '🧪' },
    { title: 'Hydration Protocol', description: 'Drink 8 glasses of water', type: 'daily', target: 8, rewardXP: 25, icon: '💧' },
    { title: 'The Shore Patrol', description: 'Walk 5,000 steps', type: 'daily', target: 5000, rewardXP: 40, icon: '🚶' },
    { title: 'Mindful Minute', description: 'Meditate for 10 minutes', type: 'daily', target: 10, rewardXP: 35, icon: '🧘' },
    { title: 'Consult the Oracle', description: 'Ask the Alchemist for advice', type: 'daily', target: 1, rewardXP: 15, icon: '🔮' },
    { title: 'Journal Entry', description: 'Write in your journal', type: 'daily', target: 1, rewardXP: 20, icon: '📝' },
    { title: 'Early Riser', description: 'Log a meal before 9 AM', type: 'daily', target: 1, rewardXP: 25, icon: '🌅' },
    { title: 'Green Elixir', description: 'Eat a vegetable-based meal', type: 'daily', target: 1, rewardXP: 20, icon: '🥗' },
];

// Keys to persist to Firestore (exclude actions and internal fields)
const DATA_KEYS = [
    'profile', 'onboardingComplete', 'hp', 'mana', 'xp', 'level', 'streak',
    'lastActiveDate', 'mealsLogged', 'questsCompleted', 'daysActive',
    'unlockedAchievements', 'quests', 'journal', 'chatHistory', 'mealHistory',
    'unlockedAchievements', 'quests', 'journal', 'chatHistory', 'mealHistory',
    'hpHistory', 'coins', 'inventory', 'equipped', 'activeBoosts',
] as const;

function getDataSnapshot(state: AetherState): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    for (const key of DATA_KEYS) {
        data[key] = state[key];
    }
    return data;
}

/** Auto-save helper — call after any mutation */
function autoSave(get: () => AetherState) {
    const state = get();
    if (state._uid) {
        saveToFirestore(state._uid, 'aether', getDataSnapshot(state));
    }
}

export const useAetherStore = create<AetherState>()((set, get) => ({
    // Internal
    _uid: null,

    // Initial state
    profile: null,
    onboardingComplete: false,
    hp: 75,
    mana: 40,
    xp: 0,
    level: 1,
    streak: 0,
    lastActiveDate: '',
    mealsLogged: 0,
    questsCompleted: 0,
    daysActive: 0,
    unlockedAchievements: [],
    quests: [],
    journal: [],
    chatHistory: [],
    mealHistory: [],
    hpHistory: [],
    isAILoading: false,
    coins: 0,
    inventory: [],
    equipped: { theme: 'default', frame: 'none' },
    activeBoosts: [],

    // Firestore
    loadData: async (userUid) => {
        set({ _uid: userUid });
        const data = await loadFromFirestore(userUid, 'aether');
        if (data) {
            // Only apply known data keys
            const patch: Record<string, unknown> = {};
            for (const key of DATA_KEYS) {
                if (data[key] !== undefined) patch[key] = data[key];
            }

            // Backfill coins for legacy users
            // If xp > 0 but coins is undefined (or 0 and not explicitly set to 0? tricky. Assume undefined means new feature)
            // But Firestore load returns existing data. If coins is missing there, it's undefined.
            // Let's use a safe check: if coins is undefined in valid data, backfill.
            const currentXP = (data.xp as number) || 0;
            if (data.coins === undefined && currentXP > 0) {
                patch.coins = Math.floor(currentXP * 0.5);
                patch.inventory = [];
                patch.equipped = { theme: 'default', frame: 'none' };
            }

            set(patch as Partial<AetherState>);
        }
    },

    // Profile
    setProfile: (profile) => {
        set({ profile });
        // Use immediate save — profile set during onboarding must persist
        const state = get();
        if (state._uid) saveToFirestoreImmediate(state._uid, 'aether', getDataSnapshot(state));
    },
    completeOnboarding: () => {
        set({ onboardingComplete: true });
        // CRITICAL: must save immediately — navigating away would lose the debounced write
        const state = get();
        if (state._uid) saveToFirestoreImmediate(state._uid, 'aether', getDataSnapshot(state));
    },

    // Stats
    setHP: (val) => { set({ hp: clamp(val, 0, 100) }); autoSave(get); },
    setMana: (val) => { set({ mana: clamp(val, 0, 100) }); autoSave(get); },
    addXP: (amount) => {
        const state = get();

        // Check for active XP boosts
        const xpBoost = state.activeBoosts.find(b => b.type === 'xp' && b.expiresAt > Date.now());
        const finalXP = xpBoost ? amount * xpBoost.multiplier : amount;

        const newXP = state.xp + finalXP;
        const newLevel = getLevelFromXP(newXP);

        // Coin logic: 1 Coin per 1 XP (base)
        // Check for coin boosts
        const coinBoost = state.activeBoosts.find(b => b.type === 'coin' && b.expiresAt > Date.now());
        const coinAmount = coinBoost ? finalXP * coinBoost.multiplier : finalXP; // Base exchange 1:1

        set({ xp: newXP, level: newLevel });
        get().addCoins(Math.floor(coinAmount));
    },
    updateStreak: () => {
        const state = get();
        const today = format(new Date(), 'yyyy-MM-dd');
        if (state.lastActiveDate === today) return;

        const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
        const newStreak = state.lastActiveDate === yesterday ? state.streak + 1 : 1;
        const newDaysActive = state.daysActive + 1;

        // Record HP history
        const newHPHistory = [...state.hpHistory, { date: today, hp: state.hp }].slice(-30);

        set({
            streak: newStreak,
            lastActiveDate: today,
            daysActive: newDaysActive,
            hpHistory: newHPHistory,
        });
        autoSave(get);
    },

    // Logging
    logMeal: (meal, hpImpact, advice) => {
        const state = get();
        const newHP = clamp(state.hp + hpImpact, 0, 100);
        const newMana = clamp(state.mana + 3, 0, 100);
        const log: MealLog = { id: uid(), meal, timestamp: Date.now(), hpImpact, advice };

        set({
            hp: newHP,
            mana: newMana,
            mealsLogged: state.mealsLogged + 1,
            mealHistory: [log, ...state.mealHistory].slice(0, 100),
        });

        // Auto XP
        get().addXP(10 + Math.abs(hpImpact));
        get().updateStreak();
    },

    // Quests
    addQuest: (quest) => { set((s) => ({ quests: [...s.quests, quest] })); autoSave(get); },
    updateQuestProgress: (questId, progress) => {
        set((s) => ({
            quests: s.quests.map((q) =>
                q.id === questId ? { ...q, progress: Math.min(progress, q.target) } : q
            ),
        }));
        autoSave(get);
    },
    completeQuest: (questId) => {
        const state = get();
        const quest = state.quests.find((q) => q.id === questId);
        if (!quest || quest.completed) return;

        set((s) => ({
            quests: s.quests.map((q) => q.id === questId ? { ...q, completed: true, progress: q.target } : q),
            questsCompleted: s.questsCompleted + 1,
        }));
        get().addXP(quest.rewardXP);
    },
    generateDailyQuests: () => {
        const state = get();
        const today = format(new Date(), 'yyyy-MM-dd');
        const hasTodayQuests = state.quests.some((q) => q.type === 'daily' && q.id.startsWith(today));
        if (hasTodayQuests) return;

        // Pick 3 random daily quests
        const shuffled = [...DAILY_QUESTS_POOL].sort(() => Math.random() - 0.5);
        const picked = shuffled.slice(0, 3).map((q) => ({
            ...q,
            id: `${today}-${uid()}`,
            progress: 0,
            completed: false,
        }));
        set((s) => ({
            quests: [...picked, ...s.quests.filter((q) => q.type !== 'daily' || !q.completed)],
        }));
        autoSave(get);
    },

    // Journal
    addJournalEntry: (entry, mood) => {
        const newEntry: JournalEntry = {
            id: uid(),
            date: format(new Date(), 'yyyy-MM-dd HH:mm'),
            entry,
            mood,
            hpAtTime: get().hp,
        };
        set((s) => ({ journal: [newEntry, ...s.journal].slice(0, 200) }));
        get().addXP(15);
    },

    // Chat
    addChatMessage: (message) => {
        const newMessage: ChatMessage = { ...message, id: uid(), timestamp: Date.now() };
        set((s) => ({ chatHistory: [...s.chatHistory, newMessage] }));

        if (message.gameUpdates) {
            const u = message.gameUpdates;
            if (u.hp) get().setHP(get().hp + u.hp);
            if (u.mana) get().setMana(get().mana + u.mana);
            if (u.xp) get().addXP(u.xp);
        }
        autoSave(get);
    },
    setAILoading: (isAILoading) => set({ isAILoading }),
    clearChat: () => { set({ chatHistory: [] }); autoSave(get); },

    // Achievements
    checkAchievements: () => {
        const state = get();
        const stats = {
            mealsLogged: state.mealsLogged,
            questsCompleted: state.questsCompleted,
            daysActive: state.daysActive,
            level: state.level,
            streak: state.streak,
            chatMessages: state.chatHistory.filter((m) => m.role === 'user').length,
        };
        const newlyUnlocked: string[] = [];
        for (const ach of ACHIEVEMENTS) {
            if (!state.unlockedAchievements.includes(ach.id) && ach.condition(stats)) {
                newlyUnlocked.push(ach.id);
            }
        }
        if (newlyUnlocked.length > 0) {
            set({ unlockedAchievements: [...state.unlockedAchievements, ...newlyUnlocked] });
            autoSave(get);
        }
        return newlyUnlocked;
    },

    // Data
    resetProgress: () => {
        set({
            hp: 75, mana: 40, xp: 0, level: 1, streak: 0,
            mealsLogged: 0, questsCompleted: 0, daysActive: 0,
            unlockedAchievements: [], quests: [], journal: [],
            chatHistory: [], mealHistory: [], hpHistory: [],
            lastActiveDate: '',
        });
        autoSave(get);
    },
    clearAllData: () => set({
        _uid: null,
        profile: null, onboardingComplete: false,
        hp: 75, mana: 40, xp: 0, level: 1, streak: 0,
        mealsLogged: 0, questsCompleted: 0, daysActive: 0,
        unlockedAchievements: [], quests: [], journal: [],
        chatHistory: [], mealHistory: [], hpHistory: [],
        lastActiveDate: '', isAILoading: false,
    }),
    exportData: () => JSON.stringify(get(), null, 2),

    // Economy
    addCoins: (amount) => {
        set(s => ({ coins: s.coins + amount }));
        autoSave(get);
    },
    purchaseItem: (itemId) => {
        const state = get();
        const item = SHOP_ITEMS.find(i => i.id === itemId);

        if (!item) return false;

        // Check ownership only for non-consumables
        const isConsumable = item.category === 'boost' || item.category === 'utility';
        if (!isConsumable && state.inventory.includes(itemId)) return false;

        if (state.coins < item.cost) return false; // Too poor

        const newCoins = state.coins - item.cost;
        let newInventory = state.inventory;

        // Only add non-consumables (and unique utility items like streak freeze if we want to limit them) to inventory
        // For now, let's treat Streak Freeze as stackable logic but simplistic inventory:
        // If I want to allow buying multiple streak freezes, I need a count.
        // Current system: inventory is string[]. uniqueness is checked.
        // So Streak Freeze is unique. ONE at a time.
        // Boosts are consumable immediately, so NOT in inventory.

        if (item.category !== 'boost') {
            // Themes, Cosmetics, and Streak Freeze (if we want max 1)
            // If streak freeze is consumable, we should allow buying it again if we don't have one?
            // Logic above `if (!isConsumable && state.inventory.includes(itemId))` handles "Max 1".
            // So if I have a streak freeze, I can't buy another.
            // That's fine for MVP.
            newInventory = [...state.inventory, itemId];
        }

        let newBoosts = state.activeBoosts;
        if (item.category === 'boost' && item.durationHours) {
            const type = item.id.includes('xp') ? 'xp' : 'coin';
            const multiplier = item.id.includes('xp') ? 2 : 1.5;
            newBoosts = [...state.activeBoosts, {
                id: uid(),
                type: type as 'xp' | 'coin',
                multiplier,
                expiresAt: Date.now() + (item.durationHours * 3600000)
            }];
        }

        set({ coins: newCoins, inventory: newInventory, activeBoosts: newBoosts });
        autoSave(get);
        return true;
    },
    equipItem: (itemId, category) => {
        const state = get();
        // Verify ownership
        if (!state.inventory.includes(itemId) && itemId !== 'default') return;

        const item = SHOP_ITEMS.find(i => i.id === itemId);
        // Allow equipping 'default' to reset
        if (itemId === 'default') {
            set(s => ({ equipped: { ...s.equipped, [category]: 'default' } }));
            autoSave(get);
            return;
        }

        if (item && (item.category === 'theme' || category === 'theme')) {
            set(s => ({ equipped: { ...s.equipped, theme: item.value || 'default' } }));
        }
        autoSave(get);
    },
    checkBoosts: () => {
        const state = get();
        const now = Date.now();
        if (state.activeBoosts.some(b => b.expiresAt < now)) {
            set({ activeBoosts: state.activeBoosts.filter(b => b.expiresAt > now) });
            autoSave(get);
        }
    }
}));
