import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Shield } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { useAetherStore } from '../../store/aetherStore';

export const StreakCalendar: React.FC = () => {
    const streak = useAetherStore((s) => s.streak);

    // Visualize up to 30 days. If over 30, it just looks full.
    const displayStreak = Math.min(streak, 30);

    let multiplier = 1;
    if (streak >= 30) multiplier = 1.5;
    else if (streak >= 7) multiplier = 1.25;
    else if (streak >= 3) multiplier = 1.1;

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard glow={streak >= 30 ? 'gold' : streak >= 7 ? 'cyan' : 'emerald'}>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <Flame className={`w-4 h-4 ${streak >= 7 ? 'text-cyan-400' : 'text-amber-400'}`} />
                            30-Day Streak Challenge
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Current Streak: <span className="font-bold text-white">{streak} days</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Active Multiplier</p>
                        <p className="text-xl font-black text-emerald-400">{multiplier}x XP</p>
                    </div>
                </div>

                <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
                    {[...Array(30)].map((_, i) => {
                        const dayNumber = i + 1;
                        const isActive = dayNumber <= displayStreak;
                        const isMilestone = dayNumber === 3 || dayNumber === 7 || dayNumber === 30;

                        let bg = isActive ? 'bg-amber-500/20 border-amber-500/50' : 'bg-white/5 border-white/10';
                        let iconColor = isActive ? 'text-amber-400' : 'text-gray-600';

                        if (isMilestone && !isActive) {
                            bg = 'bg-white/5 border-dashed border-gray-500';
                            iconColor = 'text-gray-500';
                        } else if (isMilestone && isActive) {
                            bg = 'bg-cyan-500/20 border-cyan-500/50 glow-cyan shadow-[0_0_10px_rgba(6,182,212,0.3)]';
                            iconColor = 'text-cyan-400';
                        }

                        return (
                            <div
                                key={i}
                                className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative transition-all ${bg}`}
                            >
                                <span className={`text-[10px] font-black absolute top-1 left-1.5 ${isActive ? 'text-white' : 'text-gray-500 opacity-50'}`}>
                                    {dayNumber}
                                </span>
                                <Flame className={`w-4 h-4 mt-2 ${iconColor} ${isActive ? 'drop-shadow-md' : 'opacity-20'}`} />
                                {isMilestone && (
                                    <Shield className={`w-3 h-3 absolute bottom-1 right-1 opacity-80 ${iconColor}`} />
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-4 flex gap-4 text-[10px] font-medium text-gray-400 justify-center">
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3 opacity-50" /> Milestone</span>
                    <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-cyan-400" /> Multiplier Increase</span>
                </div>
            </GlassCard>
        </motion.div>
    );
};
