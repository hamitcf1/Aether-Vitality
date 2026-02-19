import { create } from 'zustand';
import {
    collection, doc, getDocs, updateDoc,
    arrayUnion, arrayRemove, query, where, addDoc, onSnapshot, orderBy, limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useUserStore } from './userStore';

export interface Guild {
    id: string;
    name: string;
    description: string;
    leaderId: string;
    members: string[]; // User UIDs
    level: number;
    xp: number;
    createdAt: number;
    icon: string;
}

export interface GuildChatMessage {
    id: string;
    userId: string;
    userName: string;
    content: string;
    timestamp: number;
}

interface GuildState {
    userGuild: Guild | null;
    availableGuilds: Guild[];
    messages: GuildChatMessage[];
    loading: boolean;
    error: string | null;
    unsubscribeChat: (() => void) | null;

    // Actions
    fetchUserGuild: (uid: string) => Promise<void>;
    fetchAvailableGuilds: () => Promise<void>;
    createGuild: (name: string, description: string, icon: string) => Promise<boolean>;
    joinGuild: (guildId: string) => Promise<boolean>;
    leaveGuild: () => Promise<void>;
    addXP: (amount: number) => Promise<void>;

    // Chat Actions
    subscribeToChat: (guildId: string) => void;
    sendMessage: (content: string) => Promise<void>;
    clearAllData: () => void;
}

export const useGuildStore = create<GuildState>((set, get) => ({
    userGuild: null,
    availableGuilds: [],
    messages: [],
    loading: false,
    error: null,
    unsubscribeChat: null,

    fetchUserGuild: async (uid: string) => {
        set({ loading: true, error: null });
        try {
            // Find guild where members array contains uid
            const q = query(collection(db, 'guilds'), where('members', 'array-contains', uid));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const guildData = snapshot.docs[0].data() as Guild;
                const guildId = snapshot.docs[0].id;
                set({ userGuild: { ...guildData, id: guildId }, loading: false });

                // Auto-subscribe to chat if guild found
                get().subscribeToChat(guildId);
            } else {
                set({ userGuild: null, loading: false });
            }
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    fetchAvailableGuilds: async () => {
        // Fetch all guilds for directory (limit to 20 for now)
        try {
            const snapshot = await getDocs(collection(db, 'guilds'));
            const guilds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Guild));
            set({ availableGuilds: guilds });
        } catch (error: any) {
            console.error("Error fetching guilds:", error);
        }
    },

    createGuild: async (name, description, icon) => {
        const user = useUserStore.getState().profile;
        if (!user) return false;

        set({ loading: true, error: null });
        try {
            const newGuild: Omit<Guild, 'id'> = {
                name,
                description,
                leaderId: user.uid,
                members: [user.uid],
                level: 1,
                xp: 0,
                createdAt: Date.now(),
                icon
            };

            const docRef = await addDoc(collection(db, 'guilds'), newGuild);
            const guildId = docRef.id;

            set({
                userGuild: { ...newGuild, id: guildId },
                loading: false
            });

            get().subscribeToChat(guildId);
            return true;
        } catch (error: any) {
            set({ error: error.message, loading: false });
            return false;
        }
    },

    joinGuild: async (guildId) => {
        const user = useUserStore.getState().profile;
        if (!user) return false;

        set({ loading: true, error: null });
        try {
            const guildRef = doc(db, 'guilds', guildId);
            await updateDoc(guildRef, {
                members: arrayUnion(user.uid)
            });

            // Refresh local state
            await get().fetchUserGuild(user.uid);
            return true;
        } catch (error: any) {
            set({ error: error.message, loading: false });
            return false;
        }
    },

    leaveGuild: async () => {
        const user = useUserStore.getState().profile;
        const guild = get().userGuild;

        // Unsubscribe from chat
        const unsub = get().unsubscribeChat;
        if (unsub) unsub();

        if (!user || !guild) return;

        set({ loading: true, messages: [], unsubscribeChat: null });
        try {
            const guildRef = doc(db, 'guilds', guild.id);
            await updateDoc(guildRef, {
                members: arrayRemove(user.uid)
            });
            set({ userGuild: null, loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    addXP: async (amount) => {
        const guild = get().userGuild;
        if (!guild) return;

        // Simple optimistic update + firestore
        const accXP = guild.xp + amount;
        let newLevel = guild.level;
        const xpForNextLevel = guild.level * 1000;

        if (accXP >= xpForNextLevel) {
            newLevel += 1;
        }

        try {
            const guildRef = doc(db, 'guilds', guild.id);
            await updateDoc(guildRef, {
                xp: accXP,
                level: newLevel
            });
            set({ userGuild: { ...guild, xp: accXP, level: newLevel } });
        } catch (error) {
            console.error("Failed to update guild XP", error);
        }
    },

    subscribeToChat: (guildId) => {
        // Unsubscribe existing
        const oldUnsub = get().unsubscribeChat;
        if (oldUnsub) oldUnsub();

        const q = query(
            collection(db, 'guilds', guildId, 'messages'),
            orderBy('timestamp', 'asc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as GuildChatMessage));
            set({ messages: msgs });
        });

        set({ unsubscribeChat: unsubscribe });
    },

    sendMessage: async (content) => {
        const user = useUserStore.getState().profile;
        const guild = get().userGuild;
        if (!user || !guild || !content.trim()) return;

        try {
            await addDoc(collection(db, 'guilds', guild.id, 'messages'), {
                userId: user.uid,
                userName: user.displayName || user.email.split('@')[0],
                content: content.trim(),
                timestamp: Date.now()
            });
        } catch (error) {
            console.error("Failed to send message", error);
        }
    },

    clearAllData: () => {
        const unsub = get().unsubscribeChat;
        if (unsub) unsub();
        set({
            userGuild: null,
            availableGuilds: [],
            messages: [],
            loading: false,
            error: null,
            unsubscribeChat: null,
        });
    },
}));

