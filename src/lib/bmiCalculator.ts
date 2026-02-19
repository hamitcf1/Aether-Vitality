export type BMICategory = 'underweight' | 'normal' | 'overweight' | 'obese';

export interface BMIResult {
    bmi: number;
    category: BMICategory;
    label: string;
    color: string;
    emoji: string;
}

export function calculateBMI(weightKg: number, heightCm: number): BMIResult {
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    const rounded = Math.round(bmi * 10) / 10;

    if (bmi < 18.5) {
        return { bmi: rounded, category: 'underweight', label: 'Underweight', color: '#60a5fa', emoji: '🔵' };
    }
    if (bmi < 25) {
        return { bmi: rounded, category: 'normal', label: 'Normal', color: '#10b981', emoji: '🟢' };
    }
    if (bmi < 30) {
        return { bmi: rounded, category: 'overweight', label: 'Overweight', color: '#f59e0b', emoji: '🟡' };
    }
    return { bmi: rounded, category: 'obese', label: 'Obese', color: '#f43f5e', emoji: '🔴' };
}

export function getHealthyWeightRange(heightCm: number): { min: number; max: number } {
    const heightM = heightCm / 100;
    return {
        min: Math.round(18.5 * heightM * heightM * 10) / 10,
        max: Math.round(24.9 * heightM * heightM * 10) / 10,
    };
}
