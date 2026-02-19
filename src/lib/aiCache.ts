import { useAIStore, type FoodNutritionCache } from '../store/aiStore';
import { FOOD_DATABASE, searchFoods, type FoodItem } from './foodDatabase';

// ── Normalize food name for cache lookup ──

function normalize(name: string): string {
    return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

// ── Convert local FoodItem to FoodNutritionCache ──

function foodItemToCache(item: FoodItem): FoodNutritionCache {
    return {
        name: item.name,
        calories: item.calories,
        sugar: item.sugar,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        fiber: 0,
        source: 'database',
        timestamp: Date.now(),
        servingSize: item.servingSize,
    };
}

// ── Cache-First Food Lookup ──

/**
 * Look up food nutrition in this order:
 * 1. AI cache (previously analyzed foods)
 * 2. Local food database
 * 3. Returns null → caller should ask AI
 */
export function lookupFood(name: string): FoodNutritionCache | null {
    const store = useAIStore.getState();

    // 1. Check AI/user cache
    const cached = store.getCachedFood(name);
    if (cached) return cached;

    // 2. Check local database (exact match)
    const normalized = normalize(name);
    const dbItem = FOOD_DATABASE.find(
        (f) => normalize(f.name) === normalized || normalize(f.emoji + ' ' + f.name) === normalized
    );
    if (dbItem) {
        const cacheEntry = foodItemToCache(dbItem);
        store.cacheFood(cacheEntry); // Save to cache for faster future lookups
        return cacheEntry;
    }

    // 3. Fuzzy search local database
    const searchResults = searchFoods(name);
    if (searchResults.length === 1 && normalize(searchResults[0].name).includes(normalized)) {
        const cacheEntry = foodItemToCache(searchResults[0]);
        store.cacheFood(cacheEntry);
        return cacheEntry;
    }

    return null;
}

/**
 * Save AI-analyzed food to cache.
 * Call this after getting nutrition from AI to prevent re-analyzing.
 */
export function cacheAIFood(data: {
    name: string;
    calories: number;
    sugar: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    servingSize?: string;
}): void {
    useAIStore.getState().cacheFood({
        name: data.name,
        calories: data.calories,
        sugar: data.sugar,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        fiber: data.fiber ?? 0,
        source: 'ai',
        timestamp: Date.now(),
        servingSize: data.servingSize ?? '1 serving',
    });
}

/**
 * Get all cached foods (for display/export).
 */
export function getAllCachedFoods(): FoodNutritionCache[] {
    return Object.values(useAIStore.getState().foodCache);
}

/**
 * Check if a food is already cached.
 */
export function isFoodCached(name: string): boolean {
    return useAIStore.getState().getCachedFood(name) !== null;
}
