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
    timestamp: number; // Firestore timestamp
    type: 'text' | 'system';
}

export interface Raid {
    id: string;
    bossName: string;
    bossImage: string; // Emoji
    totalHp: number;
    currentHp: number;
    level: number;
    status: 'active' | 'defeated' | 'failed';
    startTime: string;
    endTime: string;
    contributors: Record<string, number>; // uid -> damage dealt
}

interface GuildsState {
    activeGuild: Guild | null;
    messages: GuildMessage[];
    publicGuilds: Guild[];
    activeRaid: Raid | null; // Current raid
    loading: boolean;
    error: string | null;

    // Actions
    fetchPublicGuilds: () => Promise<void>;
    createGuild: (name: string, description: string, privacy: 'public' | 'private') => Promise<void>;
    joinGuild: (guildId: string) => Promise<void>;
    leaveGuild: () => Promise<void>;
    sendMessage: (content: string) => Promise<void>;
    subscribeToGuild: (guildId: string) => () => void;

    // Raid Actions
    startRaid: () => Promise<void>;
    attackBoss: () => Promise<number>; // Returns damage dealt
    dealBossDamage: (amount: number) => Promise<void>; // Passive damage from habits
}

export const useGuildsStore = create<GuildsState>((set, get) => ({
    activeGuild: null,
    messages: [],
    publicGuilds: [],
    activeRaid: null,
    loading: false,
    error: null,

    fetchPublicGuilds: async () => {
        set({ loading: true, error: null });
        try {
            const q = query(collection(db, 'guilds'), where('privacy', '==', 'public'), limit(20));
            const snapshot = await getDocs(q);
            const guilds = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Guild));
            set({ publicGuilds: guilds, loading: false });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : String(error), loading: false });
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
        } catch (error) {
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
        } catch (error) {
            set({ error: error instanceof Error ? error.message : String(error) });
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

            set({ activeGuild: null, messages: [], activeRaid: null });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : String(error) });
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

    startRaid: async () => {
        const user = useAuthStore.getState().user;
        const { activeGuild } = get();
        if (!user || !activeGuild || user.uid !== activeGuild.leaderId) return; // Leader only

        // Define Boss
        const bossName = "The Abyssal Titan";
        const totalHp = 5000; // Starting HP
        const raidId = `raid_${Date.now()}`;

        const newRaid: Raid = {
            id: raidId,
            bossName,
            bossImage: "👹",
            totalHp,
            currentHp: totalHp,
            level: 1,
            status: 'active' as const,
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
            contributors: {}
        };

        try {
            await setDoc(doc(db, 'guilds', activeGuild.id, 'raids', 'active'), newRaid);
        } catch (error) {
            set({ error: error instanceof Error ? error.message : String(error) });
        }
    },

    attackBoss: async () => {
        const user = useAuthStore.getState().user;
        const { activeGuild, activeRaid } = get();
        if (!user || !activeGuild || !activeRaid || activeRaid.status !== 'active') return 0;

        const aetherState = useAetherStore.getState();
        const userLevel = aetherState.level || 1;
        const streak = aetherState.streak || 0;

        // Damage Formula
        // Base: 10
        // Level Bonus: Level * 2
        // Streak Bonus: Streak * 5
        // Random: 0-20
        // Crit Chance: 10% (x2)
        let damage = 10 + (userLevel * 2) + (streak * 5) + Math.floor(Math.random() * 20);
        const isCrit = Math.random() < 0.1;
        if (isCrit) damage *= 2;

        const newHp = Math.max(0, activeRaid.currentHp - damage);
        const status: Raid['status'] = newHp === 0 ? 'defeated' : 'active';

        // Optimistic Update
        const updatedRaid = {
            ...activeRaid,
            currentHp: newHp,
            status,
            contributors: {
                ...activeRaid.contributors,
                [user.uid]: (activeRaid.contributors[user.uid] || 0) + damage
            }
        };
        set({ activeRaid: updatedRaid });

        try {
            // Firestore Update
            const raidRef = doc(db, 'guilds', activeGuild.id, 'raids', 'active');
            await updateDoc(raidRef, {
                currentHp: newHp,
                status,
                [`contributors.${user.uid}`]: (activeRaid.contributors[user.uid] || 0) + damage
            });

            // If defeated, maybe give rewards? (Future)
            if (status === 'defeated') {
                await addDoc(collection(db, 'guilds', activeGuild.id, 'messages'), {
                    senderId: 'system',
                    senderName: 'System',
                    content: `🏆 The ${activeRaid.bossName} has been defeated by ${aetherState.profile?.name}!`,
                    timestamp: new Date(),
                    type: 'system'
                });
            }

            return damage;
        } catch (error) {
            console.error("Attack failed:", error);
            // Revert on error would be ideal, but for now just log
            return 0;
        }
    },

    dealBossDamage: async (amount: number) => {
        const user = useAuthStore.getState().user;
        const { activeGuild, activeRaid } = get();
        if (!user || !activeGuild || !activeRaid || activeRaid.status !== 'active') return;

        const newHp = Math.max(0, activeRaid.currentHp - amount);
        const status: Raid['status'] = newHp === 0 ? 'defeated' : 'active';

        const updatedRaid = {
            ...activeRaid,
            currentHp: newHp,
            status,
            contributors: {
                ...activeRaid.contributors,
                [user.uid]: (activeRaid.contributors[user.uid] || 0) + amount
            }
        };
        set({ activeRaid: updatedRaid });

        try {
            const raidRef = doc(db, 'guilds', activeGuild.id, 'raids', 'active');
            await updateDoc(raidRef, {
                currentHp: newHp,
                status,
                [`contributors.${user.uid}`]: (activeRaid.contributors[user.uid] || 0) + amount
            });

            if (status === 'defeated') {
                const aetherState = useAetherStore.getState();
                const userName = aetherState.profile?.name || 'A dedicated Seeker';
                await addDoc(collection(db, 'guilds', activeGuild.id, 'messages'), {
                    senderId: 'system',
                    senderName: 'System',
                    content: `🏆 The ${activeRaid.bossName} has been defeated! The final blow was delivered by ${userName}'s continuous efforts!`,
                    timestamp: new Date(),
                    type: 'system'
                });
            }
        } catch (error) {
            console.error("Passive damage failed:", error);
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
        const qChat = query(
            collection(db, 'guilds', guildId, 'messages'),
            orderBy('timestamp', 'desc'),
            limit(50)
        );

        const unsubChat = onSnapshot(qChat, (snapshot) => {
            const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as GuildMessage)).reverse();
            set({ messages: msgs });
        });

        // Subscribe to Active Raid
        const unsubRaid = onSnapshot(doc(db, 'guilds', guildId, 'raids', 'active'), (doc) => {
            if (doc.exists()) {
                set({ activeRaid: { id: doc.id, ...doc.data() } as Raid });
            } else {
                set({ activeRaid: null });
            }
        });

        return () => {
            unsubGuild();
            unsubChat();
            unsubRaid();
        };
    }
}));

