import { aiGenerateJSON, aiGenerate, isAIAvailable } from './aiProvider';
import { lookupFood, cacheAIFood } from './aiCache';
import type { FoodNutritionCache } from '../store/aiStore';

// ── Types ──

export interface FoodAnalysis {
    name: string;
    calories: number;
    sugar: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    servingSize: string;
}

export interface MealAnalysis {
    items: FoodAnalysis[];
    totalCalories: number;
    totalSugar: number;
    totalProtein: number;
    healthScore: number; // 1-10
    advice: string;
}

// ── Analyze a Single Food Item ──

/**
 * Get nutrition for a food item.
 * 1. Check cache first (AI cache + local database)
 * 2. If not cached, ask AI
 * 3. Cache the AI result
 */
export async function analyzeFood(foodName: string): Promise<FoodNutritionCache | null> {
    // 1. Cache-first lookup
    const cached = lookupFood(foodName);
    if (cached) return cached;

    // 2. Ask AI
    if (!isAIAvailable()) return null;

    const prompt = `Analyze the nutritional content of "${foodName}" per standard serving.
Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "name": "${foodName}",
  "calories": number,
  "sugar": number (grams),
  "protein": number (grams),
  "carbs": number (grams),
  "fat": number (grams),
  "fiber": number (grams),
  "servingSize": "description of one standard serving"
}`;

    const result = await aiGenerateJSON<FoodAnalysis>({ prompt, temperature: 0.1 });

    if (result && result.calories > 0) {
        // 3. Cache the result
        cacheAIFood({
            name: result.name || foodName,
            calories: result.calories,
            sugar: result.sugar ?? 0,
            protein: result.protein ?? 0,
            carbs: result.carbs ?? 0,
            fat: result.fat ?? 0,
            fiber: result.fiber ?? 0,
            servingSize: result.servingSize ?? '1 serving',
        });

        return lookupFood(foodName);
    }

    return null;
}

// ── Analyze a Full Meal Description ──

/**
 * Analyze a free-text meal description.
 * Breaks it into items, caches each, returns totals + health score.
 */
export async function analyzeMeal(description: string): Promise<MealAnalysis | null> {
    if (!isAIAvailable()) return null;

    const prompt = `Analyze this meal and break it into individual food items.
For each item, provide nutritional analysis per the portion described.

Meal: "${description}"

Return ONLY valid JSON (no markdown):
{
  "items": [
    { "name": "food name", "calories": number, "sugar": number, "protein": number, "carbs": number, "fat": number, "fiber": number, "servingSize": "described portion" }
  ],
  "totalCalories": number,
  "totalSugar": number,
  "totalProtein": number,
  "healthScore": number (1-10, where 10 is healthiest),
  "advice": "1-2 sentences of health advice about this meal"
}`;

    const result = await aiGenerateJSON<MealAnalysis>({ prompt, temperature: 0.2 });

    if (result && result.items) {
        // Cache each individual food item
        for (const item of result.items) {
            if (item.calories > 0 && !lookupFood(item.name)) {
                cacheAIFood({
                    name: item.name,
                    calories: item.calories,
                    sugar: item.sugar ?? 0,
                    protein: item.protein ?? 0,
                    carbs: item.carbs ?? 0,
                    fat: item.fat ?? 0,
                    fiber: item.fiber ?? 0,
                    servingSize: item.servingSize ?? '1 serving',
                });
            }
        }

        return result;
    }

    return null;
}

// ── Health Impact Calculation ──

/**
 * Calculate HP/mana impact from a meal based on its healthScore.
 */
export function calculateHealthImpact(healthScore: number): { hpImpact: number; manaImpact: number } {
    if (healthScore >= 8) return { hpImpact: Math.floor(Math.random() * 8 + 8), manaImpact: 5 };
    if (healthScore >= 6) return { hpImpact: Math.floor(Math.random() * 5 + 3), manaImpact: 2 };
    if (healthScore >= 4) return { hpImpact: 0, manaImpact: 0 };
    return { hpImpact: -Math.floor(Math.random() * 8 + 3), manaImpact: -3 };
}

// ── AI-Powered Meal Suggestion ──

export async function getMealSuggestion(
    bodyProfile: { targetWeightKg: number; weightKg: number; activityLevel: string } | null,
    caloriesConsumed: number,
    calorieTarget: number
): Promise<string | null> {
    if (!isAIAvailable()) return null;

    const remaining = calorieTarget - caloriesConsumed;
    const isLosing = bodyProfile && bodyProfile.targetWeightKg < bodyProfile.weightKg;

    const prompt = `You are a health nutrition advisor. Suggest a meal for someone who:
- Has ${remaining > 0 ? remaining : 0} calories remaining today (target: ${calorieTarget} cal)
- Is ${isLosing ? 'trying to lose weight' : 'maintaining/gaining weight'}  
- Activity level: ${bodyProfile?.activityLevel ?? 'moderate'}

Give ONE specific, practical meal suggestion in 1-2 sentences. Be encouraging.`;

    const response = await aiGenerate({ prompt, temperature: 0.8 });
    return response?.text ?? null;
}
