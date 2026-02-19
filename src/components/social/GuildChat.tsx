import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare } from 'lucide-react';
import { useGuildsStore } from '../../store/guildsStore';
import { useAuthStore } from '../../store/authStore';
import { GlassCard } from '../../components/ui/GlassCard';

export const GuildChat: React.FC = () => {
    const { messages, sendMessage } = useGuildsStore();
    const user = useAuthStore(state => state.user);
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        await sendMessage(input);
        setInput('');
    };

    return (
        <GlassCard className="h-full flex flex-col p-0 overflow-hidden bg-black/40 backdrop-blur-xl">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center gap-2 bg-white/[0.02]">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-bold text-white">Guild Chat</span>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-grow p-4 overflow-y-auto space-y-4 custom-scrollbar"
            >
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                        <MessageSquare className="w-8 h-8 mb-2" />
                        <p className="text-sm">No messages yet. Say hello!</p>
                    </div>
                )}

                {messages.map((msg) => {
                    const isMe = msg.senderId === user?.uid;
                    return (
                        <div
                            key={msg.id}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                            <div className="flex items-end gap-2 max-w-[80%]">
                                {!isMe && (
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0">
                                        {msg.senderName.charAt(0)}
                                    </div>
                                )}
                                <div
                                    className={`px-4 py-2 rounded-2xl text-sm ${isMe
                                        ? 'bg-indigo-600 text-white rounded-br-sm'
                                        : 'bg-white/10 text-gray-200 rounded-bl-sm'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                            <span className="text-[10px] text-gray-600 mt-1 px-1">
                                {!isMe && `${msg.senderName} • `}
                                {new Date(msg.timestamp?.toDate ? msg.timestamp.toDate() : msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-white/[0.02] border-t border-white/5 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Message your guild..."
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
    );
};
