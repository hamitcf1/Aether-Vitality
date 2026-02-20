import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Shield, Star, User, Hash } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';
import { GlassCard } from '../ui/GlassCard';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAetherStore } from '../../store/aetherStore';
import { useAuthStore } from '../../store/authStore';
import type { UserProfileData as UserProfile, EquippedItemsData as EquippedItems } from '../../lib/firebaseTypes';
import { ACHIEVEMENTS } from '../../lib/achievements';

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
    followers?: string[];
    following?: string[];
    friends?: string[];
    pendingFriends?: string[];
    ratings?: Record<string, number>;
}

export const HeroCard: React.FC<HeroCardProps> = ({ userId, isOpen, onClose }) => {
    const [data, setData] = useState<PublicUserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const ref = doc(db, 'users', userId, 'data', 'aether');
                const snap = await getDoc(ref);

                if (snap.exists()) {
                    const userData = snap.data() as Partial<PublicUserData>;
                    if (!userData.profile) {
                        setError("Profile data is missing.");
                    } else if (userData.profile.isPublic === false) {
                        setError("This profile is private.");
                    } else {
                        setData({
                            profile: userData.profile,
                            level: userData.level || 1,
                            equipped: userData.equipped || { theme: 'default', frame: 'none', title: 'Novice' },
                            unlockedAchievements: userData.unlockedAchievements || [],
                            followers: userData.followers || [],
                            following: userData.following || [],
                            friends: userData.friends || [],
                            pendingFriends: userData.pendingFriends || [],
                            ratings: userData.ratings || {}
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

        if (isOpen && userId) {
            fetchUserData();
        } else {
            setData(null);
            setLoading(true);
            setError(null);
        }
    }, [isOpen, userId]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        onClick={(evt) => evt.stopPropagation()}
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
                                        <div className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mt-1 text-center">
                                            {
                                                (() => {
                                                    const tId = data.equipped?.title || 'Novice';
                                                    if (tId === 'Novice') return 'Novice';
                                                    return ACHIEVEMENTS.find(a => a.id === tId)?.title || 'Novice';
                                                })()
                                            }
                                        </div>
                                        {data.profile.bio && (
                                            <p className="text-sm text-gray-400 mt-2 text-center max-w-[80%] italic">
                                                "{data.profile.bio}"
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 mt-3">
                                            <Tooltip content="Level indicates your overall progression and power in the Aetherius realm." delay={0}>
                                                <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                                                    Level {data.level}
                                                </span>
                                            </Tooltip>
                                            {data.profile.guildId && (
                                                <Tooltip content="Member of a sworn brotherhood." delay={0}>
                                                    <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                                        <Shield className="w-3 h-3" /> Guild Member
                                                    </span>
                                                </Tooltip>
                                            )}
                                        </div>

                                        {/* Social Followers/Following Count */}
                                        <div className="flex gap-4 mt-4">
                                            <div className="text-center">
                                                <div className="text-sm font-black text-white">{data.followers?.length || 0}</div>
                                                <div className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Followers</div>
                                            </div>
                                            <div className="h-6 w-px bg-white/5" />
                                            <div className="text-center">
                                                <div className="text-sm font-black text-white">{data.following?.length || 0}</div>
                                                <div className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Following</div>
                                            </div>
                                            <div className="h-6 w-px bg-white/5" />
                                            <div className="text-center">
                                                <div className="text-sm font-black text-white">
                                                    {(() => {
                                                        const values = Object.values(data.ratings || {});
                                                        if (values.length === 0) return '0.0';
                                                        return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
                                                    })()}
                                                </div>
                                                <div className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Rating</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <button
                                            onClick={() => {
                                                const store = useAetherStore.getState();
                                                const isFollowing = store.following.includes(userId);
                                                if (isFollowing) store.unfollowUser(userId);
                                                else store.followUser(userId);
                                            }}
                                            className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all
                                                ${useAetherStore.getState().following.includes(userId)
                                                    ? 'bg-white/5 text-gray-400 border border-white/10'
                                                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'}`}
                                        >
                                            {useAetherStore.getState().following.includes(userId) ? 'Unfollow' : 'Follow'}
                                        </button>
                                        <button className="py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2">
                                            Message
                                        </button>
                                        <button
                                            onClick={() => {
                                                const store = useAetherStore.getState();
                                                const me = useAuthStore.getState().user;
                                                const isFriend = data.friends?.includes(me?.uid || '');
                                                const isPending = data.pendingFriends?.includes(me?.uid || '');

                                                if (isFriend) store.removeFriend(userId);
                                                else if (!isPending) store.sendFriendRequest(userId);
                                            }}
                                            className={`col-span-2 py-2.5 rounded-xl font-bold text-xs transition-all border
                                                ${data.friends?.includes(useAuthStore.getState().user?.uid || '')
                                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                    : data.pendingFriends?.includes(useAuthStore.getState().user?.uid || '')
                                                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                        : 'bg-white/5 text-emerald-400 border-white/10 hover:bg-emerald-500/10'}`}
                                        >
                                            {data.friends?.includes(useAuthStore.getState().user?.uid || '')
                                                ? 'Remove Friend'
                                                : data.pendingFriends?.includes(useAuthStore.getState().user?.uid || '')
                                                    ? 'Friend Request Sent'
                                                    : 'Add Friend'}
                                        </button>
                                    </div>

                                    {/* Rating Area */}
                                    <div className="bg-black/20 rounded-2xl p-4 mb-6 text-center">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-2 tracking-widest">Rate Seeker</p>
                                        <div className="flex justify-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => useAetherStore.getState().rateUser(userId, star)}
                                                    className="p-1 hover:scale-125 transition-transform"
                                                >
                                                    <Star
                                                        className={`w-6 h-6 ${useAetherStore.getState().ratings[userId] >= star || (data.ratings?.[useAuthStore.getState().user?.uid || ''] || 0) >= star
                                                            ? 'text-amber-400 fill-amber-400'
                                                            : 'text-gray-700'
                                                            }`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <Tooltip content="Divine markers of your dedication." delay={0}>
                                            <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                                                <Trophy className="w-8 h-8 text-amber-400 p-1.5 bg-amber-500/10 rounded-lg" />
                                                <div>
                                                    <div className="text-lg font-bold text-white mb-0.5">
                                                        {data.unlockedAchievements.length}
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 uppercase font-bold">Achievements</div>
                                                </div>
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Current training intensity." delay={0}>
                                            <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                                                <Star className="w-8 h-8 text-emerald-400 p-1.5 bg-emerald-500/10 rounded-lg" />
                                                <div>
                                                    <div className="text-lg font-bold text-white mb-0.5">
                                                        {data.profile.difficulty || 'Casual'}
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 uppercase font-bold">Difficulty</div>
                                                </div>
                                            </div>
                                        </Tooltip>
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
