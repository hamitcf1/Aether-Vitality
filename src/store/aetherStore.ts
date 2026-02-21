import { create } from 'zustand';
import { getLevelFromXP, ACHIEVEMENTS } from '../lib/achievements';
import { format } from 'date-fns';
import {
    saveToFirestore, saveToFirestoreImmediate, loadFromFirestore,
    syncToLeaderboard, removeFromLeaderboard
} from '../lib/firestoreSync';
import { SHOP_ITEMS } from '../lib/ShopData';
import { db } from '../lib/firebase';
import {
    doc, updateDoc, arrayUnion, arrayRemove
} from 'firebase/firestore';
import { useAuthStore } from './authStore';

import type {
    AetherState,
    MealLog,
    JournalEntry,
    ChatMessage
} from '../types/aether';

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));
const uid = () => Math.random().toString(36).substring(2, 9);

const DAILY_QUESTS_POOL = [
    { title: 'Hydration Ritual', description: 'Log 8 glasses of water', type: 'daily', target: 8, rewardXP: 50, rewardCoins: 25, icon: '💧' },
    { title: 'Mindful Breathing', description: 'Complete 5 mins of meditation', type: 'daily', target: 1, rewardXP: 30, rewardCoins: 15, icon: '🧘' },
    { title: 'Oracle\'s Insight', description: 'Talk to the Alchemist', type: 'daily', target: 1, rewardXP: 25, rewardCoins: 10, icon: '🔮' },
    { title: 'Nourishment Log', description: 'Log 3 balanced meals', type: 'daily', target: 3, rewardXP: 45, rewardCoins: 20, icon: '🍎' },
    { title: 'Morning Stretch', description: 'Log a morning activity', type: 'daily', target: 1, rewardXP: 20, rewardCoins: 10, icon: '☀️' },
    { title: 'Consult the Oracle', description: 'Ask the Alchemist for advice', type: 'daily', target: 1, rewardXP: 15, rewardCoins: 5, icon: '🔮' },
    { title: 'Journal Entry', description: 'Write in your journal', type: 'daily', target: 1, rewardXP: 20, rewardCoins: 10, icon: '📝' },
    { title: 'Early Riser', description: 'Log a meal before 9 AM', type: 'daily', target: 1, rewardXP: 25, rewardCoins: 15, icon: '🌅' },
    { title: 'Green Elixir', description: 'Eat a vegetable-based meal', type: 'daily', target: 1, rewardXP: 20, rewardCoins: 10, icon: '🥗' },
];

const DATA_KEYS = [
    'profile', 'onboardingComplete', 'hp', 'mana', 'xp', 'level', 'streak',
    'lastActiveDate', 'mealsLogged', 'questsCompleted', 'daysActive',
    'unlockedAchievements', 'quests', 'journal', 'chatHistory', 'mealHistory',
    'hpHistory', 'coins', 'inventory', 'equipped', 'activeBoosts',
    'aiTokens', 'maxAiTokens', 'lastTokenRefill', 'seenTutorials', 'widgetStates',
    'following', 'followers', 'friends', 'pendingFriends', 'ratings'
] as const;

function getDataSnapshot(state: AetherState): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    for (const key of DATA_KEYS) {
        data[key] = (state as any)[key];
    }
    return data;
}

function autoSave(get: () => AetherState) {
    const state = get();
    if (state._uid) {
        saveToFirestore(state._uid, 'aether', getDataSnapshot(state));
        if (state.profile?.isPublic !== false) {
            syncToLeaderboard(state._uid, {
                name: state.profile?.name || 'Unknown',
                avatar: state.profile?.avatar || '🧙',
                level: state.level,
                xp: state.xp,
                title: state.equipped?.title || 'Novice',
            });
        } else {
            removeFromLeaderboard(state._uid);
        }
    }
}

