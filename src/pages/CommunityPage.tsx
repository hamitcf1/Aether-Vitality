import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, MessageCircle, Send } from 'lucide-react';
import { PageTransition } from '../components/layout/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { useAuthStore } from '../store/authStore';
import { useAetherStore } from '../store/aetherStore';
import { db } from '../lib/firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { HeroCard } from '../components/social/HeroCard';

interface GlobalChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: any;
}

export const CommunityPage: React.FC = () => {
    const user = useAuthStore(s => s.user);
    const profile = useAetherStore(s => s.profile);
    const [activeTab, setActiveTab] = useState<'chat' | 'forum'>('chat');

    // Chat State
    const [messages, setMessages] = useState<GlobalChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch Global Chat
    useEffect(() => {
        if (activeTab !== 'chat') return;

        const q = query(collection(db, 'global_chat'), orderBy('timestamp', 'desc'), limit(50));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as GlobalChatMessage[];
            setMessages(msgs.reverse());
        });

        return () => unsubscribe();
    }, [activeTab]);

    // Auto-scroll chat
    useEffect(() => {
        if (scrollRef.current && activeTab === 'chat') {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, activeTab]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !user || !profile) return;

        const msgContent = input;
        setInput('');

        try {
            await addDoc(collection(db, 'global_chat'), {
                senderId: user.uid,
                senderName: profile.name || 'Unknown',
                content: msgContent,
                timestamp: serverTimestamp()
            });
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    return (
        <PageTransition className="space-y-6 max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
            <div>
                <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                    <Users className="w-8 h-8 text-indigo-400" /> Community Hub
                </h1>
                <p className="text-sm text-gray-500 mt-1">Connect with other Seekers across the realm.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10 pb-4">
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'chat'
                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <MessageSquare className="w-4 h-4" /> Global Chat
                </button>
                <button
                    onClick={() => setActiveTab('forum')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'forum'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <MessageCircle className="w-4 h-4" /> Forums (Coming Soon)
                </button>
            </div>

            {/* Chat Area */}
            {activeTab === 'chat' && (
                <GlassCard className="flex-grow flex flex-col p-0 overflow-hidden">
                    <div
                        ref={scrollRef}
                        className="flex-grow p-4 overflow-y-auto space-y-4 custom-scrollbar"
                    >
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                                <MessageSquare className="w-8 h-8 mb-2" />
                                <p className="text-sm">No messages yet. Say hello!</p>
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isMe = msg.senderId === user?.uid;
                                return (
                                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-end gap-2 max-w-[80%]">
                                            {!isMe && (
                                                <button
                                                    onClick={() => setSelectedUserId(msg.senderId)}
                                                    className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0 hover:scale-110 transition-transform cursor-pointer"
                                                >
                                                    {msg.senderName.charAt(0)}
                                                </button>
                                            )}
                                            <div className={`px-4 py-2 rounded-2xl text-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white/10 text-gray-200 rounded-bl-sm'}`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-gray-600 mt-1 px-1 flex items-center gap-1">
                                            {!isMe && (
                                                <button onClick={() => setSelectedUserId(msg.senderId)} className="hover:text-indigo-400 transition-colors">
                                                    {msg.senderName}
                                                </button>
                                            )}
                                            <span className="text-gray-700">•</span>
                                            {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <form onSubmit={handleSendMessage} className="p-3 bg-white/[0.02] border-t border-white/5 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Message the community..."
                            className="flex-grow bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                        />
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            type="submit"
                            disabled={!input.trim()}
                            className="p-2.5 bg-indigo-600 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </motion.button>
                    </form>
                </GlassCard>
            )}

            {/* Forum Placeholder Area */}
            {activeTab === 'forum' && (
                <GlassCard className="flex-grow flex flex-col items-center justify-center text-center p-8">
                    <MessageCircle className="w-16 h-16 text-emerald-400/50 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Community Forums</h3>
                    <p className="text-gray-400 max-w-md">
                        The forums are currently under construction. Check back soon for deep discussions, guides, and lore sharing!
                    </p>
                </GlassCard>
            )}

            <HeroCard
                userId={selectedUserId || ''}
                isOpen={!!selectedUserId}
                onClose={() => setSelectedUserId(null)}
            />
        </PageTransition>
    );
};
