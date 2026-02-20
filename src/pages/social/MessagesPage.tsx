import React, { useEffect, useState } from 'react';
import { MessageSquare, Send, Search, ChevronLeft } from 'lucide-react';
import { PageTransition } from '../../components/layout/PageTransition';
import { GlassCard } from '../../components/ui/GlassCard';
import { useMessagingStore } from '../../store/messagingStore';
import type { Conversation, Message } from '../../store/messagingStore';
import { useAuthStore } from '../../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import { useSearchParams } from 'react-router-dom';

export const MessagesPage: React.FC = () => {
    const { conversations, fetchConversations, activeConversation, subscribeToMessages, sendMessage } = useMessagingStore();
    const user = useAuthStore(s => s.user);
    const [searchParams] = useSearchParams();
    const [selectedConv, setSelectedConv] = useState<string | null>(searchParams.get('user'));
    const [input, setInput] = useState('');

    useEffect(() => {
        const unsub = fetchConversations();
        return () => { if (unsub) unsub(); };
    }, [fetchConversations]);

    useEffect(() => {
        if (selectedConv) {
            const unsub = subscribeToMessages(selectedConv);
            return () => { if (unsub) unsub(); };
        }
    }, [selectedConv, subscribeToMessages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !selectedConv) return;
        const text = input;
        setInput('');
        await sendMessage(selectedConv, text);
    };

    return (
        <PageTransition className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-2rem)] flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="w-8 h-8 text-indigo-400" />
                <div>
                    <h1 className="text-2xl font-black text-white">Telepathy</h1>
                    <p className="text-xs text-gray-500">Private mental connections between Seekers.</p>
                </div>
            </div>

            <div className="flex-1 flex gap-6 min-h-0">
                {/* Conversations List */}
                <div className={`w-full lg:w-80 flex-col gap-4 ${selectedConv ? 'hidden lg:flex' : 'flex'}`}>
                    <GlassCard className="flex-1 flex flex-col !p-0 overflow-hidden">
                        <div className="p-4 border-b border-white/5">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search connections..."
                                    className="w-full bg-black/20 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/30"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {conversations.length === 0 ? (
                                <div className="p-8 text-center text-gray-600 text-sm italic">
                                    No active connections. Search for Seekers in the Community.
                                </div>
                            ) : (
                                conversations.map((conv: Conversation) => (
                                    <button
                                        key={conv.id}
                                        onClick={() => setSelectedConv(conv.otherParticipant.uid)}
                                        className={`w-full p-4 flex items-center gap-3 hover:bg-white/[0.03] transition-colors border-b border-white/[0.02] text-left
                                            ${selectedConv === conv.otherParticipant.uid ? 'bg-indigo-500/10 border-indigo-500/20' : ''}`}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                            {conv.otherParticipant.avatar || conv.otherParticipant.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <span className="text-sm font-bold text-white truncate">{conv.otherParticipant.name}</span>
                                                <span className="text-[9px] text-gray-600">
                                                    {conv.lastTimestamp?.toDate ? formatDistanceToNow(conv.lastTimestamp.toDate()) : ''}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </GlassCard>
                </div>

                {/* Chat Window */}
                <div className={`flex-1 flex-col ${!selectedConv ? 'hidden lg:flex' : 'flex'}`}>
                    {selectedConv ? (
                        <GlassCard className="flex-1 flex flex-col !p-0 overflow-hidden">
                            {/* Chat Header */}
                            <div className="p-4 border-b border-white/5 flex items-center gap-3">
                                <button onClick={() => setSelectedConv(null)} className="lg:hidden p-2 text-gray-400 hover:text-white">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                    {conversations.find((c: Conversation) => c.otherParticipant.uid === selectedConv)?.otherParticipant.name.charAt(0) || 'S'}
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">
                                        {conversations.find((c: Conversation) => c.otherParticipant.uid === selectedConv)?.otherParticipant.name || 'Seeker'}
                                    </h3>
                                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Connected</p>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar flex flex-col">
                                {activeConversation.map((msg: Message) => {
                                    const isMe = msg.senderId === user?.uid;
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white/10 text-gray-200 rounded-bl-sm'
                                                }`}>
                                                {msg.content}
                                                <div className={`text-[9px] mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-500'} text-right`}>
                                                    {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Chat Input */}
                            <form onSubmit={handleSend} className="p-4 border-t border-white/5 flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                                />
                                <button type="submit" disabled={!input.trim()} className="p-2.5 bg-indigo-600 text-white rounded-xl disabled:opacity-50">
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </GlassCard>
                    ) : (
                        <GlassCard className="flex-1 flex flex-col items-center justify-center text-center p-8">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
                                <MessageSquare className="w-8 h-8 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Mental Link</h3>
                            <p className="text-gray-500 max-w-sm">
                                Select a connection from the left to begin telepathy, or search for other Seekers in the community hub.
                            </p>
                        </GlassCard>
                    )}
                </div>
            </div>
        </PageTransition>
    );
};
