import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, X, Lock, Globe } from 'lucide-react';
import { useGuildsStore } from '../../store/guildsStore';

interface CreateGuildModalProps {
    onClose: () => void;
}

export const CreateGuildModal: React.FC<CreateGuildModalProps> = ({ onClose }) => {
    const { createGuild } = useGuildsStore();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            await createGuild(name, description, privacy);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-[#0a0a0b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Shield className="text-indigo-400" /> Create Guild
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Guild Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-field w-full"
                            placeholder="e.g. The Night's Watch"
                            maxLength={30}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="input-field w-full h-24 resize-none"
                            placeholder="What is your guild about?"
                            maxLength={150}
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">Privacy</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setPrivacy('public')}
                                className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${privacy === 'public'
                                        ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400'
                                        : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                <Globe className="w-4 h-4" /> Public
                            </button>
                            <button
                                type="button"
                                onClick={() => setPrivacy('private')}
                                className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${privacy === 'private'
                                        ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400'
                                        : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                <Lock className="w-4 h-4" /> Private
                            </button>
                        </div>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading || !name}
                        className="btn-primary w-full py-3 mt-4"
                    >
                        {loading ? 'Forging Guild...' : 'Create Guild'}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};