export const useAetherStore = create<AetherState>()((set, get) => ({
    _uid: null,
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
    equipped: { theme: 'default', frame: 'none', title: 'Novice' },
    activeBoosts: [],
    aiTokens: 10,
    maxAiTokens: 10,
    lastTokenRefill: 0,
    seenTutorials: [],
    widgetStates: {},
    following: [],
    followers: [],
    friends: [],
    pendingFriends: [],
    ratings: {},
    expPopups: [],

    loadData: async (userUid: string) => {
        set({ _uid: userUid });
        const data = await loadFromFirestore(userUid, 'aether') as any;
        if (data) {
            const patch: any = {};
            for (const key of DATA_KEYS) {
                if (data[key] !== undefined) patch[key] = data[key];
            }
            if (data.coins === undefined && (data.xp || 0) > 0) {
                patch.coins = Math.floor((data.xp as number) * 0.5);
                patch.inventory = [];
            }
            if (!data.equipped) patch.equipped = { theme: 'default', frame: 'none', title: 'Novice' };
            if (data.aiTokens === undefined) {
                patch.aiTokens = 10;
                patch.maxAiTokens = 10;
                patch.lastTokenRefill = Date.now();
            }
            set(patch);
        }
    },

    setProfile: (profile: any) => {
        set({ profile });
        const state = get();
        if (state._uid) saveToFirestoreImmediate(state._uid, 'aether', getDataSnapshot(state));
    },

    completeOnboarding: () => {
        set({ onboardingComplete: true });
        const state = get();
        if (state._uid) saveToFirestoreImmediate(state._uid, 'aether', getDataSnapshot(state));
    },

    setHP: (val: number) => { set({ hp: clamp(val, 0, 100) }); autoSave(get); },
    setMana: (val: number) => { set({ mana: clamp(val, 0, 100) }); autoSave(get); },

    addXP: (amount: number) => {
        const state = get();
        const xpBoost = state.activeBoosts.find((b: any) => b.type === 'xp' && b.expiresAt > Date.now());
        const finalXP = xpBoost ? amount * xpBoost.multiplier : amount;
        let streakMultiplier = 1.0;
        if (state.streak >= 90) streakMultiplier = 2.0;
        else if (state.streak >= 60) streakMultiplier = 1.75;
        else if (state.streak >= 30) streakMultiplier = 1.5;
        else if (state.streak >= 7) streakMultiplier = 1.25;
        else if (state.streak >= 3) streakMultiplier = 1.1;

        const totalXPAdd = Math.floor(finalXP * streakMultiplier);
        const newXP = state.xp + totalXPAdd;
        const newLevel = getLevelFromXP(newXP);
        const currentLevel = state.level;

        const newPopup = {
            id: Date.now() + Math.random(),
            amount: totalXPAdd,
            x: window.innerWidth / 2 + (Math.random() * 200 - 100),
            y: window.innerHeight / 2 + (Math.random() * 200 - 100)
        };

        set({ xp: newXP, level: newLevel, expPopups: [...state.expPopups, newPopup] });
        get().addCoins(totalXPAdd);

        if (newLevel > currentLevel) {
            // Level up...
        }
        autoSave(get);
    },

    updateStreak: () => {
        const state = get();
        const today = format(new Date(), 'yyyy-MM-dd');
        if (state.lastActiveDate === today) return;
        const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
        const newStreak = state.lastActiveDate === yesterday ? state.streak + 1 : 1;
        const newDaysActive = state.daysActive + 1;
        set({ streak: newStreak, lastActiveDate: today, daysActive: newDaysActive });
        autoSave(get);
    },

    logMeal: (meal: string, hpImpact: number, advice: string) => {
        const state = get();
        const log: MealLog = { id: uid(), meal, timestamp: Date.now(), hpImpact, advice };
        set({
            hp: clamp(state.hp + hpImpact, 0, 100),
            mana: clamp(state.mana + 3, 0, 100),
            mealsLogged: state.mealsLogged + 1,
            mealHistory: [log, ...state.mealHistory].slice(0, 100)
        });
        get().addXP(10 + Math.abs(hpImpact));
        get().updateStreak();
    },

    addQuest: (quest: any) => { set((s: AetherState) => ({ quests: [...s.quests, quest] })); autoSave(get); },
    updateQuestProgress: (questId: string, progress: number) => {
        set((s: AetherState) => ({
            quests: s.quests.map((q: any) => q.id === questId ? { ...q, progress: Math.min(progress, q.target) } : q)
        }));
        autoSave(get);
    },
    completeQuest: (questId: string) => {
        const state = get();
        const quest = state.quests.find((q: any) => q.id === questId);
        if (!quest || quest.completed) return;
        set((s: AetherState) => ({
            quests: s.quests.map((q: any) => q.id === questId ? { ...q, completed: true, progress: q.target } : q),
            questsCompleted: s.questsCompleted + 1
        }));
        get().addXP(quest.rewardXP);
        if (quest.rewardCoins) get().addCoins(quest.rewardCoins);
    },
    generateDailyQuests: () => {
        const state = get() as any;
        const today = format(new Date(), 'yyyy-MM-dd');

        // Filter out completed daily quests from OTHER days
        const existingDailyForToday = state.quests.filter((q: any) => q.type === 'daily' && q.id.startsWith(today));

        if (existingDailyForToday.length >= 3) return;

        // If we have fewer than 3 daily quests for today (maybe none), generate more
        const needed = 3 - existingDailyForToday.length;
        const shuffled = [...DAILY_QUESTS_POOL]
            .filter(poolQuest => !existingDailyForToday.some((eq: any) => eq.title === poolQuest.title))
            .sort(() => Math.random() - 0.5);

        const picked = shuffled.slice(0, needed).map(q => ({
            ...q,
            id: `${today}-${uid()}`,
            progress: 0,
            completed: false
        }));

        set((s: any) => ({
            quests: [
                ...existingDailyForToday, // Keep today's existing quests
                ...picked,                // Add newly generated ones
                ...s.quests.filter((q: any) => q.type !== 'daily') // Keep non-daily quests (achievements etc)
            ]
        }));
        autoSave(get);
    },

    addJournalEntry: (entry: string, mood: string) => {
        const newEntry: JournalEntry = { id: uid(), date: format(new Date(), 'yyyy-MM-dd HH:mm'), entry, mood, hpAtTime: get().hp };
        set((s: AetherState) => ({ journal: [newEntry, ...s.journal].slice(0, 200) }));
        get().addXP(15);
    },

    addChatMessage: (message: any) => {
        const newMessage: ChatMessage = { ...message, id: uid(), timestamp: Date.now() };
        set((s: AetherState) => ({ chatHistory: [...s.chatHistory, newMessage] }));
        if (message.gameUpdates) {
            const u = message.gameUpdates;
            if (u.hp) get().setHP(get().hp + u.hp);
            if (u.mana) get().setMana(get().mana + u.mana);
            if (u.xp) get().addXP(u.xp);
        }
        autoSave(get);
    },
    setAILoading: (isAILoading: boolean) => set({ isAILoading }),
    clearChat: () => { set({ chatHistory: [] }); autoSave(get); },

    checkAchievements: () => {
        const state = get();
        const stats = {
            mealsLogged: state.mealsLogged,
            questsCompleted: state.questsCompleted,
            daysActive: state.daysActive,
            level: state.level,
            streak: state.streak,
            chatMessages: state.chatHistory.filter((m: any) => m.role === 'user').length
        };
        const newlyUnlocked = ACHIEVEMENTS.filter(ach => !state.unlockedAchievements.includes(ach.id) && ach.condition(stats)).map(a => a.id);
        if (newlyUnlocked.length > 0) {
            set({ unlockedAchievements: [...state.unlockedAchievements, ...newlyUnlocked] });
            autoSave(get);
        }
        return newlyUnlocked;
    },

    resetProgress: () => {
        set({ hp: 75, mana: 40, xp: 0, level: 1, streak: 0, mealsLogged: 0, questsCompleted: 0, daysActive: 0, unlockedAchievements: [], quests: [], journal: [], chatHistory: [], mealHistory: [], hpHistory: [], lastActiveDate: '' });
        autoSave(get);
    },
    clearAllData: () => set({ _uid: null, profile: null, onboardingComplete: false, hp: 75, mana: 40, xp: 0, level: 1, streak: 0, mealsLogged: 0, questsCompleted: 0, daysActive: 0, unlockedAchievements: [], quests: [], journal: [], chatHistory: [], mealHistory: [], hpHistory: [], lastActiveDate: '', isAILoading: false }),
    exportData: () => JSON.stringify(get(), null, 2),

    addCoins: (amount: number) => { set((s: AetherState) => ({ coins: s.coins + amount })); autoSave(get); },
    purchaseItem: (itemId: string) => {
        const state = get();
        const item = SHOP_ITEMS.find(i => i.id === itemId);
        if (!item || state.coins < item.cost) return false;
        const isConsumable = item.category === 'boost' || item.category === 'utility';
        if (!isConsumable && state.inventory.includes(itemId)) return false;

        const patch: any = { coins: state.coins - item.cost };
        if (item.category !== 'boost') patch.inventory = [...state.inventory, itemId];
        else if (item.durationHours) {
            const type = item.id.includes('xp') ? 'xp' : 'coin';
            patch.activeBoosts = [...state.activeBoosts, { id: uid(), type, multiplier: type === 'xp' ? 2 : 1.5, expiresAt: Date.now() + (item.durationHours * 3600000) }];
        }
        set(patch);
        autoSave(get);
        return true;
    },
    equipItem: (itemId: string, category: string) => {
        const state = get();
        if (category === 'title') {
            if (itemId === 'Novice' || state.unlockedAchievements.includes(itemId)) {
                set((s: AetherState) => ({ equipped: { ...s.equipped, title: itemId } }));
                autoSave(get);
            }
            return;
        }
        if (!state.inventory.includes(itemId) && itemId !== 'default') return;
        const item = SHOP_ITEMS.find(i => i.id === itemId);
        set((s: AetherState) => ({ equipped: { ...s.equipped, [category]: item?.value || 'default' } }));
        autoSave(get);
    },
    checkBoosts: () => {
        const state = get();
        const now = Date.now();
        if (state.activeBoosts.some((b: any) => b.expiresAt < now)) {
            set({ activeBoosts: state.activeBoosts.filter((b: any) => b.expiresAt > now) });
            autoSave(get);
        }
    },

    spendAIToken: (amount = 1) => {
        const state = get();
        if (state.aiTokens >= amount) { set({ aiTokens: state.aiTokens - amount }); autoSave(get); return true; }
        return false;
    },
    refillAITokens: (amount?: number) => {
        const state = get();
        const newTotal = amount ? state.aiTokens + amount : state.maxAiTokens;
        set({ aiTokens: Math.min(newTotal, state.maxAiTokens) });
        autoSave(get);
    },
    buyAITokens: (amount: number, coinCost: number) => {
        const state = get();
        if (state.coins >= coinCost) { set({ coins: state.coins - coinCost, aiTokens: state.aiTokens + amount }); autoSave(get); return true; }
        return false;
    },
    checkAndRefillDailyTokens: () => {
        const state = get();
        const today = new Date().setHours(0, 0, 0, 0);
        if (state.lastTokenRefill < today) {
            set({ aiTokens: state.maxAiTokens, lastTokenRefill: Date.now() });
            autoSave(get);
        }
    },
    getTimeUntilNextRefill: () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow.getTime() - Date.now();
    },

    followUser: async (targetUid: string) => {
        if (get().following.includes(targetUid)) return;
        set((s: AetherState) => ({ following: [...s.following, targetUid] }));
        autoSave(get);
    },
    unfollowUser: async (targetUid: string) => {
        set((s: AetherState) => ({ following: s.following.filter((id: string) => id !== targetUid) }));
        autoSave(get);
    },
    sendFriendRequest: async (targetUid: string) => {
        const user = useAuthStore.getState().user;
        if (!user || user.uid === targetUid) return;
        try {
            const targetRef = doc(db, 'users', targetUid, 'data', 'aether');
            await updateDoc(targetRef, { pendingFriends: arrayUnion(user.uid) });
        } catch (error) { console.error(error); }
    },
    acceptFriendRequest: async (targetUid: string) => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        try {
            const myRef = doc(db, 'users', user.uid, 'data', 'aether');
            const targetRef = doc(db, 'users', targetUid, 'data', 'aether');
            await updateDoc(myRef, { friends: arrayUnion(targetUid), pendingFriends: arrayRemove(targetUid) });
            await updateDoc(targetRef, { friends: arrayUnion(user.uid) });
            autoSave(get);
        } catch (error) { console.error(error); }
    },
    declineFriendRequest: async (targetUid: string) => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        try {
            const myRef = doc(db, 'users', user.uid, 'data', 'aether');
            await updateDoc(myRef, { pendingFriends: arrayRemove(targetUid) });
            autoSave(get);
        } catch (error) { console.error(error); }
    },
    removeFriend: async (targetUid: string) => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        try {
            const myRef = doc(db, 'users', user.uid, 'data', 'aether');
            const targetRef = doc(db, 'users', targetUid, 'data', 'aether');
            await updateDoc(myRef, { friends: arrayRemove(targetUid) });
            await updateDoc(targetRef, { friends: arrayRemove(user.uid) });
            autoSave(get);
        } catch (error) { console.error(error); }
    },
    rateUser: async (targetUid: string, rating: number) => {
        set((s: AetherState) => ({ ratings: { ...s.ratings, [targetUid]: rating } }));
        autoSave(get);
    },

    markTutorialSeen: (pageId: string) => {
        if (!get().seenTutorials.includes(pageId)) {
            set((s: AetherState) => ({ seenTutorials: [...s.seenTutorials, pageId] }));
            autoSave(get);
        }
    },
    toggleWidget: (widgetId: string) => {
        const current = get().widgetStates[widgetId]?.minimized || false;
        set((s: AetherState) => ({ widgetStates: { ...s.widgetStates, [widgetId]: { minimized: !current } } }));
        autoSave(get);
    },
    clearExpPopup: (id: number) => set((s: AetherState) => ({ expPopups: s.expPopups.filter((p: any) => p.id !== id) }))
}));
