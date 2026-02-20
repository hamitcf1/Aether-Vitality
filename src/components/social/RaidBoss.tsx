import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Users, Clock, Trophy, Sparkles } from 'lucide-react';
import { useGuildsStore } from '../../store/guildsStore';
import { useAuthStore } from '../../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import { Tooltip } from '../ui/Tooltip';

export const RaidBoss: React.FC = () => {
    const { activeRaid, attackBoss, startRaid } = useGuildsStore();

    const [isAttacking, setIsAttacking] = useState(false);
    const [damageDealt, setDamageDealt] = useState<number | null>(null);

    // Cooldown logic (local state for immediate feedback, though real cooldown is store/backend based ideally)
    // For MVP, we said 4 hours, but let's just allow spamming for testing or add a simple local timer
    const [onCooldown, setOnCooldown] = useState(false);

    const handleAttack = async () => {
        if (isAttacking || onCooldown) return;
        setIsAttacking(true);

        // Visual shake
        const damage = await attackBoss();
        setDamageDealt(damage);
        setOnCooldown(true);

        setTimeout(() => {
            setIsAttacking(false);
            setDamageDealt(null);
        }, 1000);

        // Reset cooldown after 5 seconds for testing purposes (instead of 4 hours)
        setTimeout(() => setOnCooldown(false), 5000);
    };

    if (!activeRaid) {
        return (
            <div className="glass p-6 rounded-2xl border border-white/5 text-center">
                <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Sword className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Active Raid</h3>
                <p className="text-gray-400 mb-6 text-sm">The guild is currently at peace.</p>
                {/* Only leader can start */}
                {/* We need to accurately check leader. activeGuild.leaderId vs auth.currentUser.uid */}
                <button
                    onClick={() => startRaid()}
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-colors"
                >
                    Summon Boss
                </button>
            </div>
        );
    }

    const healthPercent = (activeRaid.currentHp / activeRaid.totalHp) * 100;
    const isDead = activeRaid.currentHp <= 0;

    return (
        <div className="glass p-0 rounded-2xl border border-white/5 overflow-hidden relative group">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-rose-900/20 to-black/50 pointer-events-none" />

            {/* Header */}
            <div className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-500/20 text-rose-400 border border-rose-500/20">
                                Raid Boss
                            </span>
                            <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-gray-500">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(activeRaid.endTime), { addSuffix: true })} left
                            </span>
                        </div>
                        <h2 className="text-2xl font-black text-white">{activeRaid.bossName}</h2>
                    </div>
                    <div className="text-4xl">{activeRaid.bossImage}</div>
                </div>

                {/* Boss Visual & Health */}
                <div className="mb-8 relative">
                    <motion.div
                        animate={isAttacking ? { x: [-5, 5, -5, 5, 0], color: '#ef4444' } : { y: [0, -10, 0] }}
                        transition={isAttacking ? { duration: 0.4 } : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-32 h-32 mx-auto bg-black/40 rounded-full flex items-center justify-center text-7xl shadow-2xl shadow-rose-900/50 border border-white/10"
                    >
                        {activeRaid.bossImage}
                    </motion.div>

                    {/* Damage Popup */}
                    <AnimatePresence>
                        {damageDealt !== null && (
                            <motion.div
                                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                                animate={{ opacity: 1, y: -40, scale: 1.5 }}
                                exit={{ opacity: 0 }}
                                className="absolute top-0 left-1/2 -translate-x-1/2 text-4xl font-black text-amber-400 drop-shadow-lg z-20"
                            >
                                -{damageDealt}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Health Bar */}
                <div className="mb-2 flex justify-between text-xs font-bold text-gray-400">
                    <span>HP</span>
                    <span>{activeRaid.currentHp.toLocaleString()} / {activeRaid.totalHp.toLocaleString()}</span>
                </div>
                <div className="h-4 bg-black/50 rounded-full overflow-hidden border border-white/5 mb-8 relative">
                    <motion.div
                        initial={{ width: '100%' }}
                        animate={{ width: `${healthPercent}%` }}
                        className="h-full bg-gradient-to-r from-rose-600 to-rose-400"
                    />
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 relative">
                    <Tooltip content={isDead ? "This boss has been defeated." : (activeRaid.memberStats?.[useAuthStore.getState().user?.uid || '']?.attackCountToday || 0) >= 3 ? "Daily attack limit reached." : onCooldown ? "Aether battery recharging..." : "Unleash a high-damage strike!"} delay={0}>
                        <button
                            onClick={handleAttack}
                            disabled={isDead || onCooldown || (activeRaid.memberStats?.[useAuthStore.getState().user?.uid || '']?.attackCountToday || 0) >= 3}
                            className={`flex-1 py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all relative overflow-hidden
                                ${isDead
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    : (activeRaid.memberStats?.[useAuthStore.getState().user?.uid || '']?.attackCountToday || 0) >= 3
                                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 cursor-not-allowed'
                                        : onCooldown
                                            ? 'bg-gray-700 text-gray-400 cursor-wait'
                                            : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 active:scale-95'}`}
                        >
                            {isDead ? (
                                <>
                                    <Trophy className="w-5 h-5" />
                                    Defeated
                                </>
                            ) : (activeRaid.memberStats?.[useAuthStore.getState().user?.uid || '']?.attackCountToday || 0) >= 3 ? (
                                <>
                                    <Clock className="w-5 h-5" />
                                    Limit Reached
                                </>
                            ) : onCooldown ? (
                                <>
                                    <Clock className="w-5 h-5 animate-pulse" />
                                    Recharging...
                                </>
                            ) : (
                                <>
                                    <Sword className="w-5 h-5" />
                                    MANUAL ATTACK
                                </>
                            )}
                        </button>
                    </Tooltip>

                    <div className="flex justify-between items-center px-1">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                            <Sword className="w-3 h-3" /> Attacks: {activeRaid.memberStats?.[useAuthStore.getState().user?.uid || '']?.attackCountToday || 0} / 3
                        </div>
                        {Object.keys(activeRaid.contributors).length >= 3 && (
                            <Tooltip content="More active members grant a damage multiplier!" delay={0}>
                                <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1 animate-pulse">
                                    <Sparkles className="w-3 h-3" /> Ensemble Bonus x{Object.keys(activeRaid.contributors).length >= 5 ? '1.5' : '1.2'}
                                </div>
                            </Tooltip>
                        )}
                    </div>
                </div>
                {!isDead && (
                    <p className="text-center text-[10px] text-rose-400 mt-3 flex items-center justify-center gap-1 font-bold">
                        <Sword className="w-3 h-3" /> Passive attacks occur automatically when you log habits and gain XP!
                    </p>
                )}
            </div>

            {/* Contributors Section */}
            <div className="bg-black/20 p-4 border-t border-white/5">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    Top Contributors
                </h4>
                <div className="space-y-2">
                    {Object.entries(activeRaid.contributors)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 3) // Top 3
                        .map(([uid, dmg], index) => (
                            <div key={uid} className="flex justify-between items-center text-sm">
                                <span className="text-gray-300 flex items-center gap-2">
                                    <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${index === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-gray-500'}`}>
                                        {index + 1}
                                    </span>
                                    Warrior
                                </span>
                                <span className="font-mono text-rose-400 font-bold">{dmg.toLocaleString()}</span>
                            </div>
                        ))}
                    {Object.keys(activeRaid.contributors).length === 0 && (
                        <p className="text-xs text-gray-600 italic">No damage dealt yet. Be the first!</p>
                    )}
                </div>
            </div>
        </div>
    );
};
