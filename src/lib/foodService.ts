import { collection, doc, setDoc, getDocs, query, limit, startAt, endAt, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import type { FoodItem } from './foodDatabase';

const FOODS_COLLECTION = 'foods';

// Normalize ID for consistent lookups (e.g. "Green Apple" -> "green_apple")
export const normalizeId = (name: string) => name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

/**
 * Add a food item to the global Firestore database.
 * Uses normalized name as ID to prevent duplicates.
 */
export async function addFoodToGlobalDB(food: FoodItem): Promise<void> {
    try {
        const id = normalizeId(food.name);
        // Ensure ID and category are set correctly
        const foodData = {
            ...food,
            id,
            nameLowerCase: food.name.toLowerCase(), // Helper for potential case-insensitive querying
        };

        await setDoc(doc(db, FOODS_COLLECTION, id), foodData, { merge: true });
        console.log(`Food saved to global DB: ${food.name}`);
    } catch (error) {
        console.error('Error adding food to global DB:', error);
    }
}

/**
 * Search for foods in the global DB.
 * Firestore doesn't support native fuzzy search, so we use:
 * 1. Exact match (via ID)
 * 2. Prefix match (using >= and <=) on name
 * 
 * Future improvement: Use Algolia or Typesense for true fuzzy search.
 */
export async function searchGlobalFoods(searchQuery: string): Promise<FoodItem[]> {
    const qRaw = searchQuery.toLowerCase().trim();
    if (!qRaw) return [];

    const results: FoodItem[] = [];
    const ids = new Set<string>();

    try {
        // 1. Prefix search on nameLowerCase
        // This simulates "starts with"
        const foodsRef = collection(db, FOODS_COLLECTION);
        const q = query(
            foodsRef,
            orderBy('nameLowerCase'),
            startAt(qRaw),
            endAt(qRaw + '\uf8ff'),
            limit(20)
        );

        const snapshot = await getDocs(q);
        snapshot.forEach((doc) => {
            if (!ids.has(doc.id)) {
                results.push(doc.data() as FoodItem);
                ids.add(doc.id);
            }
        });

    } catch (error) {
        console.error('Error searching global foods:', error);
    }

    return results;
}
