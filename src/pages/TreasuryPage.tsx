import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coins, Zap, ShieldCheck, ArrowRight, Sparkles, RefreshCcw, Clock } from 'lucide-react';
import { PageTransition } from '../components/layout/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { useAetherStore } from '../store/aetherStore';
import { PACKAGES, PackageTier } from '../constants/packages';
import { Tooltip } from '../components/ui/Tooltip';

export const TreasuryPage: React.FC = () => {
    const { coins, aiTokens, maxAiTokens, buyAITokens, profile, getTimeUntilNextRefill } = useAetherStore();
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        const timer = setInterval(() => {
            const ms = getTimeUntilNextRefill();
            const hours = Math.floor(ms / 3600000);
            const minutes = Math.floor((ms % 3600000) / 60000);
            const seconds = Math.floor((ms % 60000) / 1000);
            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }, 1000);
        return () => clearInterval(timer);
    }, [getTimeUntilNextRefill]);

    const tier = (profile?.subscriptionTier as PackageTier) || PackageTier.NOVICE;
    const pkg = PACKAGES[tier];

    return (
        <PageTransition className="space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                        <Coins className="w-10 h-10 text-amber-500" /> Treasury Hub
                    </h1>
                    <p className="text-gray-500 font-medium">Manage your wealth, AI resources, and subscription perks.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Coin Wealth */}
                <GlassCard className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Coins className="w-24 h-24 text-amber-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-amber-500 mb-4">
                            <Coins className="w-5 h-5" />
                            <span className="text-xs font-black uppercase tracking-widest">Aether Coins</span>
                        </div>
                        <h2 className="text-5xl font-black text-white mb-2">{coins.toLocaleString()}</h2>
                        <p className="text-gray-500 text-xs">Accumulated through quests, meals, and streaks.</p>
                    </div>
                </GlassCard>

                {/* AI Essence */}
                <GlassCard className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap className="w-24 h-24 text-cyan-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-cyan-500 mb-4">
                            <Zap className="w-5 h-5" />
                            <span className="text-xs font-black uppercase tracking-widest">AI Essence</span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-2">
                            <h2 className="text-5xl font-black text-white">{aiTokens}</h2>
                            <span className="text-gray-500 font-bold">/ {maxAiTokens}</span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-4">
                            <motion.div
                                className="h-full bg-cyan-500 shadow-glow-sm"
                                initial={{ width: 0 }}
                                animate={{ width: `${(aiTokens / maxAiTokens) * 100}%` }}
                            />
                        </div>
                        <Tooltip content="Refills daily or buy instantly for 500 Coins" delay={0}>
                            <button
                                onClick={() => buyAITokens(5, 500)}
                                disabled={coins < 500}
                                className="w-full py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <RefreshCcw className="w-3 h-3" /> Buy 5 Tokens (500 C)
                            </button>
                        </Tooltip>
                        <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 mt-3 font-mono">
                            <Clock className="w-3 h-3" /> Next refill in {timeLeft}
                        </div>
                    </div>
                </GlassCard>

                {/* Subscription Tier */}
                <GlassCard className="relative overflow-hidden border-emerald-500/20">
                    <div className="flex items-center gap-2 text-emerald-500 mb-4">
                        <ShieldCheck className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">Vanguard Rank</span>
                    </div>
                    <h2 className="text-3xl font-black text-white mb-1 uppercase italic">{pkg.name}</h2>
                    <p className="text-emerald-400/80 text-[10px] font-bold uppercase tracking-widest mb-6">Current Tier Status</p>

                    <ul className="space-y-3 mb-6">
                        <li className="flex items-center gap-2 text-xs text-gray-300">
                            <ArrowRight className="w-3 h-3 text-emerald-500" /> {maxAiTokens} Daily AI Tokens
                        </li>
                        <li className="flex items-center gap-2 text-xs text-gray-300">
                            <ArrowRight className="w-3 h-3 text-emerald-500" /> {pkg.features?.[0] || 'Standard Access'}
                        </li>
                    </ul>

                    <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">
                        Upgrade Tier
                    </button>
                </GlassCard>
            </div>

            {/* Recent Wealth Activity Placeholder */}
            <GlassCard>
                <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Wealth Management</h3>
                </div>
                <div className="p-8 text-center bg-black/20 rounded-2xl border border-white/5">
                    <p className="text-gray-500 text-sm">More advanced transaction logs and detailed AI analytics coming soon to the Treasury.</p>
                </div>
            </GlassCard>
        </PageTransition>
    );
};
