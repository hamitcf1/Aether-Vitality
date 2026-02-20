import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, User } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PageTransition } from '../components/layout/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { ACHIEVEMENTS } from '../lib/achievements';
import { useAetherStore } from '../store/aetherStore';
import { simulateBots } from '../lib/botSimulation';

interface LeaderboardEntry {
    uid: string;
    name: string;
    avatar: string;
    level: number;
    xp: number;
    title: string;
}

export const LeaderboardPage: React.FC = () => {
    const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const myUid = useAetherStore(s => s._uid);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                // Run background bot simulation silently
                simulateBots().catch(console.error);

                const q = query(
                    collection(db, 'global_leaderboard'),
                    orderBy('xp', 'desc'),
                    limit(50)
                );
                const snap = await getDocs(q);
                const data = snap.docs.map(doc => ({
                    uid: doc.id,
                    ...doc.data()
                })) as LeaderboardEntry[];
                setLeaders(data);
            } catch (err) {
                console.error("Failed to fetch leaderboard", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const getTitleName = (tId: string) => {
        if (!tId || tId === 'Novice') return 'Novice';
        return ACHIEVEMENTS.find(a => a.id === tId)?.title || 'Novice';
    };

    const getLeagueInfo = (index: number) => {
        if (index < 5) return { name: 'Platinum', color: 'text-cyan-300', bg: 'bg-cyan-900/20', border: 'border-cyan-500/30 glow-cyan' };
        if (index < 15) return { name: 'Gold', color: 'text-amber-400', bg: 'bg-amber-900/20', border: 'border-amber-500/30 glow-gold' };
        if (index < 30) return { name: 'Silver', color: 'text-gray-300', bg: 'bg-white/5', border: 'border-gray-500/30' };
        return { name: 'Bronze', color: 'text-orange-400', bg: 'bg-orange-900/10', border: 'border-orange-500/20' };
    };

    return (
        <PageTransition className="space-y-6">
            <div>
                <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-amber-400" /> Leaderboard
                </h1>
                <p className="text-sm text-gray-500 mt-1">The most dedicated Seekers in the realm.</p>
            </div>

            <GlassCard className="p-0 overflow-hidden">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
                        <p>Fetching rankings...</p>
                    </div>
                ) : leaders.length === 0 ? (
                    <div className="py-20 text-center text-gray-500">
                        No seekers found on the leaderboard yet.
                    </div>
                ) : (
                    <div className="space-y-2 p-2">
                        {leaders.map((user, index) => {
                            const isMe = user.uid === myUid;
                            const league = getLeagueInfo(index);
                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    key={user.uid}
                                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${league.bg} ${league.border} ${isMe ? 'shadow-[0_0_15px_rgba(251,191,36,0.3)] border-amber-400' : ''}`}
                                >
                                    {/* Rank */}
                                    <div className="w-12 text-center flex-col items-center flex-shrink-0">
                                        {index === 0 ? <Medal className="w-8 h-8 text-cyan-300 mx-auto drop-shadow-[0_0_8px_rgba(103,232,249,0.5)]" /> :
                                            index === 1 ? <Medal className="w-7 h-7 text-amber-400 mx-auto" /> :
                                                index === 2 ? <Medal className="w-6 h-6 text-orange-400 mx-auto" /> :
                                                    <span className={`text-sm font-bold ${league.color}`}>#{index + 1}</span>}
                                        <span className={`text-[9px] font-black uppercase tracking-widest mt-1 block ${league.color}`}>{league.name}</span>
                                    </div>

                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-xl bg-black/20 border border-white/10 flex items-center justify-center text-2xl flex-shrink-0">
                                        {user.avatar || <User className="w-6 h-6 text-gray-400" />}
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className={`font-bold truncate ${isMe ? 'text-amber-400' : 'text-white'}`}>
                                                {user.name || 'Unknown Seeker'}
                                            </h3>
                                            {isMe && <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-[10px] font-black text-amber-400 uppercase tracking-widest">You</span>}
                                        </div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mt-0.5 truncate">
                                            {getTitleName(user.title)}
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="text-right flex-shrink-0">
                                        <div className="text-sm font-black text-white flex items-center gap-1 justify-end">
                                            <Star className="w-3.5 h-3.5 text-amber-400" /> {user.level}
                                        </div>
                                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                                            {user.xp.toLocaleString()} XP
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </GlassCard>
        </PageTransition>
    );
};
