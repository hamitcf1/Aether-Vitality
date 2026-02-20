import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Shield, Star, User, Hash } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { UserProfile, EquippedItems } from '../../store/aetherStore';

interface HeroCardProps {
    userId: string;
    isOpen: boolean;
    onClose: () => void;
}

interface PublicUserData {
    profile: UserProfile;
    level: number;
    equipped: EquippedItems;
    unlockedAchievements: string[];
}

export const HeroCard: React.FC<HeroCardProps> = ({ userId, isOpen, onClose }) => {
    const [data, setData] = useState<PublicUserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && userId) {
            fetchUserData();
        } else {
            setData(null);
            setLoading(true);
            setError(null);
        }
    }, [isOpen, userId]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const ref = doc(db, 'users', userId, 'data', 'aether');
            const snap = await getDoc(ref);

            if (snap.exists()) {
                const userData = snap.data() as any;
                if (userData.profile?.isPublic === false) {
                    setError("This profile is private.");
                } else {
                    setData({
                        profile: userData.profile,
                        level: userData.level || 1,
                        equipped: userData.equipped || { theme: 'default', frame: 'none' },
                        unlockedAchievements: userData.unlockedAchievements || []
                    });
                }
            } else {
                setError("User not found.");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md"
                    >
                        <GlassCard className="relative overflow-hidden" glow="cyan">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-20"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>

                            {loading ? (
                                <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                                    <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
                                    <p>Summoning Hero...</p>
                                </div>
                            ) : error ? (
                                <div className="py-20 flex flex-col items-center justify-center text-rose-400 text-center">
                                    <Shield className="w-12 h-12 mb-4 opacity-50" />
                                    <p className="font-bold">{error}</p>
                                </div>
                            ) : data ? (
                                <div className="relative z-10">
                                    {/* Header / Avatar */}
                                    <div className="flex flex-col items-center mb-6">
                                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-5xl mb-4 shadow-lg shadow-cyan-500/10">
                                            {data.profile.avatar || <User className="w-12 h-12 text-cyan-400" />}
                                        </div>
                                        <h2 className="text-2xl font-black text-white text-center">
                                            {data.profile.name || 'Unknown Hero'}
                                        </h2>
                                        {data.profile.bio && (
                                            <p className="text-sm text-gray-400 mt-2 text-center max-w-[80%] italic">
                                                "{data.profile.bio}"
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 mt-3">
                                            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                                                Level {data.level}
                                            </span>
                                            {data.profile.guildId && (
                                                <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                                    <Shield className="w-3 h-3" /> Guild Member
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                                            <Trophy className="w-8 h-8 text-amber-400 p-1.5 bg-amber-500/10 rounded-lg" />
                                            <div>
                                                <div className="text-lg font-bold text-white mb-0.5">
                                                    {data.unlockedAchievements.length}
                                                </div>
                                                <div className="text-[10px] text-gray-500 uppercase font-bold">Achievements</div>
                                            </div>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                                            <Star className="w-8 h-8 text-emerald-400 p-1.5 bg-emerald-500/10 rounded-lg" />
                                            <div>
                                                <div className="text-lg font-bold text-white mb-0.5">
                                                    {data.profile.difficulty || 'Casual'}
                                                </div>
                                                <div className="text-[10px] text-gray-500 uppercase font-bold">Difficulty</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="text-center">
                                        <p className="text-[10px] text-gray-600 flex items-center justify-center gap-1">
                                            <Hash className="w-3 h-3" /> ID: {userId.slice(0, 8)}...
                                        </p>
                                    </div>
                                </div>
                            ) : null}

                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2" />
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
