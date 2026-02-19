import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Save, Calendar, Trash2, Smile, Meh, Frown } from 'lucide-react';
import { PageTransition } from '../components/layout/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { useJournalStore } from '../store/journalStore';

const MOODS = [
    { value: 'great', icon: Smile, color: '#10b981', label: 'Great' },
    { value: 'good', icon: Smile, color: '#06b6d4', label: 'Good' },
    { value: 'neutral', icon: Meh, color: '#a8a29e', label: 'Neutral' },
    { value: 'bad', icon: Frown, color: '#f59e0b', label: 'Bad' },
    { value: 'terrible', icon: Frown, color: '#f43f5e', label: 'Terrible' },
] as const;

export const JournalPage: React.FC = () => {
    const store = useJournalStore();
    const [content, setContent] = useState('');
    const [selectedMood, setSelectedMood] = useState<typeof MOODS[number]['value']>('neutral');
    const [selectedFactors, setSelectedFactors] = useState<string[]>([]);

    const handleSave = () => {
        if (!content.trim()) return;

        store.addEntry({
            date: new Date().toISOString(),
            content,
            mood: selectedMood,
            tags: [], // Could be extracted from content hashtags if we wanted
            factors: selectedFactors,
        });

        setContent('');
        setSelectedMood('neutral');
        setSelectedFactors([]);
    };

    return (
        <PageTransition className="space-y-6">
            <div>
                <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                    <Book className="w-8 h-8 text-indigo-400" /> Journal
                </h1>
                <p className="text-sm text-gray-500 mt-1">Reflect on your journey, Seeker.</p>
            </div>

            <GlassCard glow="purple">
                <div className="mb-4">
                    <label className="text-sm font-bold text-white mb-2 block">How are you feeling?</label>
                    <div className="flex gap-2 bg-black/20 p-2 rounded-xl w-fit">
                        {MOODS.map((m) => (
                            <button
                                key={m.value}
                                onClick={() => setSelectedMood(m.value)}
                                className={`p-2 rounded-lg transition-all ${selectedMood === m.value ? 'bg-white/10 shadow-sm' : 'hover:bg-white/5 opacity-50 hover:opacity-100'}`}
                                title={m.label}
                            >
                                <m.icon className="w-6 h-6" style={{ color: selectedMood === m.value ? m.color : '#9ca3af' }} />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-4">
                    <label className="text-sm font-bold text-white mb-2 block">What influenced your mood?</label>
                    <div className="flex flex-wrap gap-2">
                        {['Work', 'Family', 'Sleep', 'Diet', 'Exercise', 'Health', 'Social', 'Weather', 'Hobby'].map(factor => (
                            <button
                                key={factor}
                                onClick={() => {
                                    if (selectedFactors.includes(factor)) {
                                        setSelectedFactors(selectedFactors.filter(f => f !== factor));
                                    } else {
                                        setSelectedFactors([...selectedFactors, factor]);
                                    }
                                }}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedFactors.includes(factor)
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                {factor}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-4">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your thoughts here..."
                        className="input-field min-h-[150px] resize-none"
                    />
                </div>

                <div className="flex justify-end">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSave}
                        disabled={!content.trim()}
                        className="btn-primary flex items-center gap-2 px-6"
                    >
                        <Save className="w-4 h-4" /> Save Entry
                    </motion.button>
                </div>
            </GlassCard>

            <div className="space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-400" /> Past Entries
                </h2>

                <AnimatePresence>
                    {store.entries.length === 0 ? (
                        <p className="text-gray-500 text-sm italic">No entries yet. Start writing today!</p>
                    ) : (
                        store.entries.map((entry) => {
                            const mood = MOODS.find(m => m.value === entry.mood);
                            return (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="glass-subtle p-4 rounded-xl relative group"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {mood && <mood.icon className="w-4 h-4" style={{ color: mood.color }} />}
                                            <span className="text-xs text-gray-400">
                                                {new Date(entry.date).toLocaleDateString()} • {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => store.deleteEntry(entry.id)}
                                            className="text-gray-600 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {entry.factors?.map(f => (
                                            <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">{f}</span>
                                        ))}
                                    </div>
                                    <p className="text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">{entry.content}</p>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </PageTransition>
    );
};
