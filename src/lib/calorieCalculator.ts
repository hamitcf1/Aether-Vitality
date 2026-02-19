export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
    sedentary: 'Sedentary (little or no exercise)',
    light: 'Light (1-3 days/week)',
    moderate: 'Moderate (3-5 days/week)',
    active: 'Active (6-7 days/week)',
    very_active: 'Very Active (athlete)',
};

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor equation.
 */
export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: Gender): number {
    if (gender === 'male') {
        return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    }
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

/**
 * Total Daily Energy Expenditure = BMR × Activity Multiplier.
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
    return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

/**
 * Calculate recommended daily calorie intake for a given weight loss goal.
 * Returns { dailyCalories, weeklyDeficit, projectedWeeksToGoal }.
 * A safe deficit is 500-1000 cal/day (0.5-1 kg/week).
 */
export function calculateDeficit(
    tdee: number,
    currentWeightKg: number,
    targetWeightKg: number,
    aggressiveness: 'mild' | 'moderate' | 'aggressive' = 'moderate'
): {
    dailyCalories: number;
    dailyDeficit: number;
    weeklyLossKg: number;
    projectedWeeks: number;
} {
    const deficitMap = { mild: 300, moderate: 500, aggressive: 750 };
    const deficit = deficitMap[aggressiveness];
    const dailyCalories = Math.max(1200, tdee - deficit); // Never below 1200
    const actualDeficit = tdee - dailyCalories;
    const weeklyLossKg = (actualDeficit * 7) / 7700; // 7700 cal ≈ 1 kg of fat
    const weightToLose = currentWeightKg - targetWeightKg;
    const projectedWeeks = weightToLose > 0 ? Math.ceil(weightToLose / weeklyLossKg) : 0;

    return { dailyCalories, dailyDeficit: actualDeficit, weeklyLossKg, projectedWeeks };
}

/**
 * Compute full calorie plan from user body profile.
 */
export function getCaloriePlan(
    weightKg: number,
    heightCm: number,
    age: number,
    gender: Gender,
    activityLevel: ActivityLevel,
    targetWeightKg: number
) {
    const bmr = calculateBMR(weightKg, heightCm, age, gender);
    const tdee = calculateTDEE(bmr, activityLevel);
    const surplus = targetWeightKg > weightKg;

    if (surplus) {
        // Weight gain mode
        const dailyCalories = tdee + 300;
        return {
            bmr: Math.round(bmr),
            tdee,
            dailyCalories,
            dailyDeficit: -300,
            weeklyLossKg: -0.27,
            projectedWeeks: Math.ceil((targetWeightKg - weightKg) / 0.27),
            mode: 'gain' as const,
        };
    }

    const plan = calculateDeficit(tdee, weightKg, targetWeightKg, 'moderate');
    return {
        bmr: Math.round(bmr),
        tdee,
        ...plan,
        mode: 'lose' as const,
    };
}
