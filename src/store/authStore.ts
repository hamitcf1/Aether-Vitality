import { create } from 'zustand';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    updateProfile,
    type User,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

// ── Types ──

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
    initialized: boolean;

    // Actions
    signInWithEmail: (email: string, password: string) => Promise<boolean>;
    signUpWithEmail: (email: string, password: string, displayName: string) => Promise<boolean>;
    signInWithGoogle: () => Promise<boolean>;
    signOut: () => Promise<void>;
    clearError: () => void;
    initAuthListener: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: true,
    error: null,
    initialized: false,

    signInWithEmail: async (email, password) => {
        set({ loading: true, error: null });
        try {
            await signInWithEmailAndPassword(auth, email, password);
            set({ loading: false });
            return true;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Login failed';
            const friendly = friendlyError(msg);
            set({ loading: false, error: friendly });
            return false;
        }
    },

    signUpWithEmail: async (email, password, displayName) => {
        set({ loading: true, error: null });
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(cred.user, { displayName });

            // Create Firestore user document
            const { doc, setDoc } = await import('firebase/firestore');
            const { db } = await import('../lib/firebase');
            await setDoc(doc(db, 'users', cred.user.uid), {
                uid: cred.user.uid,
                email: cred.user.email,
                displayName,
                photoURL: cred.user.photoURL || '',
                createdAt: Date.now(),
                healthGoal: 'liver',
                difficulty: 'casual',
            });

            set({ user: cred.user, loading: false });

            // Subscribe to user profile
            const { useUserStore } = await import('./userStore');
            useUserStore.getState().subscribeToProfile(cred.user.uid);

            return true;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Registration failed';
            const friendly = friendlyError(msg);
            set({ loading: false, error: friendly });
            return false;
        }
    },

    signInWithGoogle: async () => {
        set({ loading: true, error: null });
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if user doc exists, if not create it
            const { doc, getDoc, setDoc } = await import('firebase/firestore');
            const { db } = await import('../lib/firebase');

            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    createdAt: Date.now(),
                    healthGoal: 'liver', // default
                    difficulty: 'casual', // default
                });
            }

            set({ loading: false });

            // Subscribe to user profile
            const { useUserStore } = await import('./userStore');
            useUserStore.getState().subscribeToProfile(user.uid);

            return true;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Google sign-in failed';
            // Don't show error for cancelled popup
            if (msg.includes('popup-closed-by-user') || msg.includes('cancelled')) {
                set({ loading: false, error: null });
                return false;
            }
            const friendly = friendlyError(msg);
            set({ loading: false, error: friendly });
            return false;
        }
    },

    signOut: async () => {
        set({ loading: true });

        // Flush any pending debounced saves
        const { flushPendingSaves } = await import('../lib/firestoreSync');
        flushPendingSaves();

        // Clear ALL stores before signing out
        const { useUserStore } = await import('./userStore');
        const { useAetherStore } = await import('./aetherStore');
        const { useTrackersStore } = await import('./trackersStore');
        const { useAIStore } = await import('./aiStore');
        const { useJournalStore } = await import('./journalStore');
        const { useFoodStore } = await import('./foodStore');
        const { useGuildStore } = await import('./guildStore');

        // Clear user profile (also unsubscribes Firestore listener)
        useUserStore.getState().clearProfile();

        // Clear all stores
        useAetherStore.getState().clearAllData();
        useTrackersStore.getState().clearAllData();
        useAIStore.getState().clearAllData();
        useJournalStore.getState().clearAllData();
        useFoodStore.getState().clearAllData();
        useGuildStore.getState().clearAllData();

        await firebaseSignOut(auth);
        set({ user: null, loading: false });
    },

    clearError: () => set({ error: null }),

    initAuthListener: () => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Load all Firestore-backed stores
                const { useUserStore } = await import('./userStore');
                const { useAetherStore } = await import('./aetherStore');
                const { useTrackersStore } = await import('./trackersStore');
                const { useAIStore } = await import('./aiStore');
                const { useJournalStore } = await import('./journalStore');

                useUserStore.getState().subscribeToProfile(user.uid);
                useAetherStore.getState().loadData(user.uid);
                useTrackersStore.getState().loadData(user.uid);
                useAIStore.getState().loadData(user.uid);
                useJournalStore.getState().loadData(user.uid);
            } else {
                // User logged out — clear user profile (listener is cleaned via clearProfile)
                const { useUserStore } = await import('./userStore');
                useUserStore.getState().clearProfile();
            }
            set({ user, loading: false, initialized: true });
        });
        return unsubscribe;
    },
}));

// ── Helpers ──

function friendlyError(msg: string): string {
    if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        return 'Invalid email or password.';
    }
    if (msg.includes('email-already-in-use')) {
        return 'An account with this email already exists.';
    }
    if (msg.includes('weak-password')) {
        return 'Password must be at least 6 characters.';
    }
    if (msg.includes('invalid-email')) {
        return 'Please enter a valid email address.';
    }
    if (msg.includes('too-many-requests')) {
        return 'Too many attempts. Please try again later.';
    }
    if (msg.includes('network-request-failed')) {
        return 'Network error. Check your connection.';
    }
    return msg;
}
