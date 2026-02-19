export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    condition: (stats: AchievementStats) => boolean;
}

export interface AchievementStats {
    mealsLogged: number;
    questsCompleted: number;
    daysActive: number;
    level: number;
    streak: number;
    // Tracker stats (optional for backward compat)
    waterDaysOnTarget?: number;
    bestSteps?: number;
    calorieDaysOnTarget?: number;
    weightLossKg?: number;
    fastsCompleted?: number;
    sugarDaysUnder?: number;
    chatMessages?: number;
    trackersUsedToday?: number;
}

export const ACHIEVEMENTS: Achievement[] = [
    // Original achievements
    { id: 'first_meal', title: 'First Transmutation', description: 'Log your first meal', icon: '🧪', condition: (s) => s.mealsLogged >= 1 },
    { id: 'meals_10', title: 'Apprentice Alchemist', description: 'Log 10 meals', icon: '⚗️', condition: (s) => s.mealsLogged >= 10 },
    { id: 'meals_50', title: 'Master Alchemist', description: 'Log 50 meals', icon: '🔮', condition: (s) => s.mealsLogged >= 50 },
    { id: 'streak_3', title: 'Consistent Seeker', description: 'Maintain a 3-day streak', icon: '🔥', condition: (s) => s.streak >= 3 },
    { id: 'streak_7', title: 'Week of Discipline', description: 'Maintain a 7-day streak', icon: '💎', condition: (s) => s.streak >= 7 },
    { id: 'streak_30', title: 'The Ascendant', description: 'Maintain a 30-day streak', icon: '👑', condition: (s) => s.streak >= 30 },
    { id: 'level_5', title: 'Journeyman', description: 'Reach Level 5', icon: '⭐', condition: (s) => s.level >= 5 },
    { id: 'level_10', title: 'Adept', description: 'Reach Level 10', icon: '🌟', condition: (s) => s.level >= 10 },
    { id: 'quest_1', title: 'Quest Initiate', description: 'Complete your first quest', icon: '📜', condition: (s) => s.questsCompleted >= 1 },
    { id: 'quest_10', title: 'Expedition Veteran', description: 'Complete 10 quests', icon: '🗺️', condition: (s) => s.questsCompleted >= 10 },
    { id: 'days_7', title: 'One Week In', description: 'Be active for 7 days', icon: '📅', condition: (s) => s.daysActive >= 7 },
    { id: 'days_30', title: 'Monthly Devotee', description: 'Be active for 30 days', icon: '🏆', condition: (s) => s.daysActive >= 30 },

    // Tracker-based achievements
    { id: 'water_7', title: 'Hydration Hero', description: 'Hit water target 7 days', icon: '💧', condition: (s) => (s.waterDaysOnTarget ?? 0) >= 7 },
    { id: 'steps_10k', title: 'Marathon Walker', description: 'Log 10,000+ steps in a day', icon: '🏃', condition: (s) => (s.bestSteps ?? 0) >= 10000 },
    { id: 'calories_7', title: 'Nutrition Master', description: 'Hit calorie target 7 days', icon: '🎯', condition: (s) => (s.calorieDaysOnTarget ?? 0) >= 7 },
    { id: 'weight_loss_1', title: 'First Kilo Down', description: 'Lose 1 kg from start', icon: '⚖️', condition: (s) => (s.weightLossKg ?? 0) >= 1 },
    { id: 'fasting_5', title: 'Fasting Disciple', description: 'Complete 5 fasting sessions', icon: '⏳', condition: (s) => (s.fastsCompleted ?? 0) >= 5 },
    { id: 'sugar_low_7', title: 'Sugar Slayer', description: 'Stay under sugar target 7 days', icon: '🚫', condition: (s) => (s.sugarDaysUnder ?? 0) >= 7 },
    { id: 'ai_chat_10', title: 'Alchemist Confidant', description: 'Have 10 AI conversations', icon: '🤖', condition: (s) => (s.chatMessages ?? 0) >= 10 },
    { id: 'all_trackers', title: 'Holistic Seeker', description: 'Use all 6 trackers in one day', icon: '🌈', condition: (s) => (s.trackersUsedToday ?? 0) >= 6 },
];

export const XP_PER_LEVEL = [0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 3800, 4700, 5700, 6800, 8000, 9300, 10700];

export function getLevelFromXP(xp: number): number {
    for (let i = XP_PER_LEVEL.length - 1; i >= 0; i--) {
        if (xp >= XP_PER_LEVEL[i]) return i + 1;
    }
    return 1;
}

export function getXPForNextLevel(level: number): number {
    return XP_PER_LEVEL[level] ?? XP_PER_LEVEL[XP_PER_LEVEL.length - 1] + (level - XP_PER_LEVEL.length) * 1500;
}

export function getXPProgress(xp: number, level: number): number {
    const currentLevelXP = XP_PER_LEVEL[level - 1] ?? 0;
    const nextLevelXP = getXPForNextLevel(level);
    return ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
}
