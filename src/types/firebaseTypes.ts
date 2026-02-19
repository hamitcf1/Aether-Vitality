/**
 * Firebase-Ready Type Definitions
 * 
 * These interfaces mirror the planned Firestore document structure.
 * Currently used with localStorage adapters; will swap to Firestore when ready.
 * 
 * Firestore Structure:
 *   users/{uid}                        → FirebaseUserProfile
 *   users/{uid}/trackers/{date}        → FirebaseDailyTracker
 *   users/{uid}/meals/{mealId}         → FirebaseMealLog
 *   users/{uid}/chat/{messageId}       → FirebaseChatMessage
 *   users/{uid}/achievements/{achId}   → FirebaseAchievement
 *   ai_cache/foods/{normalizedName}    → FirebaseFoodCache (global, shared)
 */

// ── User Profile ──

export interface FirebaseUserProfile {
    uid: string;
    name: string;
    avatar: string;
    healthGoal: 'liver' | 'anxiety' | 'discipline';
    difficulty: 'casual' | 'committed' | 'ascendant';
    createdAt: number;
    lastActiveAt: number;

    // Body metrics
    heightCm: number;
    weightKg: number;
    age: number;
    gender: 'male' | 'female';
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    targetWeightKg: number;

    // Game state
    hp: number;
    mana: number;
    xp: number;
    level: number;
    streak: number;
    daysActive: number;
    mealsLogged: number;
    questsCompleted: number;
}

// ── Daily Tracker ──

export interface FirebaseDailyTracker {
    date: string; // 'yyyy-MM-dd'
    userId: string;

    water: {
        glasses: number;
        target: number;
    };

    steps: {
        count: number;
        target: number;
    };

    calories: {
        consumed: number;
        target: number;
        foods: {
            foodId: string;
            name: string;
            calories: number;
            sugar: number;
            servings: number;
            timestamp: number;
        }[];
    };

    sugar: {
        grams: number;
        target: number;
    };

    weight?: {
        kg: number;
        timestamp: number;
    };

    fasting?: {
        startTime: number;
        endTime?: number;
        targetHours: number;
        completed: boolean;
    };
}

// ── Meal Log ──

export interface FirebaseMealLog {
    id: string;
    userId: string;
    meal: string;
    timestamp: number;
    hpImpact: number;
    aiAdvice: string;

    // AI-analyzed nutrition (if available)
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

// ── Chat Message ──

export interface FirebaseChatMessage {
    id: string;
    userId: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    tokensUsed?: number;
}

// ── Achievement ──

export interface FirebaseAchievement {
    id: string;
    userId: string;
    achievementId: string;
    unlockedAt: number;
}

// ── Global Food Cache ──

export interface FirebaseFoodCache {
    name: string;
    normalizedName: string;
    calories: number;
    sugar: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    servingSize: string;
    source: 'ai' | 'database' | 'user';
    createdAt: number;
    hitCount: number;
}
