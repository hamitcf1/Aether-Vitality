import { aiGenerate, isAIAvailable } from './aiProvider';
import { format } from 'date-fns';
import { getInsightPool, addToInsightPool } from './insightService';

// ── Cache for typical insights (in-memory for session) ──

const insightCache = new Map<string, { text: string; expiry: number }>();

function getCacheKey(feature: string): string {
    return `${feature}_${format(new Date(), 'yyyy-MM-dd')}`;
}

function getCachedInsight(feature: string): string | null {
    if (feature === 'daily') {
        return localStorage.getItem(getCacheKey('daily'));
    }
    const key = getCacheKey(feature);
    const cached = insightCache.get(key);
    if (cached && cached.expiry > Date.now()) return cached.text;
    return null;
}

function setCachedInsight(feature: string, text: string, ttlMs = 6 * 60 * 60 * 1000): void {
    if (feature === 'daily') {
        localStorage.setItem(getCacheKey('daily'), text);
        localStorage.setItem('aether_last_daily_insight', text);
        return;
    }
    insightCache.set(getCacheKey(feature), { text, expiry: Date.now() + ttlMs });
}

function getLastSeenInsight(feature: string): string | null {
    if (feature === 'daily') {
        return localStorage.getItem('aether_last_daily_insight');
    }
    return null;
}

// ── Daily Morning Insight ──

export async function getDailyInsight(trackerData: {
    waterGlasses: number;
    waterTarget: number;
    steps: number;
    stepsTarget: number;
    caloriesConsumed: number;
    calorieTarget: number;
    sugarGrams: number;
    sugarTarget: number;
    streak: number;
    exerciseMinutes?: number;
    caloriesBurned?: number;
    sobrietyDays?: { name: string; days: number }[];
}): Promise<string | null> {
    const cached = getCachedInsight('daily');
    if (cached) return cached;

    if (!isAIAvailable()) return null;

    // Determine if progress is "special" (perfect day or milestone streak)
    const isPerfectWater = trackerData.waterGlasses >= trackerData.waterTarget;
    const isPerfectSteps = trackerData.steps >= trackerData.stepsTarget;
    const isPerfectCalories = trackerData.caloriesConsumed > 0 && trackerData.caloriesConsumed <= trackerData.calorieTarget;
    const isPerfectSugar = trackerData.sugarGrams <= trackerData.sugarTarget;
    const isPerfectDay = isPerfectWater && isPerfectSteps && isPerfectCalories && isPerfectSugar;

    const isMilestoneStreak = trackerData.streak > 0 && trackerData.streak % 5 === 0;
    const isSpecialProgress = isPerfectDay || isMilestoneStreak;

    const pool = await getInsightPool();
    const lastSeen = getLastSeenInsight('daily');
    const availableInPool = pool.filter(msg => msg !== lastSeen);

    // If not special progress and we have at least 50 messages, pull from pool
    if (!isSpecialProgress && pool.length >= 50 && availableInPool.length > 0) {
        const randomMsg = availableInPool[Math.floor(Math.random() * availableInPool.length)];
        setCachedInsight('daily', randomMsg);
        return randomMsg;
    }

    // Otherwise, generate a new message (either because it's special, or we're filling the pool)
    const prompt = `You are a mystical health alchemist. Give a short morning motivation (2-3 sentences max).
Context (Do NOT literally quote these numbers back unless congratulating a milestone, but use them to shape the advice):
- Water: ${trackerData.waterGlasses}/${trackerData.waterTarget} glasses
- Steps: ${trackerData.steps.toLocaleString()}/${trackerData.stepsTarget.toLocaleString()}
- Calories: ${trackerData.caloriesConsumed}/${trackerData.calorieTarget} (Burned: ${Math.round(trackerData.caloriesBurned || 0)} via ${trackerData.exerciseMinutes || 0} mins)
- Sugar: ${trackerData.sugarGrams}g/${trackerData.sugarTarget}g limit
- Sobriety: ${trackerData.sobrietyDays?.map(s => `${s.name}: ${s.days}d`).join(', ') || 'N/A'}
- Current streak: ${trackerData.streak} days

${isPerfectDay ? 'Acknowledge their perfect balance yesterday (hit all goals).' : ''}
${isMilestoneStreak ? `Congratulate them on reaching a ${trackerData.streak} day streak milestone!` : ''}

Be encouraging and mystical. Use alchemical metaphors. Note: Write this so it can be read by any Seeker on a normal day, avoid highly specific numerical recaps unless it's a milestone. Focus on one general improvement or praise.`;

    const response = await aiGenerate({ prompt, temperature: 0.8 });
    if (response) {
        let insightText = response.text.trim();
        // Remove quotes if the AI wrapped it in quotes
        if (insightText.startsWith('"') && insightText.endsWith('"')) {
            insightText = insightText.slice(1, -1);
        }

        setCachedInsight('daily', insightText);

        // If it's a generic message (not special progress), add to global pool until we reach 50
        if (!isSpecialProgress && pool.length < 50 && !pool.includes(insightText)) {
            await addToInsightPool(insightText);
        }

        return insightText;
    }

    // Fallback if AI generation failed but we have a pool
    if (availableInPool.length > 0) {
        const randomMsg = availableInPool[Math.floor(Math.random() * availableInPool.length)];
        setCachedInsight('daily', randomMsg);
        return randomMsg;
    } else if (pool.length > 0) {
        setCachedInsight('daily', pool[0]);
        return pool[0];
    }

    return null;
}

