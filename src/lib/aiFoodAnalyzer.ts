import { aiGenerateJSON, aiGenerate, isAIAvailable } from './aiProvider';
import { lookupFood, cacheAIFood } from './aiCache';
import { addFoodToGlobalDB } from './foodService';
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
    quantity: number;
    servingSize: string;
    emoji?: string;
    category?: 'fruit' | 'vegetable' | 'protein' | 'grain' | 'dairy' | 'snack' | 'drink' | 'fast-food' | 'meal';
}

export interface MealAnalysis {
    items: FoodAnalysis[];
    totalCalories: number;
    totalSugar: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
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
  "servingSize": "description of one standard serving",
  "emoji": "single emoji representing the food",
  "category": "one of: fruit, vegetable, protein, grain, dairy, snack, drink, fast-food, meal"
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

        // Save to global Firestore DB
        addFoodToGlobalDB({
            id: result.name.toLowerCase().replace(/\s+/g, '_'),
            name: result.name,
            emoji: result.emoji || '🍽️',
            calories: result.calories,
            sugar: result.sugar ?? 0,
            protein: result.protein ?? 0,
            carbs: result.carbs ?? 0,
            fat: result.fat ?? 0,
            servingSize: result.servingSize ?? '1 serving',
            category: result.category || 'meal',
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
    The meal description may be in Turkish or English. Translate food names to English for the "name" field if they are in Turkish, but keep the original Turkish name in parentheses if it helps clarity.
    
    For each item, provide nutritional analysis per the portion described.
    IMPORTANT: All numerical values (calories, sugar, protein, carbs, fat, fiber) MUST be numbers, NOT strings. Do not include units like "g" or "kcal" in the number fields. If a value is unknown, use 0. Ensure the totalCalories matches the sum of the items.
    
    Meal: "${description}"
    
    Return ONLY valid JSON (no markdown):
    {
      "items": [
        { "name": "food name", "quantity": number, "calories": number, "sugar": number, "protein": number, "carbs": number, "fat": number, "fiber": number, "servingSize": "described portion", "emoji": "single emoji", "category": "category string" }
      ],
      "totalCalories": number,
      "totalSugar": number,
      "totalProtein": number,
      "totalCarbs": number,
      "totalFat": number,
      "healthScore": number (1-10, where 10 is healthiest),
      "advice": "1-2 sentences of health advice about this meal in the same language as the input"
    }`;

    const result = await aiGenerateJSON<MealAnalysis>({ prompt, temperature: 0.2 });

    if (result) {
        // Cache each individual food item if present
        if (result.items && Array.isArray(result.items)) {
            for (const item of result.items) {
                const calories = Number(item.calories) || 0;
                if (calories > 0 && !lookupFood(item.name)) {
                    cacheAIFood({
                        name: item.name,
                        calories: calories,
                        sugar: Number(item.sugar) || 0,
                        protein: Number(item.protein) || 0,
                        carbs: Number(item.carbs) || 0,
                        fat: Number(item.fat) || 0,
                        fiber: Number(item.fiber) || 0,
                        servingSize: item.servingSize ?? '1 serving',
                    });

                    // Save to global Firestore DB
                    const safeId = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
                    const safeCategory = ['fruit', 'vegetable', 'protein', 'grain', 'dairy', 'snack', 'drink', 'fast-food', 'meal'].includes(item.category || '') ? item.category : 'meal';

                    if (safeId) {
                        addFoodToGlobalDB({
                            id: safeId,
                            name: item.name,
                            emoji: item.emoji || '🍽️',
                            calories: calories,
                            sugar: Number(item.sugar) || 0,
                            protein: Number(item.protein) || 0,
                            carbs: Number(item.carbs) || 0,
                            fat: Number(item.fat) || 0,
                            servingSize: item.servingSize ?? '1 serving',
                            category: safeCategory as any,
                        });
                    }
                }
            }
        }

        // Ensure total attributes are numbers
        result.totalCalories = Number(result.totalCalories) || 0;
        result.totalSugar = Number(result.totalSugar) || 0;
        result.totalProtein = Number(result.totalProtein) || 0;
        result.totalCarbs = Number(result.totalCarbs) || 0;
        result.totalFat = Number(result.totalFat) || 0;
        result.healthScore = Number(result.healthScore) || 5;

        return result;
    }

    return null;
}

/**
 * Validate if a text input describes real food, drink, or meals.
 * Accepts any language.
 */
export async function validateFoodInput(text: string): Promise<{ isFood: boolean; reason: string }> {
    if (!text.trim()) return { isFood: false, reason: 'Empty input' };
    if (!isAIAvailable()) return { isFood: true, reason: 'AI unavailable' };

    const prompt = `Check if the following text describes actual food, drink, snack, or meal. 
    Accept any language.
    Input: "${text}"
    
    Respond ONLY with valid JSON structure (no markdown):
    {
      "isFood": boolean,
      "reason": "1 short sentence explaining why it is or isn't food in the same language as the input"
    }`;

    try {
        const result = await aiGenerateJSON<{ isFood: boolean; reason: string }>({ prompt, temperature: 0.1 });
        return result || { isFood: true, reason: 'Validation passed' };
    } catch (e) {
        return { isFood: true, reason: 'Validation error, allowing' };
    }
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
