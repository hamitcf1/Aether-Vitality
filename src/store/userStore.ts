import { create } from 'zustand';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PackageTier, PACKAGES, DEFAULT_PACKAGE, type PackageFeatures } from '../constants/packages';

interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    packageTier: PackageTier;
    // Add other profile fields as needed
}

interface UserState {
    profile: UserProfile | null;
    features: PackageFeatures;
    loading: boolean;
    error: string | null;

    // Actions
    subscribeToProfile: (uid: string) => () => void;
    updatePackage: (tier: PackageTier) => Promise<void>;
    clearProfile: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
    profile: null,
    features: PACKAGES[DEFAULT_PACKAGE],
    loading: false,
    error: null,

    subscribeToProfile: (uid: string) => {
        set({ loading: true });
        const userRef = doc(db, 'users', uid);

        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const packageTier = data.packageTier || DEFAULT_PACKAGE;

                set({
                    profile: { ...data, uid, packageTier } as UserProfile,
                    features: PACKAGES[packageTier as PackageTier] || PACKAGES[DEFAULT_PACKAGE],
                    loading: false,
                    error: null
                });
            } else {
                set({ loading: false, error: 'User profile not found' });
            }
        }, (error) => {
            console.error("Error fetching user profile:", error);
            set({ loading: false, error: error.message });
        });

        return unsubscribe;
    },

    updatePackage: async (tier: PackageTier) => {
        const { profile } = get();
        if (!profile) return;

        try {
            const userRef = doc(db, 'users', profile.uid);
            await updateDoc(userRef, { packageTier: tier });
            // Snapshot listener will update state
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Failed to update package';
            set({ error: msg });
        }
    },

    clearProfile: () => {
        set({
            profile: null,
            features: PACKAGES[DEFAULT_PACKAGE],
            loading: false,
            error: null
        });
    }
}));
