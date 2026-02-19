import { create } from 'zustand';
import { db } from '../lib/firebase';
import {
    collection, doc, setDoc, updateDoc, arrayUnion, arrayRemove,
    onSnapshot, query, orderBy, limit, addDoc, getDoc, where, getDocs
} from 'firebase/firestore';
import { useAetherStore } from './aetherStore';
import { useAuthStore } from './authStore';

export interface Guild {
    id: string;
    name: string;
    description: string;
    leaderId: string;
    leaderName: string;
    memberIds: string[];
    level: number;
    xp: number;
    privacy: 'public' | 'private';
    createdAt: string;
    theme: string; // 'midnight', 'gold', etc.
}

export interface GuildMessage {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: any; // Firestore timestamp
    type: 'text' | 'system';
}

interface GuildsState {
    activeGuild: Guild | null;
    messages: GuildMessage[];
    publicGuilds: Guild[];
    loading: boolean;
    error: string | null;

    // Actions
    fetchPublicGuilds: () => Promise<void>;
    createGuild: (name: string, description: string, privacy: 'public' | 'private') => Promise<void>;
    joinGuild: (guildId: string) => Promise<void>;
    leaveGuild: () => Promise<void>;
    sendMessage: (content: string) => Promise<void>;
    subscribeToGuild: (guildId: string) => () => void; // Returns unsubscribe function
}

export const useGuildsStore = create<GuildsState>((set, get) => ({
    activeGuild: null,
    messages: [],
    publicGuilds: [],
    loading: false,
    error: null,

    fetchPublicGuilds: async () => {
        set({ loading: true, error: null });
        try {
            const q = query(collection(db, 'guilds'), where('privacy', '==', 'public'), limit(20));
            const snapshot = await getDocs(q);
            const guilds = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Guild));
            set({ publicGuilds: guilds, loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    createGuild: async (name, description, privacy) => {
        const user = useAuthStore.getState().user;
        if (!user) throw new Error("Must be logged in");

        const aetherState = useAetherStore.getState();
        const userName = aetherState.profile?.name || user.displayName || 'Unknown';

        const guildId = `guild_${Date.now()}`;
        const newGuild: Guild = {
            id: guildId,
            name,
            description,
            leaderId: user.uid,
            leaderName: userName,
            memberIds: [user.uid],
            level: 1,
            xp: 0,
            privacy,
            createdAt: new Date().toISOString(),
            theme: 'midnight'
        };

        try {
            await setDoc(doc(db, 'guilds', guildId), newGuild);

            // Update User Profile in Aether Store (triggers persistence)
            if (aetherState.profile) {
                aetherState.setProfile({ ...aetherState.profile, guildId });
            }

            set({ activeGuild: newGuild });
        } catch (error: any) {
            console.error("Error creating guild:", error);
            throw error;
        }
    },

    joinGuild: async (guildId) => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        try {
            const guildRef = doc(db, 'guilds', guildId);
            const guildSnap = await getDoc(guildRef);

            if (!guildSnap.exists()) throw new Error("Guild not found");

            const guildData = guildSnap.data() as Guild;
            if (guildData.memberIds.includes(user.uid)) return; // Already joined

            await updateDoc(guildRef, {
                memberIds: arrayUnion(user.uid)
            });

            // Update local profile
            const aetherState = useAetherStore.getState();
            if (aetherState.profile) {
                aetherState.setProfile({ ...aetherState.profile, guildId });
            }

            set({ activeGuild: { ...guildData, memberIds: [...guildData.memberIds, user.uid] } });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    leaveGuild: async () => {
        const user = useAuthStore.getState().user;
        const { activeGuild } = get();
        if (!user || !activeGuild) return;

        try {
            await updateDoc(doc(db, 'guilds', activeGuild.id), {
                memberIds: arrayRemove(user.uid)
            });

            const aetherState = useAetherStore.getState();
            if (aetherState.profile) {
                // Remove guildId from profile
                const newProfile = { ...aetherState.profile };
                delete newProfile.guildId;
                aetherState.setProfile(newProfile);
            }

            set({ activeGuild: null, messages: [] });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    sendMessage: async (content) => {
        const user = useAuthStore.getState().user;
        const { activeGuild } = get();
        if (!user || !activeGuild) return;

        const aetherState = useAetherStore.getState();
        const userName = aetherState.profile?.name || user.displayName || 'Unknown';

        try {
            await addDoc(collection(db, 'guilds', activeGuild.id, 'messages'), {
                senderId: user.uid,
                senderName: userName,
                content,
                timestamp: new Date(), // Firestore will convert this or we use serverTimestamp()
                type: 'text'
            });
        } catch (error) {
            console.error("Error sending message:", error);
        }
    },

    subscribeToGuild: (guildId) => {
        // Subscribe to Guild Data (Level, Members)
        const unsubGuild = onSnapshot(doc(db, 'guilds', guildId), (doc) => {
            if (doc.exists()) {
                set({ activeGuild: { id: doc.id, ...doc.data() } as Guild });
            }
        });

        // Subscribe to Chat Messages
        const q = query(
            collection(db, 'guilds', guildId, 'messages'),
            orderBy('timestamp', 'desc'),
            limit(50)
        );

        const unsubChat = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as GuildMessage)).reverse();
            set({ messages: msgs });
        });

        return () => {
            unsubGuild();
            unsubChat();
        };
    }
}));
