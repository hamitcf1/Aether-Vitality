import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Settings, Trophy, Download, RotateCcw, ChevronRight,
    Heart, Brain, Shield, Flame, Star, MessageCircle, UtensilsCrossed, Upload,
    Zap, Key, Database, Sparkles, LogOut,
} from 'lucide-react';
import { PageTransition } from '../components/layout/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { getCursorEnabled, setCursorEnabled } from '../components/ui/CustomCursor';
import { useAetherStore } from '../store/aetherStore';
import { useAIStore } from '../store/aiStore';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { ACHIEVEMENTS } from '../lib/achievements';
import { getTokenStats, AI_MODELS } from '../lib/aiProvider';
import { PackageTier } from '../constants/packages';

const AVATARS = ['🧙', '🧪', '⚗️', '🔮', '🌿', '🧬', '🦉', '🐉'];
const goalIcons = { liver: Heart, anxiety: Brain, discipline: Shield };

export const ProfilePage: React.FC = () => {
    const store = useAetherStore();
    const aiStore = useAIStore();
    const authStore = useAuthStore();
    const { profile: userProfile } = useUserStore();
    const profile = store.profile;
    const [editName, setEditName] = useState(false);
    const [newName, setNewName] = useState(profile?.name || '');
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [newApiKey, setNewApiKey] = useState('');

    const [newKeyLabel, setNewKeyLabel] = useState('');
    const [showAISettings, setShowAISettings] = useState(false);
    const [cursorEnabled, setCursorEnabledState] = useState(getCursorEnabled());

    const GoalIcon = goalIcons[profile?.healthGoal || 'liver'];
    const tokenStats = getTokenStats();

    const handleExport = () => {
        const data = store.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aether-vitality-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e: Event) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                if (data.profile) store.setProfile(data.profile);
                if (data.hp) store.setHP(data.hp);
                if (data.mana) store.setMana(data.mana);
                alert('Data imported successfully!');
            } catch {
                alert('Failed to import data. Invalid file.');
            }
        };
        input.click();
    };

    const handleAddKey = () => {
        if (!newApiKey.trim()) return;
        aiStore.addApiKey(newApiKey.trim(), newKeyLabel.trim() || `Key ${aiStore.apiKeys.length + 1}`);
        setNewApiKey('');
        setNewKeyLabel('');
    };

    const stats = [
        { icon: UtensilsCrossed, label: 'Meals Logged', value: store.mealsLogged, color: 'text-rose-400' },
        { icon: MessageCircle, label: 'AI Conversations', value: store.chatHistory.length, color: 'text-cyan-400' },
        { icon: Star, label: 'Total XP', value: store.xp, color: 'text-emerald-400' },
        { icon: Flame, label: 'Best Streak', value: store.streak, color: 'text-amber-400' },
        { icon: Trophy, label: 'Quests Completed', value: store.questsCompleted, color: 'text-violet-400' },
        { icon: Star, label: 'Achievements', value: `${store.unlockedAchievements.length}/${ACHIEVEMENTS.length}`, color: 'text-emerald-400' },
    ];

    return (
        <PageTransition className="space-y-5">
            {/* Profile Header */}
            <GlassCard className="text-center py-10" glow="emerald">
                <div className="flex flex-col items-center">
                    {/* Avatar */}
                    <div className="relative mb-4">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 flex items-center justify-center text-4xl">
                            {profile?.avatar}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center text-[10px] font-black text-white shadow-glow-sm">
                            {store.level}
                        </div>
                    </div>

                    {/* Name */}
                    {editName ? (
                        <div className="flex items-center gap-2">
                            <input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="input-field text-center text-lg max-w-[200px]"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        if (profile) store.setProfile({ ...profile, name: newName });
                                        setEditName(false);
                                    }
                                }}
                            />
                            <button
                                onClick={() => {
                                    if (profile) store.setProfile({ ...profile, name: newName });
                                    setEditName(false);
                                }}
                                className="btn-ghost text-emerald-400 text-sm"
                            >
                                Save
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setEditName(true)} className="group cursor-pointer">
                            <h2 className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors">{profile?.name}</h2>
                        </button>
                    )}

                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <GoalIcon className="w-4 h-4" />
                        <span className="capitalize">{profile?.healthGoal} Focus</span>
                        <span className="text-gray-700">•</span>
                        <span className="capitalize">{profile?.difficulty}</span>
                    </div>

                    {/* Body Metrics */}
                    {profile?.heightCm && (
                        <div className="flex flex-wrap justify-center gap-3 mt-4 text-xs text-gray-500">
                            <span>{profile.heightCm}cm</span>
                            <span className="text-gray-700">•</span>
                            <span>{profile.weightKg}kg</span>
                            <span className="text-gray-700">•</span>
                            <span>Age {profile.age}</span>
                            <span className="text-gray-700">•</span>
                            <span className="capitalize">{profile.activityLevel?.replace('_', ' ')}</span>
                            {profile.targetWeightKg && (
                                <>
                                    <span className="text-gray-700">•</span>
                                    <span>Target: {profile.targetWeightKg}kg</span>
                                </>
                            )}
                        </div>
                    )}

                    {/* Avatar Selector */}
                    <div className="flex gap-2 mt-4">
                        {AVATARS.map((a) => (
                            <button
                                key={a}
                                onClick={() => profile && store.setProfile({ ...profile, avatar: a })}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg cursor-pointer transition-all duration-200 ${profile?.avatar === a
                                    ? 'bg-emerald-500/20 border border-emerald-500/30 scale-110'
                                    : 'bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.06]'
                                    }`}
                            >
                                {a}
                            </button>
                        ))}
                    </div>
                </div>
            </GlassCard>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {stats.map((stat) => (
                    <div key={stat.label} className="glass-subtle p-4 text-center">
                        <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                        <div className="text-lg font-black text-white">{stat.value}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Achievements */}
            <GlassCard>
                <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">Achievements</h3>
                    <span className="text-xs text-gray-600 ml-auto">
                        {store.unlockedAchievements.length} / {ACHIEVEMENTS.length}
                    </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                    {ACHIEVEMENTS.map((ach) => (
                        <Badge
                            key={ach.id}
                            achievementId={ach.id}
                            unlocked={store.unlockedAchievements.includes(ach.id)}
                        />
                    ))}
                </div>
            </GlassCard>

            {/* AI Settings */}
            <GlassCard>
                <button
                    onClick={() => setShowAISettings(!showAISettings)}
                    className="w-full flex items-center gap-2 cursor-pointer"
                >
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">AI Settings</h3>
                    <ChevronRight className={`w-4 h-4 text-gray-600 ml-auto transition-transform ${showAISettings ? 'rotate-90' : ''}`} />
                </button>

                {showAISettings && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="mt-4 space-y-4"
                    >
                        {/* Token Usage */}
                        <div className="glass-subtle p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Zap className="w-3 h-3 text-amber-400" /> Token Usage Today
                                </span>
                                <span className="text-xs text-gray-500 font-mono">
                                    {(tokenStats.today / 1000).toFixed(1)}k / {(tokenStats.limit / 1000).toFixed(0)}k
                                </span>
                            </div>
                            <ProgressBar value={tokenStats.percentage} variant={tokenStats.percentage > 80 ? 'rose' : 'emerald'} size="sm" />
                            <div className="flex justify-between mt-2 text-[10px] text-gray-600">
                                <span>Remaining: {(tokenStats.remaining / 1000).toFixed(1)}k</span>
                                <span>Lifetime: {(aiStore.totalTokensUsed / 1000).toFixed(1)}k</span>
                            </div>
                        </div>

                        {/* Daily Budget Slider */}
                        <div className="glass-subtle p-4">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                                Daily Token Budget: {(aiStore.dailyTokenBudget / 1000).toFixed(0)}k
                            </label>
                            <input
                                type="range"
                                min={100000}
                                max={5000000}
                                step={100000}
                                value={aiStore.dailyTokenBudget}
                                onChange={(e) => aiStore.setDailyTokenBudget(Number(e.target.value))}
                                className="w-full accent-emerald-500"
                            />
                        </div>

                        {/* Model Preference */}
                        <div className="glass-subtle p-4">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                                Preferred Model
                            </label>
                            <select
                                value={aiStore.preferredModel}
                                onChange={(e) => aiStore.setPreferredModel(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                            >
                                {AI_MODELS.map(model => (
                                    <option key={model.id} value={model.id}>
                                        {model.label} ({model.tier})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* API Keys - Restricted to Aetherius/Admin */}
                        {userProfile?.packageTier === PackageTier.AETHERIUS && (
                            <div className="glass-subtle p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Key className="w-3 h-3 text-amber-400" />
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">API Keys</span>
                                </div>

                                {/* Env key */}
                                {import.meta.env.VITE_GEMINI_API_KEY && (
                                    <div className="flex items-center justify-between p-2 glass-subtle rounded-lg mb-2">
                                        <span className="text-xs text-gray-400">.env key</span>
                                        <span className="text-xs text-emerald-400">Active</span>
                                    </div>
                                )}

                                {/* User added keys */}
                                {aiStore.apiKeys.map((k) => (
                                    <div key={k.key} className="flex items-center justify-between p-2 glass-subtle rounded-lg mb-2">
                                        <div>
                                            <span className="text-xs text-gray-300">{k.label}</span>
                                            <span className="text-[10px] text-gray-600 ml-2">...{k.key.slice(-6)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => aiStore.toggleApiKey(k.key)}
                                                className={`text-[10px] px-2 py-0.5 rounded-full cursor-pointer ${k.enabled
                                                    ? 'bg-emerald-500/10 text-emerald-400'
                                                    : 'bg-gray-500/10 text-gray-500'
                                                    }`}
                                            >
                                                {k.enabled ? 'On' : 'Off'}
                                            </button>
                                            <button
                                                onClick={() => aiStore.removeApiKey(k.key)}
                                                className="text-[10px] text-rose-400 hover:text-rose-300 cursor-pointer"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Add new key */}
                                <div className="mt-3 space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Key label (optional)"
                                        value={newKeyLabel}
                                        onChange={(e) => setNewKeyLabel(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/30"
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            type="password"
                                            placeholder="Paste Gemini API key..."
                                            value={newApiKey}
                                            onChange={(e) => setNewApiKey(e.target.value)}
                                            className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/30"
                                        />
                                        <button onClick={handleAddKey} disabled={!newApiKey.trim()} className="btn-primary text-xs px-4 py-2">
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Cache Stats */}
                        <div className="glass-subtle p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Database className="w-3 h-3 text-cyan-400" />
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Food Cache</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <div className="text-lg font-black text-white">{aiStore.getFoodCacheStats().count}</div>
                                    <div className="text-[10px] text-gray-500">Total</div>
                                </div>
                                <div>
                                    <div className="text-lg font-black text-emerald-400">{aiStore.getFoodCacheStats().aiCount}</div>
                                    <div className="text-[10px] text-gray-500">AI Cached</div>
                                </div>
                                <div>
                                    <div className="text-lg font-black text-cyan-400">{aiStore.getFoodCacheStats().dbCount}</div>
                                    <div className="text-[10px] text-gray-500">From DB</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </GlassCard>

            {/* Settings */}
            <GlassCard>
                <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-4 h-4 text-gray-400" />
                    <h3 className="text-sm font-bold text-white">Settings</h3>
                </div>
                <div className="space-y-1">
                    {/* Custom Cursor Toggle */}
                    <div className="w-full flex items-center justify-between p-3 glass-subtle rounded-xl mb-1">
                        <span className="flex items-center gap-3 text-sm text-gray-300">
                            <Sparkles className="w-4 h-4 text-emerald-400" /> Custom Cursor
                        </span>
                        <button
                            onClick={() => {
                                const newState = !cursorEnabled;
                                setCursorEnabled(newState);
                                setCursorEnabledState(newState);
                            }}
                            className={`w-10 h-6 rounded-full p-1 transition-colors relative cursor-pointer ${cursorEnabled ? 'bg-emerald-500/20 shadow-inner' : 'bg-gray-500/10'
                                }`}
                        >
                            <div className={`w-4 h-4 rounded-full shadow-sm transition-all ${cursorEnabled ? 'bg-emerald-400 translate-x-4' : 'bg-gray-500 translate-x-0'
                                }`} />
                        </button>
                    </div>

                    <button onClick={handleExport} className="w-full flex items-center justify-between p-3 glass-subtle rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer">
                        <span className="flex items-center gap-3 text-sm text-gray-300">
                            <Download className="w-4 h-4 text-cyan-400" /> Export Data
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                    <button onClick={handleImport} className="w-full flex items-center justify-between p-3 glass-subtle rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer">
                        <span className="flex items-center gap-3 text-sm text-gray-300">
                            <Upload className="w-4 h-4 text-emerald-400" /> Import Data
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                        onClick={() => setShowResetConfirm(true)}
                        className="w-full flex items-center justify-between p-3 glass-subtle rounded-xl hover:bg-rose-500/5 transition-colors cursor-pointer"
                    >
                        <span className="flex items-center gap-3 text-sm text-rose-400">
                            <RotateCcw className="w-4 h-4" /> Reset Progress
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                        onClick={() => authStore.signOut()}
                        className="w-full flex items-center justify-between p-3 glass-subtle rounded-xl hover:bg-rose-500/5 transition-colors cursor-pointer"
                    >
                        <span className="flex items-center gap-3 text-sm text-gray-300 group-hover:text-rose-400">
                            <LogOut className="w-4 h-4" /> Log Out
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                </div>
            </GlassCard>

            {/* Reset Confirm Modal */}
            {showResetConfirm && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowResetConfirm(false)}
                >
                    <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className="glass p-6 w-full max-w-sm text-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <RotateCcw className="w-10 h-10 text-rose-400 mx-auto mb-3" />
                        <h3 className="text-lg font-black text-white mb-2">Reset All Progress?</h3>
                        <p className="text-sm text-gray-500 mb-6">This will erase all stats, meals, quests, and achievements. Your profile will be kept.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowResetConfirm(false)} className="btn-secondary flex-1">Cancel</button>
                            <button
                                onClick={() => { store.resetProgress(); setShowResetConfirm(false); }}
                                className="flex-1 px-4 py-3 bg-rose-500/20 text-rose-400 font-bold rounded-xl border border-rose-500/20 hover:bg-rose-500/30 transition-colors cursor-pointer"
                            >
                                Reset
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </PageTransition>
    );
};
