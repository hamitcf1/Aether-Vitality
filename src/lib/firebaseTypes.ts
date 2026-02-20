import type { Gender, ActivityLevel } from './calorieCalculator';

// ── Shared Database Types ──

export interface UserProfileData {
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
    isPublic?: boolean;
    bio?: string;
}

export interface EquippedItemsData {
    theme: string;
    frame: string;
    title: string;
}

export interface ActiveBoostData {
    id: string;
    expiresAt: number;
    multiplier: number;
    type: 'xp' | 'coin';
}

export interface QuestData {
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

export interface JournalEntryData {
    id: string;
    date: string;
    entry: string;
    mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
    hpAtTime: number;
}

export interface ChatMessageData {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    gameUpdates?: { hp?: number; mana?: number; xp?: number };
}

export interface MealLogData {
    id: string;
    meal: string;
    timestamp: number;
    hpImpact: number;
    advice: string;
}

export interface HPHistoryData {
    date: string;
    hp: number;
}

// ── Aether Store Document ──
export interface AetherDocument {
    profile: UserProfileData;
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
    quests: QuestData[];
    journal: JournalEntryData[];
    chatHistory: ChatMessageData[];
    mealHistory: MealLogData[];
    hpHistory: HPHistoryData[];
    coins: number;
    inventory: string[];
    equipped: EquippedItemsData;
    activeBoosts: ActiveBoostData[];
}

// ── Trackers Store Document ──
export interface BodyMeasurementsData {
    neckCm: number;
    waistCm: number;
    hipCm: number;
    chestCm: number;
}

export interface BodyProfileData {
    heightCm: number;
    weightKg: number;
    age: number;
    gender: Gender;
    activityLevel: ActivityLevel;
    targetWeightKg: number;
    measurements?: BodyMeasurementsData;
}

export interface TrackersDocument {
    bodyProfile: BodyProfileData | null;
    waterUnit: 'ml' | 'cups' | 'bottles';
    waterLogs: { date: string; glasses: number; target: number }[];
    stepsLogs: { date: string; steps: number; target: number }[];
    sugarLogs: { date: string; grams: number; target: number }[];
    calorieLogs: {
        date: string; consumed: number; burned: number; target: number;
        foods: { foodId: string; name: string; emoji: string; calories: number; sugar: number; protein?: number; carbs?: number; fat?: number; servings: number; time: number }[];
    }[];
    weightLog: { date: string; weightKg: number }[];
    exerciseLogs: { id: string; date: string; activityId: string; name: string; emoji: string; durationMin: number; caloriesBurned: number; timestamp: number }[];
    habits: {
        id: string; name: string; type: 'smoking' | 'nofap' | 'custom';
        startDate: number | null; lastRelapse: number | null; resistedCount: number;
        relapseHistory: { date: string; timestamp: number; note?: string }[];
        settings?: { cigarettesPerDay?: number; costPerPack?: number; currency?: string; };
    }[];
    habitRelapses: unknown[]; // Deprecated field from old code
    sleepLogs: { date: string; durationHours: number; quality: number; wakeTime: string; }[];
    fasting: {
        active: boolean; startTime: number | null; endTime: number | null;
        plan: '16:8' | '18:6' | '20:4' | '14:10'; totalFastsCompleted: number;
        history: { date: string; durationHrs: number; plan: string }[];
    };
    unlockables: { id: string; title: string; description: string; icon: string; type: 'badge' | 'title' | 'theme'; requirement: string; unlocked: boolean; }[];
}


// ── Guild Documents ──
export interface GuildDocument {
    id: string;
    name: string;
    description: string;
    leaderId: string;
    leaderName: string;
    memberIds: string[];
    level: number;
    xp: number;
    privacy: 'public' | 'private';
    createdAt: string;
    theme: string;
}

export interface GuildMessageDocument {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: number;
    type: 'text' | 'system';
}

export interface RaidDocument {
    id: string;
    bossName: string;
    bossImage: string;
    totalHp: number;
    currentHp: number;
    level: number;
    status: 'active' | 'defeated' | 'failed';
    startTime: string;
    endTime: string;
    contributors: Record<string, number>;
}

// ── Global Leaderboard Document ──
export interface LeaderboardEntryData {
    name: string;
    avatar: string;
    level: number;
    xp: number;
    title: string;
}
