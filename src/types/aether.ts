import { PackageTier } from '../constants/packages';

export interface UserProfile {
    name: string;
    avatar: string;
    healthGoal: 'liver' | 'anxiety' | 'discipline';
    difficulty: 'casual' | 'committed' | 'ascendant';
    isPublic?: boolean;
    bio?: string;
    heightCm?: number;
    weightKg?: number;
    targetWeightKg?: number;
    age?: number;
    gender?: 'male' | 'female';
    activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    packageTier?: PackageTier;
    guildId?: string;
    subscriptionTier?: string;
    createdAt?: number;
}

export interface MealLog {
    id: string;
    meal: string;
    timestamp: number;
    hpImpact: number;
    advice: string; // Match store usage
    nutrition?: {
        calories: number;
        sugar: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber: number;
        healthScore: number;
    };
}

export interface JournalEntry {
    id: string;
    entry: string;
    date: string;
    mood: string;
    hpAtTime: number;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    id?: string;
    timestamp?: number;
    tokensUsed?: number;
    gameUpdates?: {
        hp?: number;
        mana?: number;
        xp?: number;
    };
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    type: 'daily' | 'special' | 'achievement';
    target: number;
    progress: number;
    completed: boolean;
    rewardXP: number;
    rewardCoins: number;
    icon: string;
}

export interface Boost {
    id: string;
    type: 'xp' | 'mana' | 'hp' | 'coin';
    multiplier: number;
    expiresAt: number;
}

export interface ExpPopup {
    id: number; // Changed to number to match store
    amount: number;
    x: number;
    y: number;
}

export interface AetherState {
    _uid: string | null;
    profile: UserProfile | null;
    onboardingComplete: boolean;
    hp: number;
    mana: number;
    xp: number;
    level: number;
    streak: number;
    lastActiveDate: string;
    mealsLogged: number;
    questsCompleted: number;
    daysActive: number;
    unlockedAchievements: string[];
    quests: Quest[];
    journal: JournalEntry[];
    chatHistory: ChatMessage[];
    mealHistory: MealLog[];
    hpHistory: any[];
    isAILoading: boolean;
    coins: number;
    inventory: string[]; // Changed to string[] to match store
    equipped: {
        theme: string;
        frame: string;
        title: string;
        banner: string;
        effect: string;
    };
    activeBoosts: Boost[];
    aiTokens: number;
    maxAiTokens: number;
    lastTokenRefill: number;
    seenTutorials: string[];
    widgetStates: Record<string, { minimized: boolean }>;
    collapsedNavGroups: Record<string, boolean>;
    following: string[];
    followers: string[];
    friends: string[];
    pendingFriends: string[];
    ratings: Record<string, number>;
    expPopups: ExpPopup[];

    // Actions
    loadData: (userUid: string) => Promise<void>;
    setProfile: (profile: any) => void;
    completeOnboarding: () => void;
    setHP: (val: number) => void;
    setMana: (val: number) => void;
    addXP: (amount: number) => void;
    logMeal: (meal: string, hpImpact: number, advice: string) => void;
    addQuest: (quest: any) => void;
    updateQuestProgress: (questId: string, progress: number) => void;
    completeQuest: (questId: string) => void;
    generateDailyQuests: () => void;
    addJournalEntry: (entry: string, mood: string) => void;
    addChatMessage: (message: any) => void;
    setAILoading: (isAILoading: boolean) => void;
    clearChat: () => void;
    checkAchievements: () => string[];
    resetProgress: () => void;
    clearAllData: () => void;
    addCoins: (amount: number) => void;
    purchaseItem: (itemId: string) => boolean;
    equipItem: (itemId: string, category: string) => void;
    checkBoosts: () => void;
    spendAIToken: (amount?: number) => boolean;
    refillAITokens: (amount?: number) => void;
    buyAITokens: (amount: number, coinCost: number) => boolean;
    checkAndRefillDailyTokens: () => void;
    getTimeUntilNextRefill: () => number;
    followUser: (targetUid: string) => Promise<void>;
    unfollowUser: (targetUid: string) => Promise<void>;
    sendFriendRequest: (targetUid: string) => Promise<void>;
    acceptFriendRequest: (targetUid: string) => Promise<void>;
    declineFriendRequest: (targetUid: string) => Promise<void>;
    removeFriend: (targetUid: string) => Promise<void>;
    rateUser: (targetUid: string, rating: number) => Promise<void>;
    markTutorialSeen: (pageId: string) => void;
    toggleWidget: (widgetId: string) => void;
    toggleNavGroup: (label: string) => void;
    clearExpPopup: (id: number) => void;
    exportData: () => string;
    updateStreak: () => void;
}