// ── Weekly Report Summary ──

export async function getWeeklyReportSummary(weekData: {
    avgWater: number;
    avgSteps: number;
    avgCalories: number;
    avgSugar: number;
    weightChange: number;
    daysTracked: number;
    streak: number;
}): Promise<string | null> {
    const cached = getCachedInsight('weekly');
    if (cached) return cached;

    if (!isAIAvailable()) return null;

    const prompt = `You are a health alchemist reviewing a weekly report. Write a concise 3-4 sentence summary:
- Average water: ${weekData.avgWater.toFixed(1)} glasses/day
- Average steps: ${Math.round(weekData.avgSteps).toLocaleString()}/day
- Average calories: ${Math.round(weekData.avgCalories)}/day
- Average sugar: ${weekData.avgSugar.toFixed(1)}g/day
- Weight change: ${weekData.weightChange > 0 ? '+' : ''}${weekData.weightChange.toFixed(1)} kg
- Days tracked: ${weekData.daysTracked}/7
- Streak: ${weekData.streak}

Be analytical yet encouraging. Highlight the strongest metric and suggest one focus for next week.`;

    const response = await aiGenerate({ prompt, temperature: 0.6 });
    if (response) {
        setCachedInsight('weekly', response.text, 24 * 60 * 60 * 1000); // Cache 24h
        return response.text;
    }
    return null;
}

// ── Progress Coaching ──

export async function getProgressCoaching(stats: {
    level: number;
    xp: number;
    streak: number;
    achievementsUnlocked: number;
    totalAchievements: number;
    fatsCompleted: number;
    daysActive: number;
    habitsMaintained: number;
    totalExerciseCals: number;
}): Promise<string | null> {
    const cached = getCachedInsight('coaching');
    if (cached) return cached;

    if (!isAIAvailable()) return null;

    const prompt = `You are a mystical game master reviewing a player's progress. Give 2-3 sentences of encouragement:
- Level: ${stats.level} | XP: ${stats.xp}
- Streak: ${stats.streak} days | Active: ${stats.daysActive} days
- Achievements: ${stats.achievementsUnlocked}/${stats.totalAchievements}
- Fasting sessions: ${stats.fatsCompleted}
- Habits tracked: ${stats.habitsMaintained}
- Total exercise burn: ${Math.round(stats.totalExerciseCals)} kcal

Be motivational and gamified. Reference their level and suggest what to aim for next.`;

    const response = await aiGenerate({ prompt, temperature: 0.8 });
    if (response) {
        setCachedInsight('coaching', response.text);
        return response.text;
    }
    return null;
}

// ── Quick Health Tip ──

export async function getQuickHealthTip(): Promise<string | null> {
    const cached = getCachedInsight('tip');
    if (cached) return cached;

    if (!isAIAvailable()) return null;

    const prompt = `Give one short, practical health tip (1 sentence max). Be specific and actionable. Use an alchemical tone.`;

    const response = await aiGenerate({ prompt, temperature: 0.9 });
    if (response) {
        setCachedInsight('tip', response.text);
        return response.text;
    }
    return null;
}
