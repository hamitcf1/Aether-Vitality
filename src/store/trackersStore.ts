import { create } from 'zustand';
import { format } from 'date-fns';
import { getCaloriePlan } from '../lib/calorieCalculator';
import type { Gender, ActivityLevel } from '../lib/calorieCalculator';
import { saveToFirestore, loadFromFirestore } from '../lib/firestoreSync';
import { calculateCaloriesBurned, estimateStepsCalories, ACTIVITIES } from '../lib/fitnessCalculator';

// ── Types ──
export interface DailyWaterLog {
    date: string;
    glasses: number;
    target: number;
}

export interface DailyStepsLog {
    date: string;
    steps: number;
    target: number;
}

export interface DailySugarLog {
    date: string;
    grams: number;
    target: number;
}

export interface DailyCalorieLog {
    date: string;
    consumed: number;
    burned: number;
    target: number;
    foods: { foodId: string; name: string; emoji: string; calories: number; sugar: number; protein?: number; carbs?: number; fat?: number; servings: number; time: number }[];
}

export interface WeightEntry {
    date: string;
    weightKg: number;
}

export interface ExerciseLog {
    id: string;
    date: string;
    activityId: string;
    name: string;
    emoji: string;
    durationMin: number;
    caloriesBurned: number;
    timestamp: number;
}

export interface HabitRelapse {
    date: string;
    timestamp: number;
    note?: string;
}

export interface HabitTracker {
    id: string;
    name: string;
    type: 'smoking' | 'nofap' | 'custom';
    startDate: number | null;
    lastRelapse: number | null;
    resistedCount: number;
    relapseHistory: HabitRelapse[];
    settings?: {
        cigarettesPerDay?: number;
        costPerPack?: number;
        currency?: string;
    };
}

export interface FastingState {
    active: boolean;
    startTime: number | null;
    endTime: number | null;
    plan: '16:8' | '18:6' | '20:4' | '14:10';
    totalFastsCompleted: number;
    history: { date: string; durationHrs: number; plan: string }[];
}

export interface BodyProfile {
    heightCm: number;
    weightKg: number;
    age: number;
    gender: Gender;
    activityLevel: ActivityLevel;
    targetWeightKg: number;
}

export interface UnlockableItem {
    id: string;
    title: string;
    description: string;
    icon: string;
    type: 'badge' | 'title' | 'theme';
    requirement: string;
    unlocked: boolean;
}

interface TrackersState {
    // Internal
    _uid: string | null;

    // Body
    bodyProfile: BodyProfile | null;
    setBodyProfile: (profile: BodyProfile) => void;

    // Water
    waterLogs: DailyWaterLog[];
    addWater: (glasses?: number) => void;
    setWaterTarget: (target: number) => void;

    // Steps
    stepsLogs: DailyStepsLog[];
    addSteps: (steps: number) => void;
    setStepsTarget: (target: number) => void;

    // Sugar
    sugarLogs: DailySugarLog[];
    addSugar: (grams: number) => void;
    setSugarTarget: (target: number) => void;

    // Calories
    calorieLogs: DailyCalorieLog[];
    addFood: (food: { foodId: string; name: string; emoji: string; calories: number; sugar: number; protein?: number; carbs?: number; fat?: number; servings: number }) => void;
    setCalorieTarget: (target: number) => void;

    // Weight
    weightLog: WeightEntry[];
    logWeight: (weightKg: number) => void;

    // Fitness
    exerciseLogs: ExerciseLog[];
    addExercise: (activityId: string, durationMin: number) => void;
    removeExercise: (id: string) => void;
    getTodayExercises: () => ExerciseLog[];

    // Fasting
    fasting: FastingState;
    startFast: () => void;
    endFast: () => void;
    setFastingPlan: (plan: FastingState['plan']) => void;

    // Habits
    habits: HabitTracker[];
    startHabit: (type: HabitTracker['type'], name: string, settings?: HabitTracker['settings']) => void;
    deleteHabit: (id: string) => void;
    logRelapse: (id: string, note?: string) => void;
    resistUrge: (id: string) => void;
    getHabitStreak: (id: string) => { days: number; hours: number; minutes: number; totalMinutes: number };

