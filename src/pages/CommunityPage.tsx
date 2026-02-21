import React, { useState, useEffect } from 'react';
import { Search, Send } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { PageTransition } from '../components/layout/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { HeroCard } from '../components/social/HeroCard';
import { UserFeed } from '../components/social/UserFeed';
import { db } from '../lib/firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, getDocs, where } from 'firebase/firestore';
import { GuildsPage } from './social/GuildsPage';

interface GlobalChatMessage {
    id: string;
    userId: string;
    userName: string;
    content: string;
    timestamp: any;
}

export const CommunityPage: React.FC = () => {
    const user = useAuthStore(s => s.user);
    const [activeTab, setActiveTab] = useState<'feed' | 'chat' | 'seekers' | 'forum' | 'guilds'>('feed');

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    // Chat State
    const [messages, setMessages] = useState<GlobalChatMessage[]>([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        if (activeTab === 'chat') {
            const q = query(
                collection(db, 'global_chat'),
                orderBy('timestamp', 'desc'),
                limit(50)
            );
            return onSnapshot(q, (snapshot) => {
                const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GlobalChatMessage[];
                setMessages(msgs.reverse());
            }, (error) => {
                console.error("Global chat snapshot error:", error);
            });
        }
    }, [activeTab]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !user) return;
        const text = input;
        setInput('');
        await addDoc(collection(db, 'global_chat'), {
            userId: user.uid,
            userName: user.displayName || 'Unknown',
            content: text,
            timestamp: serverTimestamp()
        });
    };

    async function handleSearch(term: string) {
        setIsSearching(true);
        try {
            const usersRef = collection(db, 'users');
            const q = query(
                usersRef,
                where('name', '>=', term),
                where('name', '<=', term + '\uf8ff'),
                limit(10)
            );
            const snap = await getDocs(q);
            setSearchResults(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
        } catch (e) {
            console.error(e);
        } finally {
            setIsSearching(false);
        }
    }

    return (
        <PageTransition className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-2rem)]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Nexus Hub</h1>
                    <p className="text-gray-500 font-medium">Connect with fellow Seekers and share your journey.</p>
                </div>

                <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                    <button onClick={() => setActiveTab('feed')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'feed' ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-500'}`}>Nexus Feed</button>
                    <button onClick={() => setActiveTab('chat')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'chat' ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-500'}`}>Global Hub</button>
                    <button onClick={() => setActiveTab('guilds')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'guilds' ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-500'}`}>Guilds</button>
                    <button onClick={() => setActiveTab('seekers')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'seekers' ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-500'}`}>Seekers</button>
                    <button onClick={() => setActiveTab('forum')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'forum' ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-500'}`}>Hallowed Halls</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                {activeTab === 'feed' && (
                    <div className="max-w-2xl mx-auto py-6">
                        <UserFeed />
                    </div>
                )}

                {activeTab === 'chat' && (
                    <GlassCard className="h-full flex flex-col !p-0 overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {messages.map((msg) => (
                                <div key={msg.id} className="flex flex-col">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-indigo-400">{msg.userName}</span>
                                        <span className="text-[10px] text-gray-600">{msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString() : ''}</span>
                                    </div>
                                    <p className="text-sm text-gray-300 bg-white/5 rounded-xl px-4 py-2 inline-block max-w-[80%]">{msg.content}</p>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 flex gap-2 bg-black/20">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Broadcast to the Nexus..."
                                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                            />
                            <button type="submit" className="p-2 bg-indigo-600 text-white rounded-xl"><Send className="w-4 h-4" /></button>
                        </form>
                    </GlassCard>
                )}

                {activeTab === 'seekers' && (
                    <div className="space-y-6">
                        <div className="relative max-w-xl mx-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if (e.target.value.length >= 3) handleSearch(e.target.value);
                                }}
                                placeholder="Search by name..."
                                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-cyan-500/50 shadow-xl"
                            />
                        </div>

                        {isSearching && (
                            <div className="flex justify-center py-4">
                                <div className="w-6 h-6 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
                            </div>
                        )}

                        {selectedUser ? (
                            <div className="max-w-xl mx-auto">
                                <button onClick={() => setSelectedUser(null)} className="mb-4 text-xs font-bold text-cyan-400 hover:underline">← Back to Search</button>
                                <HeroCard userId={selectedUser} isOpen={true} onClose={() => setSelectedUser(null)} />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {searchResults.map((res) => (
                                    <button
                                        key={res.uid}
                                        onClick={() => setSelectedUser(res.uid)}
                                        className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold group-hover:shadow-glow-sm">
                                                {res.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white">{res.name}</h4>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Level {res.level || 1}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'guilds' && (
                    <div className="py-2">
                        <GuildsPage />
                    </div>
                )}
            </div>
        </PageTransition>
    );
};
