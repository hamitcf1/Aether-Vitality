/**
 * Firestore Sync Utility
 *
 * Provides debounced save and one-time load for Zustand stores
 * backed by Firestore under users/{uid}/data/{docName}.
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// ── Debounce timers per doc path ──
const timers = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Save data to Firestore with debouncing (500ms).
 * Merges with existing data to avoid overwriting unrelated fields.
 */
export function saveToFirestore(
    uid: string,
    docName: string,
    data: Record<string, unknown>
): void {
    const path = `users/${uid}/data/${docName}`;

    // Clear existing timer for this path
    const existing = timers.get(path);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(async () => {
        timers.delete(path);
        try {
            const ref = doc(db, 'users', uid, 'data', docName);
            await setDoc(ref, { ...data, _updatedAt: Date.now() }, { merge: true });
        } catch (err) {
            console.error(`[firestoreSync] Failed to save ${path}:`, err);
        }
    }, 500);

    timers.set(path, timer);
}

/**
 * Load data from Firestore (one-time read).
 * Returns null if document doesn't exist.
 */
export async function loadFromFirestore(
    uid: string,
    docName: string
): Promise<Record<string, unknown> | null> {
    try {
        const ref = doc(db, 'users', uid, 'data', docName);
        const snap = await getDoc(ref);
        if (snap.exists()) {
            return snap.data() as Record<string, unknown>;
        }
        return null;
    } catch (err) {
        console.error(`[firestoreSync] Failed to load users/${uid}/data/${docName}:`, err);
        return null;
    }
}

/**
 * Flush all pending saves immediately (call before logout).
 */
export function flushPendingSaves(): void {
    timers.forEach((timer) => clearTimeout(timer));
    timers.clear();
}
