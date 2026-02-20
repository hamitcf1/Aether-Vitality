/**
 * Firestore Sync Utility
 *
 * Provides debounced save and one-time load for Zustand stores
 * backed by Firestore under users/{uid}/data/{docName}.
 */

import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

// ── Pending save queue ──
interface PendingSave {
    timer: ReturnType<typeof setTimeout>;
    uid: string;
    docName: string;
    data: Record<string, unknown>;
}

const pending = new Map<string, PendingSave>();

/**
 * Actually write data to Firestore (helper).
 */
async function writeSave(uid: string, docName: string, data: Record<string, unknown>) {
    try {
        const ref = doc(db, 'users', uid, 'data', docName);
        await setDoc(ref, { ...data, _updatedAt: Date.now() }, { merge: true });
    } catch (err) {
        console.error(`[firestoreSync] Failed to save users/${uid}/data/${docName}:`, err);
    }
}

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
    const existing = pending.get(path);
    if (existing) clearTimeout(existing.timer);

    const timer = setTimeout(() => {
        pending.delete(path);
        writeSave(uid, docName, data);
    }, 2000);

    pending.set(path, { timer, uid, docName, data });
}

/**
 * Immediately save to Firestore (bypasses debounce).
 * Use for critical writes like completeOnboarding.
 */
export async function saveToFirestoreImmediate(
    uid: string,
    docName: string,
    data: Record<string, unknown>
): Promise<void> {
    const path = `users/${uid}/data/${docName}`;

    // Cancel any pending debounced save for this path
    const existing = pending.get(path);
    if (existing) {
        clearTimeout(existing.timer);
        pending.delete(path);
    }

    await writeSave(uid, docName, data);
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
 * Flush all pending saves immediately — actually executes them (call before logout).
 */
export function flushPendingSaves(): void {
    pending.forEach((save) => {
        clearTimeout(save.timer);
        writeSave(save.uid, save.docName, save.data);
    });
    pending.clear();
}

// ── Leaderboard Sync ──
const pendingLeaderboard = new Map<string, ReturnType<typeof setTimeout>>();

export function syncToLeaderboard(uid: string, data: {
    name: string;
    avatar: string;
    level: number;
    xp: number;
    title: string;
}) {
    const existing = pendingLeaderboard.get(uid);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(async () => {
        pendingLeaderboard.delete(uid);
        try {
            const ref = doc(db, 'global_leaderboard', uid);
            await setDoc(ref, {
                ...data,
                _updatedAt: Date.now()
            }, { merge: true });
        } catch (err) {
            console.error(`[firestoreSync] Failed to sync leaderboard:`, err);
        }
    }, 5000);

    pendingLeaderboard.set(uid, timer);
}

export async function removeFromLeaderboard(uid: string) {
    try {
        const existing = pendingLeaderboard.get(uid);
        if (existing) {
            clearTimeout(existing);
            pendingLeaderboard.delete(uid);
        }
        const ref = doc(db, 'global_leaderboard', uid);
        await deleteDoc(ref);
    } catch (err) {
        console.error(`[firestoreSync] Failed to remove from leaderboard:`, err);
    }
}
