import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy, Gamepad2, Star, Lock, Unlock, Crown, Sparkles,
    Quote, Flame, Target, Zap, Gift, Coins
} from 'lucide-react';
import { PageTransition } from '../components/layout/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { CircularProgress } from '../components/ui/CircularProgress';
import { useTrackersStore } from '../store/trackersStore';
import { useAetherStore } from '../store/aetherStore';
import { getDailyQuote } from '../lib/motivationEngine';
import { ACHIEVEMENTS } from '../lib/achievements';

export const GamingPage: React.FC = () => {
    const trackers = useTrackersStore();
    const aether = useAetherStore();
    const quote = getDailyQuote();
    const [showRewardAnim, setShowRewardAnim] = useState<string | null>(null);

    // Check unlockables on mount
    useEffect(() => {
        const newly = trackers.checkUnlockables();
        if (newly.length > 0) {
            setShowRewardAnim(newly[0]);
            setTimeout(() => setShowRewardAnim(null), 3000);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const badges = trackers.unlockables.filter((u) => u.type === 'badge');
    const titles = trackers.unlockables.filter((u) => u.type === 'title');
    const themes = trackers.unlockables.filter((u) => u.type === 'theme');
    const totalUnlocked = trackers.unlockables.filter((u) => u.unlocked).length;
    const totalItems = trackers.unlockables.length;

    // Milestones timeline from aether store
    const milestones = [
        { label: 'Account Created', done: true, icon: '🌱' },
        { label: 'First Meal Logged', done: aether.mealsLogged >= 1, icon: '🍽️' },
        { label: 'First Quest Done', done: aether.questsCompleted >= 1, icon: '📜' },
        { label: '3-Day Streak', done: aether.streak >= 3, icon: '🔥' },
        { label: 'Level 5', done: aether.level >= 5, icon: '⭐' },
        { label: '7-Day Streak', done: aether.streak >= 7, icon: '💎' },
        { label: 'Level 10', done: aether.level >= 10, icon: '🌟' },
        { label: '30-Day Streak', done: aether.streak >= 30, icon: '👑' },
        { label: 'Level 15', done: aether.level >= 15, icon: '🏆' },
    ];

    return (
        <PageTransition className="space-y-5">
            {/* Reward animation overlay */}
            <AnimatePresence>
                {showRewardAnim && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="glass p-8 text-center max-w-sm"
                        >
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.6 }}
                                className="text-6xl mb-4"
                            >
                                🎉
                            </motion.div>
                            <h3 className="text-xl font-black text-white mb-2">New Unlock!</h3>
                            <p className="text-sm text-gray-400">
                                {trackers.unlockables.find((u) => u.id === showRewardAnim)?.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                                {trackers.unlockables.find((u) => u.id === showRewardAnim)?.description}
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                        <Gamepad2 className="w-7 h-7 text-violet-400" /> Gaming
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Earn rewards through your health journey</p>
                </div>
            </div>

            {/* Daily Motivation Quote */}
            <GlassCard className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-500/10 to-transparent rounded-bl-full" />
                <div className="flex items-start gap-3">
                    <Quote className="w-8 h-8 text-violet-400 flex-shrink-0 mt-1" />
                    <div>
                        <p className="text-sm text-white font-medium italic leading-relaxed">&ldquo;{quote.text}&rdquo;</p>
                        <p className="text-xs text-gray-500 mt-2">— {quote.author}</p>
                        <p className="text-[10px] text-gray-700 mt-1">Daily motivation • refreshes each day</p>
                    </div>
                </div>
            </GlassCard>

            {/* Progress Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <GlassCard className="text-center py-4">
                    <CircularProgress
                        value={(totalUnlocked / totalItems) * 100}
                        size={70}
                        strokeWidth={5}
                        color="#8b5cf6"
                        label={`${totalUnlocked}`}
                        sublabel={`of ${totalItems}`}
                    />
                    <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-wider">Unlocked</p>
                </GlassCard>
                <GlassCard className="flex flex-col items-center justify-center py-4">
                    <Flame className="w-6 h-6 text-amber-400 mb-1" />
                    <p className="text-2xl font-black text-white">{aether.streak}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Streak</p>
                </GlassCard>
                <GlassCard className="flex flex-col items-center justify-center py-4">
                    <Star className="w-6 h-6 text-emerald-400 mb-1" />
                    <p className="text-2xl font-black text-white">{aether.level}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Level</p>
                </GlassCard>
                <GlassCard className="flex flex-col items-center justify-center py-4">
                    <Trophy className="w-6 h-6 text-amber-400 mb-1" />
                    <p className="text-2xl font-black text-white">{aether.unlockedAchievements.length}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Achievements</p>
                </GlassCard>
            </div>

            {/* Badges Collection */}
            <GlassCard>
                <div className="flex items-center gap-2 mb-4">
                    <Gift className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white">Badges</h3>
                    <span className="text-xs text-gray-600 ml-auto">
                        {badges.filter((b) => b.unlocked).length} / {badges.length}
                    </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                    {badges.map((badge) => (
                        <motion.div
                            key={badge.id}
                            whileHover={{ scale: badge.unlocked ? 1.05 : 1 }}
                            className={`relative p-3 rounded-xl text-center transition-all duration-200 ${badge.unlocked
                                ? 'glass-subtle border border-white/[0.08]'
                                : 'bg-white/[0.01] border border-white/[0.03] opacity-40'
                                }`}
                        >
                            <span className="text-2xl block mb-1">{badge.unlocked ? badge.icon : '🔒'}</span>
                            <p className="text-[10px] font-bold text-white truncate">{badge.title}</p>
                            <p className="text-[8px] text-gray-600 truncate">{badge.description}</p>
                            {!badge.unlocked && (
                                <Lock className="w-3 h-3 text-gray-600 absolute top-1.5 right-1.5" />
                            )}
                        </motion.div>
                    ))}
                </div>
            </GlassCard>

            {/* Titles */}
            <GlassCard>
                <div className="flex items-center gap-2 mb-4">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">Titles</h3>
                    <span className="text-xs text-gray-600 ml-auto">
                        {titles.filter((t) => t.unlocked).length} / {titles.length}
                    </span>
                </div>
                <div className="space-y-2">
                    {titles.map((title) => (
                        <div
                            key={title.id}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${title.unlocked
                                ? 'glass-subtle border border-white/[0.08]'
                                : 'bg-white/[0.01] border border-white/[0.03] opacity-40'
                                }`}
                        >
                            <span className="text-xl">{title.unlocked ? title.icon : '🔒'}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white">{title.title}</p>
                                <p className="text-[10px] text-gray-500">{title.description}</p>
                            </div>
                            {title.unlocked ? (
                                <Unlock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            ) : (
                                <Lock className="w-4 h-4 text-gray-600 flex-shrink-0" />
                            )}
                        </div>
                    ))}
                </div>
            </GlassCard>

            {/* Themes */}
            <GlassCard>
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    <h3 className="text-sm font-bold text-white">Unlockable Themes</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {themes.map((theme) => (
                        <div
                            key={theme.id}
                            className={`relative p-4 rounded-xl text-center overflow-hidden transition-all ${theme.unlocked
                                ? 'glass-subtle border border-white/[0.1]'
                                : 'bg-white/[0.01] border border-white/[0.03] opacity-40'
                                }`}
                        >
                            {theme.unlocked && (
                                <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-violet-500 via-emerald-500 to-cyan-500" />
                            )}
                            <span className="text-3xl block mb-2 relative z-10">{theme.unlocked ? theme.icon : '🔒'}</span>
                            <p className="text-sm font-bold text-white relative z-10">{theme.title}</p>
                            <p className="text-[10px] text-gray-500 relative z-10">{theme.description}</p>
                        </div>
                    ))}
                </div>
            </GlassCard>

            {/* Milestone Timeline */}
            <GlassCard>
                <div className="flex items-center gap-2 mb-4">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">Journey Milestones</h3>
                </div>
                <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/[0.06]" />

                    <div className="space-y-3">
                        {milestones.map((m, i) => (
                            <motion.div
                                key={m.label}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center gap-4 relative"
                            >
                                {/* Dot */}
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 z-10 ${m.done
                                        ? 'bg-emerald-500/20 border border-emerald-500/30'
                                        : 'bg-white/[0.03] border border-white/[0.06]'
                                        }`}
                                >
                                    {m.done ? m.icon : '🔒'}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-medium ${m.done ? 'text-white' : 'text-gray-600'}`}>{m.label}</p>
                                </div>
                                {m.done && <Zap className="w-3 h-3 text-emerald-400" />}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </GlassCard>

            {/* Achievements from original store */}
            <GlassCard>
                <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">Classic Achievements</h3>
                    <span className="text-xs text-gray-600 ml-auto">
                        {aether.unlockedAchievements.length} / {ACHIEVEMENTS.length}
                    </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                    {ACHIEVEMENTS.map((ach) => {
                        const unlocked = aether.unlockedAchievements.includes(ach.id);
                        return (
                            <div
                                key={ach.id}
                                className={`p-2 rounded-xl text-center transition-all ${unlocked
                                    ? 'glass-subtle border border-emerald-500/10'
                                    : 'bg-white/[0.01] border border-white/[0.03] opacity-30'
                                    }`}
                            >
                                <span className="text-xl block">{unlocked ? ach.icon : '🔒'}</span>
                                <p className="text-[9px] font-bold text-white mt-1 truncate">{ach.title}</p>
                                {ach.rewardCoins && (
                                    <p className="text-[8px] font-bold text-emerald-400 mt-0.5 flex items-center justify-center gap-0.5">
                                        +{ach.rewardCoins} <Coins className="w-2.5 h-2.5" />
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </GlassCard>
        </PageTransition>
    );
};
