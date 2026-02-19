import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getLevelFromXP, ACHIEVEMENTS } from '../lib/achievements';
import { format } from 'date-fns';

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
}

interface AetherState {
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

    // Data
    quests: Quest[];
    journal: JournalEntry[];
    chatHistory: ChatMessage[];
    mealHistory: MealLog[];
    hpHistory: HPHistory[];

    // Loading
    isAILoading: boolean;

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
    exportData: () => string;
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

export const useAetherStore = create<AetherState>()(
    persist(
        (set, get) => ({
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

            // Profile
            setProfile: (profile) => set({ profile }),
            completeOnboarding: () => set({ onboardingComplete: true }),

            // Stats
            setHP: (val) => set({ hp: clamp(val, 0, 100) }),
            setMana: (val) => set({ mana: clamp(val, 0, 100) }),
            addXP: (amount) => {
                const state = get();
                const newXP = state.xp + amount;
                const newLevel = getLevelFromXP(newXP);
                set({ xp: newXP, level: newLevel });
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
            addQuest: (quest) => set((s) => ({ quests: [...s.quests, quest] })),
            updateQuestProgress: (questId, progress) => set((s) => ({
                quests: s.quests.map((q) =>
                    q.id === questId ? { ...q, progress: Math.min(progress, q.target) } : q
                ),
            })),
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
            },
            setAILoading: (isAILoading) => set({ isAILoading }),
            clearChat: () => set({ chatHistory: [] }),

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
                }
                return newlyUnlocked;
            },

            // Data
            resetProgress: () => set({
                hp: 75, mana: 40, xp: 0, level: 1, streak: 0,
                mealsLogged: 0, questsCompleted: 0, daysActive: 0,
                unlockedAchievements: [], quests: [], journal: [],
                chatHistory: [], mealHistory: [], hpHistory: [],
                lastActiveDate: '',
            }),
            exportData: () => JSON.stringify(get(), null, 2),
        }),
        {
            name: 'aether-vitality-store',
        }
    )
);
