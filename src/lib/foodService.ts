import { collection, doc, setDoc, getDocs, query, limit, startAt, endAt, orderBy, where } from 'firebase/firestore';
import { db } from './firebase';
import type { FoodItem } from './foodDatabase';

const FOODS_COLLECTION = 'foods';

// Normalize ID for consistent lookups (e.g. "Green Apple" -> "green_apple")
export const normalizeId = (name: string) => name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

// Generate search keywords for fuzzy matching in Firestore
function generateKeywords(name: string): string[] {
    const rawWords = name.toLowerCase().split(/[\s()]+/).filter(w => w.length > 2);
    const keywords = new Set<string>();

    // Add full name and individual words
    keywords.add(name.toLowerCase());
    rawWords.forEach(w => keywords.add(w));

    // Generate prefixes for each word (min 3 chars, max 10 chars)
    rawWords.forEach(word => {
        let prefix = '';
        for (let i = 0; i < Math.min(10, word.length); i++) {
            prefix += word[i];
            if (prefix.length >= 3) {
                keywords.add(prefix);
            }
        }
    });

    return Array.from(keywords).slice(0, 30); // Limit to 30 keywords max to save DB space
}

/**
 * Add a food item to the global Firestore database.
 * Uses normalized name as ID to prevent duplicates.
 */
export async function addFoodToGlobalDB(food: FoodItem): Promise<void> {
    try {
        const id = normalizeId(food.name);
        const searchKeywords = generateKeywords(food.name);

        // Ensure ID and category are set correctly
        const foodData = {
            ...food,
            id,
            nameLowerCase: food.name.toLowerCase(), // Helper for exact/prefix querying
            searchKeywords, // Helper for array-contains substring querying
        };

        await setDoc(doc(db, FOODS_COLLECTION, id), foodData, { merge: true });
        console.log(`Food saved to global DB: ${food.name}`);
    } catch (error) {
        console.error('Error adding food to global DB:', error);
    }
}

/**
 * Search for foods in the global DB.
 * Uses both prefix search on nameLowerCase AND array-contains on searchKeywords
 * to allow finding foods by middle words (e.g. "Nohutlu" finds "Rice with chickpeas (Nohutlu Pilav)")
 */
export async function searchGlobalFoods(searchQuery: string): Promise<FoodItem[]> {
    const qRaw = searchQuery.toLowerCase().trim();
    if (!qRaw) return [];

    const results: FoodItem[] = [];
    const ids = new Set<string>();

    try {
        const foodsRef = collection(db, FOODS_COLLECTION);

        // 1. Array-contains search on searchKeywords (finds mid-string words and prefixes)
        const keywordQuery = query(
            foodsRef,
            where('searchKeywords', 'array-contains', qRaw),
            limit(15)
        );

        // 2. Prefix search on nameLowerCase (legacy compatibility)
        const prefixQuery = query(
            foodsRef,
            orderBy('nameLowerCase'),
            startAt(qRaw),
            endAt(qRaw + '\uf8ff'),
            limit(15)
        );

        // Run both queries in parallel
        const [keywordSnapshot, prefixSnapshot] = await Promise.all([
            getDocs(keywordQuery),
            getDocs(prefixQuery)
        ]);

        // Merge results, deduplicating by ID
        keywordSnapshot.forEach((doc) => {
            if (!ids.has(doc.id)) {
                results.push(doc.data() as FoodItem);
                ids.add(doc.id);
            }
        });

        prefixSnapshot.forEach((doc) => {
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