    // Unlockables
    unlockables: UnlockableItem[];
    checkUnlockables: () => string[];

    // Helpers
    getTodayWater: () => DailyWaterLog;
    getTodaySteps: () => DailyStepsLog;
    getTodaySugar: () => DailySugarLog;
    getTodayCalories: () => DailyCalorieLog;

    // Remove actions
    removeWater: (glasses?: number) => void;
    removeSteps: (steps: number) => void;
    removeSugar: (grams: number) => void;
    removeFood: (foodId: string) => void;

    // Firestore
    loadData: (uid: string) => Promise<void>;
    clearAllData: () => void;
}

const today = () => format(new Date(), 'yyyy-MM-dd');

const DEFAULT_UNLOCKABLES: UnlockableItem[] = [
    { id: 'hydration_novice', title: 'Hydration Novice', description: 'Log water for 3 days', icon: '💧', type: 'badge', requirement: 'water_3', unlocked: false },
    { id: 'hydration_master', title: 'Hydration Master', description: 'Log water for 30 days', icon: '🌊', type: 'title', requirement: 'water_30', unlocked: false },
    { id: 'step_walker', title: 'Urban Explorer', description: 'Walk 10K steps in a day', icon: '👟', type: 'badge', requirement: 'steps_10k', unlocked: false },
    { id: 'step_marathon', title: 'Marathon Spirit', description: 'Walk 50K total steps', icon: '🏃', type: 'title', requirement: 'steps_50k', unlocked: false },
    { id: 'calorie_counter', title: 'Calorie Aware', description: 'Log food for 7 days', icon: '📊', type: 'badge', requirement: 'calories_7', unlocked: false },
    { id: 'sugar_watcher', title: 'Sugar Guardian', description: 'Stay under sugar limit 7 days', icon: '🍬', type: 'badge', requirement: 'sugar_7', unlocked: false },
    { id: 'fasting_beginner', title: 'Fasting Initiate', description: 'Complete 3 fasts', icon: '⏰', type: 'badge', requirement: 'fast_3', unlocked: false },
    { id: 'fasting_warrior', title: 'Fasting Warrior', description: 'Complete 14 fasts', icon: '⚔️', type: 'title', requirement: 'fast_14', unlocked: false },
    { id: 'weight_tracker', title: 'Scale Master', description: 'Log weight 14 times', icon: '⚖️', type: 'badge', requirement: 'weight_14', unlocked: false },
    { id: 'weight_transformer', title: 'Body Transformer', description: 'Log weight 60 times', icon: '🦋', type: 'title', requirement: 'weight_60', unlocked: false },
    { id: 'all_tracker', title: 'Wellness Alchemist', description: 'Use all trackers in one day', icon: '✨', type: 'title', requirement: 'all_trackers_day', unlocked: false },
    { id: 'theme_midnight', title: 'Midnight Aura', description: 'Reach 10-day streak', icon: '🌙', type: 'theme', requirement: 'streak_10', unlocked: false },
    { id: 'theme_aurora', title: 'Aurora Theme', description: 'Reach level 10', icon: '🌌', type: 'theme', requirement: 'level_10', unlocked: false },
    { id: 'theme_phoenix', title: 'Phoenix Theme', description: 'Complete 50 quests', icon: '🔥', type: 'theme', requirement: 'quests_50', unlocked: false },
    { id: 'perfect_day', title: 'Perfect Day', description: 'Hit all tracker goals in one day', icon: '💯', type: 'badge', requirement: 'perfect_day', unlocked: false },
];

// Keys to persist to Firestore
const DATA_KEYS = [
    'bodyProfile', 'waterLogs', 'stepsLogs', 'sugarLogs', 'calorieLogs',
    'weightLog', 'exerciseLogs', 'habits', 'fasting', 'unlockables',
] as const;

