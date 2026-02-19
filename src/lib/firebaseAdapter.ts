/**
 * Firebase Adapter — localStorage stub
 * 
 * All methods use localStorage now. When Firebase is ready,
 * swap the implementation to Firestore calls with the same interface.
 */

const FIREBASE_ENABLED = false;

export function isFirebaseEnabled(): boolean {
    return FIREBASE_ENABLED;
}

// ── User Data ──

export function saveUserData(uid: string, data: Record<string, unknown>): void {
    if (FIREBASE_ENABLED) {
        // TODO: Firestore set(doc(db, 'users', uid), data, { merge: true })
        return;
    }
    const existing = JSON.parse(localStorage.getItem(`fb_user_${uid}`) ?? '{}');
    localStorage.setItem(`fb_user_${uid}`, JSON.stringify({ ...existing, ...data }));
}

export function loadUserData(uid: string): Record<string, unknown> | null {
    if (FIREBASE_ENABLED) {
        // TODO: Firestore getDoc(doc(db, 'users', uid))
        return null;
    }
    const raw = localStorage.getItem(`fb_user_${uid}`);
    return raw ? JSON.parse(raw) : null;
}

// ── Food Cache (Global) ──

export function saveFoodCache(normalizedName: string, nutrition: Record<string, unknown>): void {
    if (FIREBASE_ENABLED) {
        // TODO: Firestore set(doc(db, 'ai_cache', 'foods', normalizedName), nutrition)
        return;
    }
    const cache = JSON.parse(localStorage.getItem('fb_food_cache') ?? '{}');
    cache[normalizedName] = { ...nutrition, updatedAt: Date.now() };
    localStorage.setItem('fb_food_cache', JSON.stringify(cache));
}

export function loadFoodCache(normalizedName: string): Record<string, unknown> | null {
    if (FIREBASE_ENABLED) {
        // TODO: Firestore getDoc(doc(db, 'ai_cache', 'foods', normalizedName))
        return null;
    }
    const cache = JSON.parse(localStorage.getItem('fb_food_cache') ?? '{}');
    return cache[normalizedName] ?? null;
}

// ── Tracker Data ──

export function saveDailyTracker(uid: string, date: string, data: Record<string, unknown>): void {
    if (FIREBASE_ENABLED) {
        // TODO: Firestore set(doc(db, 'users', uid, 'trackers', date), data, { merge: true })
        return;
    }
    const key = `fb_tracker_${uid}_${date}`;
    const existing = JSON.parse(localStorage.getItem(key) ?? '{}');
    localStorage.setItem(key, JSON.stringify({ ...existing, ...data }));
}

export function loadDailyTracker(uid: string, date: string): Record<string, unknown> | null {
    if (FIREBASE_ENABLED) {
        // TODO: Firestore getDoc(doc(db, 'users', uid, 'trackers', date))
        return null;
    }
    const raw = localStorage.getItem(`fb_tracker_${uid}_${date}`);
    return raw ? JSON.parse(raw) : null;
}
