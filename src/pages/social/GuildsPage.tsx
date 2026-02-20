import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, Plus, Trophy } from 'lucide-react';
import { useGuildsStore } from '../../store/guildsStore';
import { useAetherStore } from '../../store/aetherStore';

import { PageTransition } from '../../components/layout/PageTransition';
import { GlassCard } from '../../components/ui/GlassCard';
import { GuildChat } from '../../components/social/GuildChat';
import { CreateGuildModal } from '../../components/social/CreateGuildModal';
import { RaidBoss } from '../../components/social/RaidBoss';

// Helper for theme gradients
const getThemeGradient = (theme: string) => {
    switch (theme) {
        case 'gold': return 'from-amber-500 to-yellow-300';
        case 'cyberpunk': return 'from-pink-500 to-rose-400';
        case 'midnight': return 'from-indigo-900 to-slate-800';
        default: return 'from-emerald-500 to-cyan-500';
    }
};

export const GuildsPage: React.FC = () => {
    const {
        activeGuild, publicGuilds, fetchPublicGuilds,
        joinGuild, leaveGuild, subscribeToGuild
    } = useGuildsStore();

    const profile = useAetherStore(state => state.profile);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Sync guild state on mount
    useEffect(() => {
        if (profile?.guildId) {
            // If user has a guild, subscribe to it
            const unsub = subscribeToGuild(profile.guildId);
            return () => unsub();
        } else {
            // Otherwise fetch public guilds to browse
            fetchPublicGuilds();
        }
    }, [profile?.guildId, subscribeToGuild, fetchPublicGuilds]);

    const handleJoin = async (guildId: string) => {
        await joinGuild(guildId);
    };

    const handleLeaveGuild = async () => {
        if (window.confirm("Are you sure you want to leave this guild?")) {
            await leaveGuild();
        }
    };

    return (
        <PageTransition className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <Shield className="w-8 h-8 text-indigo-400" /> Guilds
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Band together. Conquer challenges.</p>
                </div>
                {!activeGuild && (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary flex items-center gap-2 px-4 py-2"
                    >
                        <Plus className="w-4 h-4" /> Create Guild
                    </motion.button>
                )}
            </div>

            {/* Content Switcher */}
            <AnimatePresence mode="wait">
                {activeGuild ? (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    >
                        {/* Left Column: Guild Info & Members */}
                        <div className="space-y-6 lg:col-span-1">
                            <div className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                                {/* Theme Background for Guild Card */}
                                <div className={`absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-br ${getThemeGradient(activeGuild.theme)}`} />

                                <div className="relative z-10 text-center">
                                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-emerald-500/20 mb-4">
                                        {activeGuild.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <h2 className="text-2xl font-black text-white mb-1">{activeGuild.name}</h2>
                                    <p className="text-emerald-400 font-bold mb-4">Level {activeGuild.level}</p>

                                    <div className="grid grid-cols-2 gap-2 mb-6">
                                        <div className="bg-black/20 rounded-xl p-3">
                                            <div className="text-xs text-gray-400 uppercase font-bold">Members</div>
                                            <div className="text-lg font-black text-white">{activeGuild.memberIds.length}</div>
                                        </div>
                                        <div className="bg-black/20 rounded-xl p-3">
                                            <div className="text-xs text-gray-400 uppercase font-bold">XP</div>
                                            <div className="text-lg font-black text-white">{activeGuild.xp.toLocaleString()}</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-white transition-colors">
                                            Settings
                                        </button>
                                        <button
                                            onClick={handleLeaveGuild}
                                            className="flex-1 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-sm font-bold transition-colors"
                                        >
                                            Leave
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Raid Boss Section */}
                            <RaidBoss />

                            {/* Members List */}
                            <GlassCard>
                                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-yellow-500" /> Guild Quests
                                </h3>
                                <div className="text-center py-8 text-gray-500 text-sm italic">
                                    Weekly raids coming soon...
                                </div>
                            </GlassCard>
                        </div>

                        {/* Right Column: Chat */}
                        <div className="lg:col-span-2 h-[600px]">
                            <GuildChat />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="browse"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {publicGuilds.map((guild) => (
                            <GlassCard key={guild.id} className="flex flex-col h-full group hover:bg-white/[0.03] transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-white/5 text-gray-400">
                                        Lvl {guild.level}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{guild.name}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
                                    {guild.description}
                                </p>
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Users className="w-3 h-3" /> {guild.memberIds.length} members
                                    </span>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleJoin(guild.id)}
                                        className="btn-primary px-4 py-1.5 text-xs"
                                    >
                                        Join
                                    </motion.button>
                                </div>
                            </GlassCard>
                        ))}
                        {publicGuilds.length === 0 && (
                            <div className="col-span-full py-12 text-center text-gray-500">
                                No guilds found. Create one to get started!
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {showCreateModal && (
                <CreateGuildModal onClose={() => setShowCreateModal(false)} />
            )}
        </PageTransition>
    );
};