function getDataSnapshot(state: TrackersState): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    for (const key of DATA_KEYS) { data[key] = state[key]; }
    return data;
}

function autoSave(get: () => TrackersState) {
    const state = get();
    if (state._uid) saveToFirestore(state._uid, 'trackers', getDataSnapshot(state));
}

export const useTrackersStore = create<TrackersState>()((set, get) => ({
    _uid: null,
    bodyProfile: null,
    waterLogs: [],
    stepsLogs: [],
    sugarLogs: [],
    calorieLogs: [],
    weightLog: [],
    exerciseLogs: [],
    habits: [],
    fasting: {
        active: false,
        startTime: null,
        endTime: null,
        plan: '16:8',
        totalFastsCompleted: 0,
        history: [],
    },
    unlockables: DEFAULT_UNLOCKABLES,

    // Firestore
    loadData: async (userUid) => {
        set({ _uid: userUid });
        const data = await loadFromFirestore(userUid, 'trackers');
        if (data) {
            const patch: Record<string, unknown> = {};
            for (const key of DATA_KEYS) {
                if (data[key] !== undefined) patch[key] = data[key];
            }
            set(patch as Partial<TrackersState>);
        }
    },

    // Body
    setBodyProfile: (profile) => { set({ bodyProfile: profile }); autoSave(get); },

    // Water
    addWater: (glasses = 1) => {
        const d = today();
        const logs = [...get().waterLogs];
        const idx = logs.findIndex((l) => l.date === d);
        if (idx >= 0) {
            logs[idx] = { ...logs[idx], glasses: logs[idx].glasses + glasses };
        } else {
            logs.push({ date: d, glasses, target: 8 });
        }
        set({ waterLogs: logs.slice(-90) });
        autoSave(get);
    },
    setWaterTarget: (target) => {
        const d = today();
        const logs = [...get().waterLogs];
        const idx = logs.findIndex((l) => l.date === d);
        if (idx >= 0) {
            logs[idx] = { ...logs[idx], target };
        } else {
            logs.push({ date: d, glasses: 0, target });
        }
        set({ waterLogs: logs });
        autoSave(get);
    },
    removeWater: (glasses = 1) => {
        const d = today();
        const logs = [...get().waterLogs];
        const idx = logs.findIndex((l) => l.date === d);
        if (idx >= 0) {
            logs[idx] = { ...logs[idx], glasses: Math.max(0, logs[idx].glasses - glasses) };
            set({ waterLogs: logs });
            autoSave(get);
        }
    },

    // Steps
    addSteps: (steps) => {
        const d = today();
        const logs = [...get().stepsLogs];
        const idx = logs.findIndex((l) => l.date === d);
        if (idx >= 0) {
            logs[idx] = { ...logs[idx], steps: logs[idx].steps + steps };
        } else {
            logs.push({ date: d, steps, target: 10000 });
        }
        set({ stepsLogs: logs.slice(-90) });

        // Update calorie burned from steps
        const weight = get().bodyProfile?.weightKg || 70;
        const stepCals = estimateStepsCalories(steps, weight);

        const cLogs = [...get().calorieLogs];
        const cIdx = cLogs.findIndex(l => l.date === d);
        if (cIdx >= 0) {
            cLogs[cIdx] = { ...cLogs[cIdx], burned: cLogs[cIdx].burned + stepCals };
            set({ calorieLogs: cLogs });
        } else {
            const target = get().bodyProfile ? getCaloriePlan(
                get().bodyProfile!.weightKg,
                get().bodyProfile!.heightCm,
                get().bodyProfile!.age,
                get().bodyProfile!.gender,
                get().bodyProfile!.activityLevel,
                get().bodyProfile!.targetWeightKg
            ).dailyCalories : 2000;
            cLogs.push({ date: d, consumed: 0, burned: stepCals, target, foods: [] });
            set({ calorieLogs: cLogs });
        }

        // Auto-detect activity level
        const newState = get();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return format(date, 'yyyy-MM-dd');
        });
        const avgSteps = newState.stepsLogs.filter(l => last7Days.includes(l.date)).reduce((sum, l) => sum + l.steps, 0) / 7;
        const avgExMin = newState.exerciseLogs.filter(l => last7Days.includes(l.date)).reduce((sum, l) => sum + l.durationMin, 0) / 7;

        let detected: ActivityLevel = 'sedentary';
        if (avgSteps > 12500 || avgExMin > 60) detected = 'very_active';
        else if (avgSteps > 10000 || avgExMin > 45) detected = 'active';
        else if (avgSteps > 7500 || avgExMin > 30) detected = 'moderate';
        else if (avgSteps > 5000 || avgExMin > 15) detected = 'light';

        if (newState.bodyProfile && newState.bodyProfile.activityLevel !== detected) {
            const updatedProfile = { ...newState.bodyProfile, activityLevel: detected };
            const newPlan = getCaloriePlan(
                updatedProfile.weightKg,
                updatedProfile.heightCm,
                updatedProfile.age,
                updatedProfile.gender,
                updatedProfile.activityLevel,
                updatedProfile.targetWeightKg
            );
            set({ bodyProfile: updatedProfile });

            // Update today's target if it exists
            const latestCLogs = [...get().calorieLogs];
            const todayIdx = latestCLogs.findIndex(l => l.date === d);
            if (todayIdx >= 0) {
                latestCLogs[todayIdx] = { ...latestCLogs[todayIdx], target: newPlan.dailyCalories };
                set({ calorieLogs: latestCLogs });
            }
        }

        autoSave(get);
    },
    setStepsTarget: (target) => {
        const d = today();
        const logs = [...get().stepsLogs];
        const idx = logs.findIndex((l) => l.date === d);
        if (idx >= 0) {
            logs[idx] = { ...logs[idx], target };
        } else {
            logs.push({ date: d, steps: 0, target });
        }
        set({ stepsLogs: logs });
        autoSave(get);
    },
    removeSteps: (steps) => {
        const d = today();
        const logs = [...get().stepsLogs];
        const idx = logs.findIndex((l) => l.date === d);
        if (idx >= 0) {
            logs[idx] = { ...logs[idx], steps: Math.max(0, logs[idx].steps - steps) };
            set({ stepsLogs: logs });
            autoSave(get);
        }
    },

    // Sugar
    addSugar: (grams) => {
        const d = today();
        const logs = [...get().sugarLogs];
        const idx = logs.findIndex((l) => l.date === d);
        if (idx >= 0) {
            logs[idx] = { ...logs[idx], grams: logs[idx].grams + grams };
        } else {
            logs.push({ date: d, grams, target: 25 });
        }
        set({ sugarLogs: logs.slice(-90) });
        autoSave(get);
    },
    setSugarTarget: (target) => {
        const d = today();
        const logs = [...get().sugarLogs];
        const idx = logs.findIndex((l) => l.date === d);
        if (idx >= 0) {
            logs[idx] = { ...logs[idx], target };
        } else {
            logs.push({ date: d, grams: 0, target });
        }
        set({ sugarLogs: logs });
        autoSave(get);
    },
    removeSugar: (grams) => {
        const d = today();
        const logs = [...get().sugarLogs];
        const idx = logs.findIndex((l) => l.date === d);
        if (idx >= 0) {
            logs[idx] = { ...logs[idx], grams: Math.max(0, logs[idx].grams - grams) };
            set({ sugarLogs: logs });
            autoSave(get);
        }
    },

    // Calories
    addFood: (food) => {
        const d = today();
        const logs = [...get().calorieLogs];
        const idx = logs.findIndex((l) => l.date === d);
        const entry = { ...food, time: Date.now() };
        if (idx >= 0) {
            logs[idx] = {
                ...logs[idx],
                consumed: logs[idx].consumed + food.calories * food.servings,
                foods: [...logs[idx].foods, entry],
            };
        } else {
            logs.push({ date: d, consumed: food.calories * food.servings, burned: 0, target: 2000, foods: [entry] });
        }
        set({ calorieLogs: logs.slice(-90) });
        // Also add sugar
        if (food.sugar > 0) {
            get().addSugar(Math.round(food.sugar * food.servings));
        }
        autoSave(get);
    },
    setCalorieTarget: (target) => {
        const d = today();
        const logs = [...get().calorieLogs];
        const idx = logs.findIndex((l) => l.date === d);
        if (idx >= 0) {
            logs[idx] = { ...logs[idx], target };
        } else {
            logs.push({ date: d, consumed: 0, burned: 0, target, foods: [] });
        }
        set({ calorieLogs: logs });
        autoSave(get);
    },
    removeFood: (foodId) => {
        const d = today();
        const logs = [...get().calorieLogs];
        const idx = logs.findIndex((l) => l.date === d);
        if (idx >= 0) {
            const food = logs[idx].foods.find((f) => f.foodId === foodId);
            if (food) {
                const consumed = logs[idx].consumed - (food.calories * food.servings);
                const foods = logs[idx].foods.filter((f) => f.foodId !== foodId);
                logs[idx] = { ...logs[idx], consumed: Math.max(0, consumed), foods };
                set({ calorieLogs: logs });

                // Also remove sugar if applicable
                if (food.sugar > 0) {
                    get().removeSugar(Math.round(food.sugar * food.servings));
                }
                autoSave(get);
            }
        }
    },

    // Weight
    logWeight: (weightKg) => {
        const d = today();
        const log = [...get().weightLog];
        const idx = log.findIndex((l) => l.date === d);
        if (idx >= 0) {
            log[idx] = { date: d, weightKg };
        } else {
            log.push({ date: d, weightKg });
        }
        set({ weightLog: log.slice(-365) });
        // Update body profile weight
        const bp = get().bodyProfile;
        if (bp) set({ bodyProfile: { ...bp, weightKg } });
        autoSave(get);
    },

    // Fitness
    addExercise: (activityId, durationMin) => {
        const activity = ACTIVITIES.find(a => a.id === activityId);
        if (!activity) return;

        const weight = get().bodyProfile?.weightKg || 70;
        const burned = calculateCaloriesBurned(activity.met, weight, durationMin);
        const d = today();

        const log: ExerciseLog = {
            id: `ex_${Date.now()}`,
            date: d,
            activityId,
            name: activity.name,
            emoji: activity.emoji,
            durationMin,
            caloriesBurned: burned,
            timestamp: Date.now()
        };

        set(s => ({ exerciseLogs: [...s.exerciseLogs, log].slice(-100) }));

        // Update daily burned calories
        const cLogs = [...get().calorieLogs];
        const cIdx = cLogs.findIndex(l => l.date === d);
        if (cIdx >= 0) {
            cLogs[cIdx] = { ...cLogs[cIdx], burned: cLogs[cIdx].burned + burned };
            set({ calorieLogs: cLogs });
        } else {
            const target = get().bodyProfile ? getCaloriePlan(
                get().bodyProfile!.weightKg,
                get().bodyProfile!.heightCm,
                get().bodyProfile!.age,
                get().bodyProfile!.gender,
                get().bodyProfile!.activityLevel,
                get().bodyProfile!.targetWeightKg
            ).dailyCalories : 2000;
            cLogs.push({ date: d, consumed: 0, burned, target, foods: [] });
            set({ calorieLogs: cLogs });
        }

        // Auto-detect activity level (duplicated logic for simplicity in this hook structure)
        const newState = get();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return format(date, 'yyyy-MM-dd');
        });
        const avgSteps = newState.stepsLogs.filter(l => last7Days.includes(l.date)).reduce((sum, l) => sum + l.steps, 0) / 7;
        const avgExMin = newState.exerciseLogs.filter(l => last7Days.includes(l.date)).reduce((sum, l) => sum + l.durationMin, 0) / 7;

        let detected: ActivityLevel = 'sedentary';
        if (avgSteps > 12500 || avgExMin > 60) detected = 'very_active';
        else if (avgSteps > 10000 || avgExMin > 45) detected = 'active';
        else if (avgSteps > 7500 || avgExMin > 30) detected = 'moderate';
        else if (avgSteps > 5000 || avgExMin > 15) detected = 'light';

        if (newState.bodyProfile && newState.bodyProfile.activityLevel !== detected) {
            const updatedProfile = { ...newState.bodyProfile, activityLevel: detected };
            const newPlan = getCaloriePlan(
                updatedProfile.weightKg,
                updatedProfile.heightCm,
                updatedProfile.age,
                updatedProfile.gender,
                updatedProfile.activityLevel,
                updatedProfile.targetWeightKg
            );
            set({ bodyProfile: updatedProfile });

            const latestCLogs = [...get().calorieLogs];
            const todayIdx = latestCLogs.findIndex(l => l.date === d);
            if (todayIdx >= 0) {
                latestCLogs[todayIdx] = { ...latestCLogs[todayIdx], target: newPlan.dailyCalories };
                set({ calorieLogs: latestCLogs });
            }
        }

        autoSave(get);
    },
    removeExercise: (id) => {
        const ex = get().exerciseLogs.find(e => e.id === id);
        if (!ex) return;

        const d = ex.date;
        set(s => ({ exerciseLogs: s.exerciseLogs.filter(e => e.id !== id) }));

        // Subtract from daily burned calories
        const cLogs = [...get().calorieLogs];
        const cIdx = cLogs.findIndex(l => l.date === d);
        if (cIdx >= 0) {
            cLogs[cIdx] = { ...cLogs[cIdx], burned: Math.max(0, cLogs[cIdx].burned - ex.caloriesBurned) };
            set({ calorieLogs: cLogs });
        }
        autoSave(get);
    },
    getTodayExercises: () => {
        const d = today();
        return get().exerciseLogs.filter(e => e.date === d);
    },

    // Fasting
    startFast: () => {
        set({
            fasting: { ...get().fasting, active: true, startTime: Date.now(), endTime: null },
        });
        autoSave(get);
    },
    endFast: () => {
        const f = get().fasting;
        if (!f.active || !f.startTime) return;
        const durationHrs = Math.round((Date.now() - f.startTime) / 3600000 * 10) / 10;
        set({
            fasting: {
                ...f,
                active: false,
                startTime: null,
                endTime: Date.now(),
                totalFastsCompleted: f.totalFastsCompleted + 1,
                history: [...f.history, { date: today(), durationHrs, plan: f.plan }].slice(-90),
            },
        });
        autoSave(get);
    },
    setFastingPlan: (plan) => { set({ fasting: { ...get().fasting, plan } }); autoSave(get); },

    // Unlockables
    checkUnlockables: () => {
        const state = get();
        const waterDays = state.waterLogs.filter((l) => l.glasses >= l.target).length;
        const totalSteps = state.stepsLogs.reduce((s, l) => s + l.steps, 0);
        const maxStepsDay = Math.max(0, ...state.stepsLogs.map((l) => l.steps));
        const calorieDays = state.calorieLogs.filter((l) => l.foods.length > 0).length;
        const sugarGoodDays = state.sugarLogs.filter((l) => l.grams <= l.target).length;
        const d = today();
        const todayHasAll =
            state.waterLogs.some((l) => l.date === d && l.glasses > 0) &&
            state.stepsLogs.some((l) => l.date === d && l.steps > 0) &&
            state.calorieLogs.some((l) => l.date === d && l.foods.length > 0);

        const todayWater = state.waterLogs.find((l) => l.date === d);
        const todaySteps = state.stepsLogs.find((l) => l.date === d);
        const todayCals = state.calorieLogs.find((l) => l.date === d);
        const todaySugar = state.sugarLogs.find((l) => l.date === d);
        const perfectDay =
            (todayWater ? todayWater.glasses >= todayWater.target : false) &&
            (todaySteps ? todaySteps.steps >= todaySteps.target : false) &&
            (todayCals ? todayCals.consumed <= todayCals.target && todayCals.consumed > 0 : false) &&
            (todaySugar ? todaySugar.grams <= todaySugar.target && todaySugar.grams > 0 : false);

        const checks: Record<string, boolean> = {
            water_3: waterDays >= 3,
            water_30: waterDays >= 30,
            steps_10k: maxStepsDay >= 10000,
            steps_50k: totalSteps >= 50000,
            calories_7: calorieDays >= 7,
            sugar_7: sugarGoodDays >= 7,
            fast_3: state.fasting.totalFastsCompleted >= 3,
            fast_14: state.fasting.totalFastsCompleted >= 14,
            weight_14: state.weightLog.length >= 14,
            weight_60: state.weightLog.length >= 60,
            all_trackers_day: todayHasAll,
            perfect_day: perfectDay,
        };

        const newlyUnlocked: string[] = [];
        const updated = state.unlockables.map((item) => {
            if (item.unlocked) return item;
            const req = item.requirement;
            if (checks[req]) {
                newlyUnlocked.push(item.id);
                return { ...item, unlocked: true };
            }
            return item;
        });

        if (newlyUnlocked.length > 0) {
            set({ unlockables: updated });
            autoSave(get);
        }
        return newlyUnlocked;
    },

    // Habits
    startHabit: (type, name, settings) => {
        const id = `${type}_${Date.now()}`;
        const newHabit: HabitTracker = {
            id,
            name,
            type,
            startDate: Date.now(),
            lastRelapse: null,
            resistedCount: 0,
            relapseHistory: [],
            settings
        };
        set(s => ({ habits: [...s.habits, newHabit] }));
        autoSave(get);
    },
    deleteHabit: (id) => {
        set(s => ({ habits: s.habits.filter(h => h.id !== id) }));
        autoSave(get);
    },
    logRelapse: (id, note) => {
        set(s => ({
            habits: s.habits.map(h => h.id === id ? {
                ...h,
                lastRelapse: Date.now(),
                relapseHistory: [...h.relapseHistory, { date: today(), timestamp: Date.now(), note }]
            } : h)
        }));
        autoSave(get);
    },
    resistUrge: (id) => {
        set(s => ({
            habits: s.habits.map(h => h.id === id ? { ...h, resistedCount: h.resistedCount + 1 } : h)
        }));
        autoSave(get);
    },
    getHabitStreak: (id) => {
        const habit = get().habits.find(h => h.id === id);
        if (!habit || !habit.startDate) return { days: 0, hours: 0, minutes: 0, totalMinutes: 0 };

        const start = habit.lastRelapse || habit.startDate;
        const diffMs = Date.now() - start;
        const totalMinutes = Math.floor(diffMs / 60000);

        const days = Math.floor(totalMinutes / 1440);
        const hours = Math.floor((totalMinutes % 1440) / 60);
        const minutes = totalMinutes % 60;

        return { days, hours, minutes, totalMinutes };
    },

    // Helpers
    getTodayWater: () => {
        const d = today();
        return get().waterLogs.find((l) => l.date === d) || { date: d, glasses: 0, target: 8 };
    },
    getTodaySteps: () => {
        const d = today();
        return get().stepsLogs.find((l) => l.date === d) || { date: d, steps: 0, target: 10000 };
    },
    getTodaySugar: () => {
        const d = today();
        return get().sugarLogs.find((l) => l.date === d) || { date: d, grams: 0, target: 25 };
    },
    getTodayCalories: () => {
        const d = today();
        return get().calorieLogs.find((l) => l.date === d) || { date: d, consumed: 0, burned: 0, target: 2000, foods: [] };
    },

    clearAllData: () => set({
        _uid: null,
        bodyProfile: null,
        waterLogs: [],
        stepsLogs: [],
        sugarLogs: [],
        calorieLogs: [],
        weightLog: [],
        exerciseLogs: [],
        habits: [],
        fasting: {
            active: false,
            startTime: null,
            endTime: null,
            plan: '16:8',
            totalFastsCompleted: 0,
            history: [],
        },
        unlockables: DEFAULT_UNLOCKABLES,
    }),
}));
