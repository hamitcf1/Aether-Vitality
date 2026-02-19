export type ActivityCategory = 'cardio' | 'strength' | 'flexibility' | 'sports' | 'recreational';

export interface ActivityType {
    id: string;
    name: string;
    category: ActivityCategory;
    met: number; // Metabolic Equivalent of Task
    emoji: string;
}

export const ACTIVITIES: ActivityType[] = [
    // Cardio
    { id: 'walking_casual', name: 'Walking (Casual)', category: 'cardio', met: 3.0, emoji: '🚶' },
    { id: 'walking_brisk', name: 'Walking (Brisk)', category: 'cardio', met: 4.3, emoji: '👟' },
    { id: 'running_slow', name: 'Running (Slow)', category: 'cardio', met: 8.0, emoji: '🏃' },
    { id: 'running_fast', name: 'Running (Fast)', category: 'cardio', met: 11.5, emoji: '⚡' },
    { id: 'cycling_casual', name: 'Cycling (Casual)', category: 'cardio', met: 5.5, emoji: '🚲' },
    { id: 'cycling_intense', name: 'Cycling (Intense)', category: 'cardio', met: 10.0, emoji: '🚴' },
    { id: 'swimming', name: 'Swimming', category: 'cardio', met: 7.0, emoji: '🏊' },
    { id: 'hiit', name: 'HIIT / Tabata', category: 'cardio', met: 12.0, emoji: '🔥' },
    { id: 'elliptical', name: 'Elliptical', category: 'cardio', met: 5.0, emoji: '🥨' },
    { id: 'stair_stepper', name: 'Stair Stepper', category: 'cardio', met: 9.0, emoji: '🪜' },

    // Strength
    { id: 'weight_lifting_light', name: 'Weight Lifting (Light)', category: 'strength', met: 3.0, emoji: '🏋️' },
    { id: 'weight_lifting_heavy', name: 'Weight Lifting (Heavy)', category: 'strength', met: 6.0, emoji: '💪' },
    { id: 'bodyweight_training', name: 'Bodyweight Training', category: 'strength', met: 5.0, emoji: '🤸' },
    { id: 'crossfit', name: 'CrossFit', category: 'strength', met: 8.0, emoji: '🔥' },

    // Flexibility
    { id: 'yoga', name: 'Yoga', category: 'flexibility', met: 2.5, emoji: '🧘' },
    { id: 'pilates', name: 'Pilates', category: 'flexibility', met: 3.0, emoji: '🧘‍♀️' },
    { id: 'stretching', name: 'Stretching', category: 'flexibility', met: 2.3, emoji: '🙆' },

    // Sports
    { id: 'basketball', name: 'Basketball', category: 'sports', met: 8.0, emoji: '🏀' },
    { id: 'soccer', name: 'Soccer / Football', category: 'sports', met: 7.0, emoji: '⚽' },
    { id: 'tennis', name: 'Tennis', category: 'sports', met: 7.3, emoji: '🎾' },
    { id: 'volleyball', name: 'Volleyball', category: 'sports', met: 4.0, emoji: '🏐' },
    { id: 'boxing', name: 'Boxing', category: 'sports', met: 9.0, emoji: '🥊' },

    // Recreational
    { id: 'dancing', name: 'Dancing', category: 'recreational', met: 4.5, emoji: '💃' },
    { id: 'hiking', name: 'Hiking', category: 'recreational', met: 6.0, emoji: '🥾' },
    { id: 'gardening', name: 'Gardening', category: 'recreational', met: 3.8, emoji: '🪴' },
];

/**
 * Calculate calories burned for an activity using MET formula.
 * Formula: Calories = MET * weight_kg * duration_hours
 */
export function calculateCaloriesBurned(met: number, weightKg: number, durationMin: number): number {
    const durationHours = durationMin / 60;
    return Math.round(met * weightKg * durationHours);
}

/**
 * Estimate calories burned from steps.
 * Rough estimate: 0.04 calories per step for average person.
 * More refined: ~Avg person 1000 steps = 40 calories.
 */
export function estimateStepsCalories(steps: number, weightKg: number): number {
    // Basic approximation: 0.5 cal per kg per 1000 steps
    // 70kg person -> 35 cal per 1000 steps
    const multiplier = weightKg * 0.0005;
    return Math.round(steps * multiplier);
}
