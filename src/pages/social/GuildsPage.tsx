import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, Plus, Trophy, Settings, ShieldOff, Trash2, UserMinus } from 'lucide-react';
import { useGuildsStore } from '../../store/guildsStore';
import { useAuthStore } from '../../store/authStore';
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
    const user = useAuthStore(state => state.user);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState('');

    const isLeader = activeGuild?.leaderId === user?.uid;

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
                                        {isLeader && (
                                            <button
                                                onClick={() => setShowSettings(!showSettings)}
                                                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2
                                                    ${showSettings ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-white/5 hover:bg-white/10 text-white'}`}
                                            >
                                                <Settings className="w-4 h-4" />
                                                Settings
                                            </button>
                                        )}
                                        <button
                                            onClick={handleLeaveGuild}
                                            className="flex-1 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                                        >
                                            <ShieldOff className="w-4 h-4" />
                                            Leave
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Leader Settings Panel */}
                            <AnimatePresence>
                                {showSettings && isLeader && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <GlassCard className="space-y-4">
                                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                                <Settings className="w-4 h-4 text-indigo-400" /> Leader Controls
                                            </h3>

                                            {/* Rename */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-400 uppercase font-bold">Guild Name</span>
                                                    <button
                                                        onClick={() => {
                                                            if (isRenaming) {
                                                                if (newName.trim()) useGuildsStore.getState().renameGuild(newName);
                                                                setIsRenaming(false);
                                                            } else {
                                                                setNewName(activeGuild.name);
                                                                setIsRenaming(true);
                                                            }
                                                        }}
                                                        className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase"
                                                    >
                                                        {isRenaming ? 'Save' : 'Rename'}
                                                    </button>
                                                </div>
                                                {isRenaming ? (
                                                    <input
                                                        type="text"
                                                        value={newName}
                                                        onChange={(e) => setNewName(e.target.value)}
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-400"
                                                        maxLength={30}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <div className="text-sm text-white font-medium flex items-center gap-2">
                                                        {activeGuild.name}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Theme Selection */}
                                            <div className="space-y-2">
                                                <span className="text-xs text-gray-400 uppercase font-bold block">Banner Theme</span>
                                                <div className="flex gap-2">
                                                    {['emerald', 'gold', 'cyberpunk', 'midnight'].map((t) => (
                                                        <button
                                                            key={t}
                                                            onClick={() => useGuildsStore.getState().updateGuildTheme(t)}
                                                            className={`w-8 h-8 rounded-full border-2 transition-all ${activeGuild.theme === t ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'} bg-gradient-to-br ${getThemeGradient(t)}`}
                                                            title={t}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="pt-2 border-t border-white/5">
                                                <button
                                                    onClick={() => useGuildsStore.getState().disbandGuild()}
                                                    className="w-full py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Disband Guild
                                                </button>
                                            </div>
                                        </GlassCard>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Raid Boss Section */}
                            <RaidBoss />

                            {/* Members List */}
                            <GlassCard>
                                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-cyan-400" /> Hall of Members
                                </h3>
                                <div className="space-y-3">
                                    {activeGuild.memberIds.map((mid) => (
                                        <div key={mid} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-gray-400">
                                                    {mid === activeGuild.leaderId ? <Trophy className="w-4 h-4 text-amber-500" /> : <Shield className="w-4 h-4 text-gray-600" />}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-white flex items-center gap-1">
                                                        {mid === activeGuild.leaderId ? activeGuild.leaderName : 'Guild Member'}
                                                        {mid === user?.uid && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 ml-1">You</span>}
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 font-mono">{mid.substring(0, 8)}...</div>
                                                </div>
                                            </div>

                                            {isLeader && mid !== user?.uid && (
                                                <button
                                                    onClick={() => useGuildsStore.getState().kickMember(mid)}
                                                    className="p-2 text-gray-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500/10 rounded-lg"
                                                    title="Kick Member"
                                                >
                                                    <UserMinus className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>

                            <GlassCard>
                                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-yellow-500" /> Guild Quests
                                </h3>
                                <div className="text-center py-4 text-gray-500 text-sm italic">
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
