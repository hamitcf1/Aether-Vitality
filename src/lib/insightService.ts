import { doc, getDoc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Fetch the global pool of daily insights.
 */
export async function getInsightPool(): Promise<string[]> {
    try {
        const docRef = doc(db, 'global', 'alchemist_insights');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data().insights || [];
        } else {
            // Create the document if it doesn't exist
            await setDoc(docRef, { insights: [] });
            return [];
        }
    } catch (error) {
        console.error('Error fetching insight pool:', error);
        return []; // Return empty array on failure
    }
}

/**
 * Add a new AI-generated insight to the global pool.
 */
export async function addToInsightPool(insight: string): Promise<void> {
    try {
        const docRef = doc(db, 'global', 'alchemist_insights');
        await updateDoc(docRef, {
            insights: arrayUnion(insight)
        });
    } catch (error) {
        console.error('Error adding to insight pool:', error);
        // If it failed because it doesn't exist, try creating it
        try {
            const docRef = doc(db, 'global', 'alchemist_insights');
            await setDoc(docRef, { insights: [insight] }, { merge: true });
        } catch (e) {
            console.error('Failed to create insight pool document:', e);
        }
    }
}
