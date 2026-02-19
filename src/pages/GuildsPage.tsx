import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Trophy, Plus, Crown, Swords, MessageCircle, LogOut, Send
} from 'lucide-react';
import { PageTransition } from '../components/layout/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { useGuildStore } from '../store/guildStore';
import { useUserStore } from '../store/userStore';


export const GuildsPage: React.FC = () => {
    const {
        userGuild, availableGuilds, messages, loading,
        fetchUserGuild, fetchAvailableGuilds, createGuild, joinGuild, leaveGuild,
        sendMessage
    } = useGuildStore();
    const { profile } = useUserStore();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newGuildName, setNewGuildName] = useState('');
    const [newGuildDesc, setNewGuildDesc] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('🛡️'); // Default icon

    // Chat state
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    const ICONS = ['🛡️', '⚔️', '🔮', '🐉', '🏰', '👑', '🧪', '🌿'];

    useEffect(() => {
        if (profile?.uid) {
            fetchUserGuild(profile.uid);
        }
        fetchAvailableGuilds();
    }, [profile?.uid, fetchUserGuild, fetchAvailableGuilds]);

    // Scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleCreate = async () => {
        if (!newGuildName.trim() || !newGuildDesc.trim()) return;
        const success = await createGuild(newGuildName, newGuildDesc, selectedIcon);
        if (success) {
            setShowCreateModal(false);
            setNewGuildName('');
            setNewGuildDesc('');
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        await sendMessage(chatInput);
        setChatInput('');
    };

    if (loading && !userGuild && availableGuilds.length === 0) {
        return <div className="p-8 text-center text-gray-500">Loading guilds...</div>;
    }

    // ── Guild Dashboard (If user is in a guild) ──
    if (userGuild) {
        return (
            <PageTransition className="space-y-6">
                {/* Guild Header */}
                <GlassCard className="relative overflow-hidden" glow="purple">
                    <div className="absolute top-0 right-0 p-32 bg-purple-500/10 blur-[100px] rounded-full" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-purple-500/30 flex items-center justify-center text-5xl shadow-lg shadow-purple-500/20">
                            {userGuild.icon || '🛡️'}
                        </div>

                        <div className="flex-1">
                            <h1 className="text-3xl font-black text-white mb-2">{userGuild.name}</h1>
                            <p className="text-purple-200/80 text-sm max-w-lg mb-4">{userGuild.description}</p>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <div className="px-3 py-1 rounded-lg bg-black/20 border border-white/5 text-xs font-bold text-purple-300 flex items-center gap-2">
                                    <Crown className="w-3 h-3" /> Level {userGuild.level}
                                </div>
                                <div className="px-3 py-1 rounded-lg bg-black/20 border border-white/5 text-xs font-bold text-emerald-300 flex items-center gap-2">
                                    <Users className="w-3 h-3" /> {userGuild.members.length} Members
                                </div>
                                <div className="px-3 py-1 rounded-lg bg-black/20 border border-white/5 text-xs font-bold text-amber-300 flex items-center gap-2">
                                    <Trophy className="w-3 h-3" /> {userGuild.xp} XP
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 w-full md:w-auto">
                            <button className="btn-primary w-full md:w-auto flex items-center justify-center gap-2">
                                <Swords className="w-4 h-4" /> Guild Quest
                            </button>
                            <button onClick={leaveGuild} className="btn-ghost text-rose-400 hover:bg-rose-500/10 w-full md:w-auto flex items-center justify-center gap-2">
                                <LogOut className="w-4 h-4" /> Leave Guild
                            </button>
                        </div>
                    </div>
                </GlassCard>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Chat Section */}
                    <GlassCard className="h-[400px] flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-purple-400" /> Guild Chat
                        </h3>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4 scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent">
                            {messages.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-gray-500 text-sm italic">
                                    No messages yet. Say hello!
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isMe = msg.userId === profile?.uid;
                                    return (
                                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-bold text-gray-400">{msg.userName}</span>
                                                <span className="text-[10px] text-gray-600">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className={`px-3 py-2 rounded-xl text-sm max-w-[85%] ${isMe
                                                ? 'bg-purple-500/20 text-purple-100 rounded-tr-none'
                                                : 'bg-white/5 text-gray-300 rounded-tl-none'
                                                }`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-purple-500/50 focus:outline-none transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={!chatInput.trim()}
                                className="p-2 rounded-xl bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </GlassCard>

                    {/* Members List */}
                    <GlassCard className="h-[400px] overflow-y-auto">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-emerald-400" /> Members
                        </h3>
                        <div className="space-y-2">
                            {userGuild.members.map((memberId: string, i: number) => (
                                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-xs text-indigo-300">
                                        #{i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-sm text-gray-300 block">Member</span>
                                        <span className="text-[10px] text-gray-500 font-mono">{memberId.slice(0, 8)}...</span>
                                    </div>
                                    {memberId === userGuild.leaderId && (
                                        <Crown className="w-3 h-3 text-amber-400 ml-auto" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </PageTransition>
        );
    }

    // ── Guild Directory (Not in a guild) ──
    return (
        <PageTransition className="space-y-6">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-white mb-2">Guilds</h1>
                <p className="text-gray-400">Join a guild to unlock cooperative quests and multiplier bonuses.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Create New Guild Card */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCreateModal(true)}
                    className="h-48 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-emerald-500/50 transition-all flex flex-col items-center justify-center gap-4 group text-center p-6"
                >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">Create New Guild</h3>
                        <p className="text-xs text-gray-500 mt-1">Form your own alliance</p>
                    </div>
                </motion.button>

                {availableGuilds.map((guild) => (
                    <GlassCard key={guild.id} className="flex flex-col h-48" glow="purple">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-2xl">
                                {guild.icon || '🛡️'}
                            </div>
                            <div className="px-2 py-1 rounded bg-black/40 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                                Lvl {guild.level}
                            </div>
                        </div>
                        <h3 className="font-bold text-white text-lg mb-1">{guild.name}</h3>
                        <p className="text-xs text-gray-400 line-clamp-2 mb-4 flex-1">{guild.description}</p>

                        <div className="flex items-center justify-between mt-auto">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Users className="w-3 h-3" /> {guild.members.length} members
                            </span>
                            <button
                                onClick={() => joinGuild(guild.id)}
                                className="btn-secondary text-xs px-3 py-1.5"
                            >
                                Join Guild
                            </button>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Create Guild Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCreateModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-md"
                        >
                            <GlassCard glow="emerald">
                                <h2 className="text-xl font-bold text-white mb-6">Create Your Guild</h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Guild Icon</label>
                                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                                            {ICONS.map((icon) => (
                                                <button
                                                    key={icon}
                                                    onClick={() => setSelectedIcon(icon)}
                                                    className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-xl transition-all ${selectedIcon === icon
                                                        ? 'bg-emerald-500/20 border-emerald-500 scale-110 shadow-lg shadow-emerald-500/20'
                                                        : 'bg-white/5 hover:bg-white/10'
                                                        }`}
                                                >
                                                    {icon}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Guild Name</label>
                                        <input
                                            type="text"
                                            value={newGuildName}
                                            onChange={(e) => setNewGuildName(e.target.value)}
                                            placeholder="e.g. The Iron Legion"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Description</label>
                                        <textarea
                                            value={newGuildDesc}
                                            onChange={(e) => setNewGuildDesc(e.target.value)}
                                            placeholder="What is your guild about?"
                                            rows={3}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none transition-colors resize-none"
                                        />
                                    </div>

                                    <div className="flex gap-3 mt-6">
                                        <button
                                            onClick={() => setShowCreateModal(false)}
                                            className="flex-1 btn-ghost text-gray-400"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleCreate}
                                            disabled={!newGuildName.trim() || !newGuildDesc.trim()}
                                            className="flex-1 btn-primary"
                                        >
                                            Create Guild
                                        </button>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </PageTransition>
    );
};
