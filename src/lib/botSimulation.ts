import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { getLevelFromXP } from './achievements';

// Realistic bot profiles
const BOT_PROFILES = [
    { id: 'bot_01', name: 'Elena R.', avatar: '🧝‍♀️' },
    { id: 'bot_02', name: 'ZenMaster', avatar: '🧘‍♂️' },
    { id: 'bot_03', name: 'Marcus V.', avatar: '🧙‍♂️' },
    { id: 'bot_04', name: 'Aria Silver', avatar: '🧚‍♀️' },
    { id: 'bot_05', name: 'Iron Will', avatar: '🛡️' },
    { id: 'bot_06', name: 'Sarah_Fit', avatar: '🏃‍♀️' },
    { id: 'bot_07', name: 'David G.', avatar: '🏋️‍♂️' },
    { id: 'bot_08', name: 'Mystic Aura', avatar: '🔮' },
    { id: 'bot_09', name: 'John Doe', avatar: '🧑' },
    { id: 'bot_10', name: 'Luna_Love', avatar: '🌙' },
    { id: 'bot_11', name: 'Alex H.', avatar: '👨‍🚀' },
    { id: 'bot_12', name: 'Quiet Mind', avatar: '🍃' },
    { id: 'bot_13', name: 'Leo The Lion', avatar: '🦁' },
    { id: 'bot_14', name: 'Emma Watson', avatar: '👩‍🎓' },
    { id: 'bot_15', name: 'Shadow Ninja', avatar: '🥷' },
    { id: 'bot_16', name: 'Sun Gazer', avatar: '☀️' },
    { id: 'bot_17', name: 'River Flow', avatar: '🌊' },
    { id: 'bot_18', name: 'Mountain Peak', avatar: '⛰️' },
    { id: 'bot_19', name: 'Cosmic Dust', avatar: '✨' },
    { id: 'bot_20', name: 'Forest Spirit', avatar: '🌲' },
];

const BOT_UPDATE_INTERVAL_MS = 12 * 60 * 60 * 1000; // 12 hours

// Helper to determine a somewhat realistic title based on level/xp
const getRealisticTitle = (level: number) => {
    // Collect titles that seem achievable at this level (simple heuristic)
    const possibleTitles = ['Novice'];
    if (level >= 5) possibleTitles.push('dedication_1'); // 3 day streak
    if (level >= 10) possibleTitles.push('social_butterfly'); // First post
    if (level >= 15) possibleTitles.push('first_quest');

    const id = possibleTitles[Math.floor(Math.random() * possibleTitles.length)];
    if (id === 'Novice') return 'Novice';

    // For bots, we store the actual ID, the UI translates it.
    return id;
};

export const simulateBots = async () => {
    try {
        const botsRef = collection(db, 'global_leaderboard');

        // Fetch existing bots. We identify them by their ID prefix.
        // Because we don't know exactly which ones are bots without fetching,
        // we'll fetch all and filter, or just query if we added a flag.
        // Since we know the IDs, let's fetch those specific IDs if possible, 
        //, but Firestore `in` query is limited to 10.
        // Let's just fetch everything in global_leaderboard since it's small, 
        // or check them individually. 
        // Better: Query where doc ID >= 'bot_' and < 'bot_a' ? No, Firestore doesn't support that easily on ID.
        // Let's just get the whole leaderboard, it's fine for < 100 users.
        const snapshot = await getDocs(botsRef);

        interface BotData {
            name: string;
            avatar: string;
            level: number;
            xp: number;
            title: string;
            _updatedAt?: number;
            isBot: boolean;
        }

        const existingBots = new Map<string, BotData>();

        snapshot.docs.forEach(doc => {
            if (doc.id.startsWith('bot_')) {
                existingBots.set(doc.id, doc.data() as BotData);
            }
        });

        const batch = writeBatch(db);
        let operations = 0;
        const now = Date.now();

        for (const profile of BOT_PROFILES) {
            const existing = existingBots.get(profile.id);

            if (!existing) {
                // Seed new bot with random starting stats
                const startingXp = Math.floor(Math.random() * 5000); // 0 to 5000 XP
                const startingLevel = getLevelFromXP(startingXp);

                batch.set(doc(db, 'global_leaderboard', profile.id), {
                    name: profile.name,
                    avatar: profile.avatar,
                    level: startingLevel,
                    xp: startingXp,
                    title: getRealisticTitle(startingLevel),
                    _updatedAt: now,
                    isBot: true
                });
                operations++;
            } else {
                // Check if it needs an update
                const lastUpdate = existing._updatedAt || 0;
                if (now - lastUpdate > BOT_UPDATE_INTERVAL_MS) {
                    // Bot has been active! Give them random XP (0 to 1000)
                    const xpGain = Math.floor(Math.random() * 1000);
                    const newXp = existing.xp + xpGain;
                    const newLevel = getLevelFromXP(newXp);

                    batch.update(doc(db, 'global_leaderboard', profile.id), {
                        level: newLevel,
                        xp: newXp,
                        title: getRealisticTitle(newLevel),
                        _updatedAt: now
                    });
                    operations++;
                }
            }
        }

        if (operations > 0) {
            await batch.commit();
            console.log(`[botSimulation] Updated/Seeded ${operations} bots.`);
        }

    } catch (err) {
        console.error('[botSimulation] Error running simulation:', err);
    }
};
