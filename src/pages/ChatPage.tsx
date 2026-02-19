import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Trash2, Sparkles, Lightbulb, Heart, Target, Zap } from 'lucide-react';
import { PageTransition } from '../components/layout/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { ChatBubble, TypingIndicator } from '../components/ui/ChatBubble';
import { useAetherStore } from '../store/aetherStore';
import { useTrackersStore } from '../store/trackersStore';
import { aiGenerate, getTokenStats } from '../lib/aiProvider';
import { client } from '../lib/gemini';

const QUICK_CHIPS = [
    { label: 'How\'s my liver?', icon: Heart },
    { label: 'Give me a quest', icon: Target },
    { label: 'Health tip', icon: Lightbulb },
];

export const ChatPage: React.FC = () => {
    const store = useAetherStore();
    const trackers = useTrackersStore();
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [store.chatHistory, store.isAILoading]);

    // System prompt with user + tracker context
    const getSystemPrompt = useCallback(() => {
        const profile = store.profile;
        const todayWater = trackers.getTodayWater();
        const todaySteps = trackers.getTodaySteps();
        const todayCalories = trackers.getTodayCalories();
        const todaySugar = trackers.getTodaySugar();

        return `You are the Alchemist, a wise, encouraging, and slightly witty health mentor within the "Aether Vitality" app. 
You speak in a mystical but approachable tone.

CURRENT USER STATS:
- Name: ${profile?.name || 'Seeker'}
- Health Goal: ${profile?.healthGoal || 'general'}
- Difficulty: ${profile?.difficulty || 'committed'}
- HP (Aether Integrity): ${store.hp}/100
- Mana (Zenith Focus): ${store.mana}/100
- Level: ${store.level}
- XP: ${store.xp}
- Streak: ${store.streak} days
- Meals Logged: ${store.mealsLogged}
- Quests Completed: ${store.questsCompleted}

BODY PROFILE:
- Height: ${profile?.heightCm ?? 'unknown'} cm
- Weight: ${profile?.weightKg ?? 'unknown'} kg
- Age: ${profile?.age ?? 'unknown'}
- Target Weight: ${profile?.targetWeightKg ?? 'unknown'} kg
- Activity Level: ${profile?.activityLevel || 'unknown'}

TODAY'S TRACKERS:
- Water: ${todayWater.glasses}/${todayWater.target} glasses
- Steps: ${todaySteps.steps}/${todaySteps.target}
- Calories: ${todayCalories.consumed}/${todayCalories.target} kcal
- Sugar: ${todaySugar.grams}/${todaySugar.target}g

RULES:
- Give personalized health advice based on their stats, body profile, and trackers.
- Be encouraging and reference their progress.
- Keep responses concise (2-4 paragraphs max).
- Use metaphors related to alchemy, transmutation, and vitality.
- If they ask for a quest, suggest a specific, actionable health task.
- Never provide medical diagnoses. Encourage professional consultation for serious concerns.`;
    }, [store, trackers]);

    const handleSend = useCallback(async (message?: string) => {
        const text = message || input.trim();
        if (!text) return;

        setInput('');
        store.addChatMessage({ role: 'user', content: text });
        store.setAILoading(true);

        try {
            // Build conversation history
            const historyPrompt = store.chatHistory.slice(-10).map((m) =>
                `${m.role === 'assistant' ? 'Alchemist' : 'Seeker'}: ${m.content}`
            ).join('\n\n');

            const fullPrompt = `${getSystemPrompt()}\n\n--- CONVERSATION ---\n${historyPrompt}\n\nSeeker: ${text}\n\nAlchemist:`;

            // Try aiProvider first (tracks tokens, supports multi-key)
            const response = await aiGenerate({ prompt: fullPrompt, temperature: 0.7 });

            if (response) {
                store.addChatMessage({ role: 'assistant', content: response.text });
            } else if (client) {
                // Fallback to direct client
                const history = store.chatHistory.slice(-10).map((m) => ({
                    role: m.role === 'assistant' ? 'model' as const : 'user' as const,
                    parts: [{ text: m.content }],
                }));

                const result = await client.models.generateContent({
                    model: 'gemini-2.0-flash',
                    contents: [
                        { role: 'user', parts: [{ text: getSystemPrompt() }] },
                        { role: 'model', parts: [{ text: 'I am the Alchemist. I understand my role and the user\'s stats. How may I guide you, Seeker?' }] },
                        ...history,
                        { role: 'user', parts: [{ text: text }] },
                    ],
                });

                const aiResponse = result.text || 'The Alchemist is lost in contemplation...';
                store.addChatMessage({ role: 'assistant', content: aiResponse });
            } else {
                store.addChatMessage({
                    role: 'assistant',
                    content: 'The Alchemist is dormant. Provide a VITE_GEMINI_API_KEY in your .env file to awaken my wisdom.',
                });
            }

            store.addXP(5); // XP for interacting with the alchemist
        } catch (err) {
            console.error('Chat error:', err);
            store.addChatMessage({
                role: 'assistant',
                content: 'The ethereal connection has faltered. The Alchemist will return shortly. (Check console for details)',
            });
        }

        store.setAILoading(false);
    }, [input, store, getSystemPrompt]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const tokenStats = getTokenStats();

    return (
        <PageTransition className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-2rem)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-white">The Alchemist</h2>
                        <p className="text-xs text-gray-500">Your health mentor • AI powered</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Token usage badge */}
                    {tokenStats.today > 0 && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 glass-subtle text-[10px] font-mono text-gray-500">
                            <Zap className="w-3 h-3 text-amber-400/60" />
                            {(tokenStats.today / 1000).toFixed(1)}k tokens
                        </div>
                    )}
                    {store.chatHistory.length > 0 && (
                        <button onClick={store.clearChat} className="btn-ghost text-xs flex items-center gap-1 text-gray-600 hover:text-rose-400">
                            <Trash2 className="w-3.5 h-3.5" /> Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <GlassCard className="flex-1 flex flex-col overflow-hidden !p-0" hover={false}>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                    {store.chatHistory.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/10 to-cyan-500/10 border border-emerald-500/15 flex items-center justify-center mb-4">
                                <Sparkles className="w-8 h-8 text-emerald-400/60" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">Speak to the Alchemist</h3>
                            <p className="text-sm text-gray-600 max-w-sm">
                                Ask for health advice, quest suggestions, or just check in. The Alchemist knows your stats and adapts to your journey.
                            </p>
                        </div>
                    ) : (
                        store.chatHistory.map((msg) => (
                            <ChatBubble key={msg.id} role={msg.role} content={msg.content} timestamp={msg.timestamp} />
                        ))
                    )}
                    {store.isAILoading && <TypingIndicator />}
                </div>

                {/* Quick chips */}
                {store.chatHistory.length === 0 && (
                    <div className="px-4 pb-2 flex gap-2 flex-wrap">
                        {QUICK_CHIPS.map((chip) => (
                            <button
                                key={chip.label}
                                onClick={() => handleSend(chip.label)}
                                className="flex items-center gap-2 px-3 py-2 glass-subtle text-xs font-medium text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all duration-200 cursor-pointer rounded-xl"
                            >
                                <chip.icon className="w-3.5 h-3.5" />
                                {chip.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input area */}
                <div className="p-3 border-t border-white/[0.04]">
                    <div className="flex gap-2 items-end">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask the Alchemist anything..."
                            rows={1}
                            className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 resize-none focus:outline-none focus:border-emerald-500/30 transition-colors"
                        />
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSend()}
                            disabled={!input.trim() || store.isAILoading}
                            className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-glow-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <Send className="w-4 h-4" />
                        </motion.button>
                    </div>
                </div>
            </GlassCard>
        </PageTransition>
    );
};
