import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageSquare, Share2, Plus, Sparkles } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { useAuthStore } from '../../store/authStore';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

interface Post {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    content: string;
    type: 'status' | 'achievement' | 'milestone';
    likes: string[];
    comments: any[];
    timestamp: any;
}

export const UserFeed: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [input, setInput] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const user = useAuthStore(s => s.user);

    useEffect(() => {
        const q = query(
            collection(db, 'posts'),
            orderBy('timestamp', 'desc'),
            limit(20)
        );

        return onSnapshot(q, (snapshot) => {
            const newPosts = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Post[];
            setPosts(newPosts);
        }, (error) => {
            console.error("Posts snapshot error:", error);
        });
    }, []);

    const handlePost = async () => {
        if (!input.trim() || !user) return;
        setIsPosting(true);
        try {
            await addDoc(collection(db, 'posts'), {
                userId: user.uid,
                userName: user.displayName || 'Unknown Seeker',
                userAvatar: '',
                content: input,
                type: 'status',
                likes: [],
                comments: [],
                timestamp: serverTimestamp()
            });
            setInput('');
        } catch (error) {
            console.error("Post failed:", error);
        } finally {
            setIsPosting(false);
        }
    };

    const handleLike = async (postId: string, likes: string[]) => {
        if (!user) return;
        const postRef = doc(db, 'posts', postId);
        const isLiked = likes.includes(user.uid);

        await updateDoc(postRef, {
            likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
        });
    };

    return (
        <div className="space-y-6">
            {/* Create Post */}
            <GlassCard className="!p-4 border-emerald-500/20">
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Plus className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Share your progress, wisdom, or milestones..."
                            className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500/30 resize-none h-24"
                        />
                        <div className="flex justify-end mt-2">
                            <button
                                onClick={handlePost}
                                disabled={!input.trim() || isPosting}
                                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                {isPosting ? 'Casting...' : 'Post Update'}
                            </button>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Posts List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {posts.map((post) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <GlassCard className="hover:border-white/10 transition-colors">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white font-bold shrink-0">
                                        {post.userName.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="text-sm font-bold text-white mb-0.5">{post.userName}</h4>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">
                                                    {post.type} • {post.timestamp?.toDate ? post.timestamp.toDate().toLocaleDateString() : 'Just now'}
                                                </p>
                                            </div>
                                            <Share2 className="w-4 h-4 text-gray-700 hover:text-white cursor-pointer transition-colors" />
                                        </div>
                                        <p className="text-sm text-gray-300 leading-relaxed mb-4">{post.content}</p>

                                        <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                                            <button
                                                onClick={() => handleLike(post.id, post.likes)}
                                                className={`flex items-center gap-2 text-xs font-bold transition-colors ${post.likes.includes(user?.uid || '') ? 'text-rose-400' : 'text-gray-500 hover:text-white'}`}
                                            >
                                                <Heart className={`w-4 h-4 ${post.likes.includes(user?.uid || '') ? 'fill-rose-400' : ''}`} />
                                                {post.likes.length}
                                            </button>
                                            <button className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-white transition-colors">
                                                <MessageSquare className="w-4 h-4" />
                                                {post.comments.length}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};
