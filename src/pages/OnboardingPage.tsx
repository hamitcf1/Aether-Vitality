import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Sparkles, Heart, Brain, Shield, ChevronRight, Zap,
    Ruler, Weight, User, Activity
} from 'lucide-react';
import { AnimatedBackground } from '../components/ui/AnimatedBackground';
import { useAetherStore } from '../store/aetherStore';
import { useTrackersStore } from '../store/trackersStore';
import { ACTIVITY_LABELS, type ActivityLevel, type Gender } from '../lib/calorieCalculator';

const AVATARS = ['🧙', '🧪', '⚗️', '🔮', '🌿', '🧬', '🦉', '🐉'];
const HEALTH_GOALS = [
    { value: 'liver' as const, icon: Heart, label: 'Liver Recovery', desc: 'Track nutrition for liver health', color: 'from-rose-500 to-rose-400' },
    { value: 'anxiety' as const, icon: Brain, label: 'Anxiety Management', desc: 'Mental wellness & mindfulness', color: 'from-violet-500 to-violet-400' },
    { value: 'discipline' as const, icon: Shield, label: 'Self-Discipline', desc: 'Build habits & streak tracking', color: 'from-cyan-500 to-cyan-400' },
];
const DIFFICULTIES = [
    { value: 'casual' as const, label: 'Casual', desc: 'Gentle pace, no penalties', xpMult: '1×' },
    { value: 'committed' as const, label: 'Committed', desc: 'Balanced challenge', xpMult: '1.5×' },
    { value: 'ascendant' as const, label: 'Ascendant', desc: 'Maximum stakes & rewards', xpMult: '2×' },
];

const TOTAL_STEPS = 4;

export const OnboardingPage: React.FC = () => {
    const navigate = useNavigate();
    const setProfile = useAetherStore((s) => s.setProfile);
    const completeOnboarding = useAetherStore((s) => s.completeOnboarding);
    const generateDailyQuests = useAetherStore((s) => s.generateDailyQuests);
    const setBodyProfile = useTrackersStore((s) => s.setBodyProfile);

    const [step, setStep] = useState(0);
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState('🧙');
    const [healthGoal, setHealthGoal] = useState<'liver' | 'anxiety' | 'discipline'>('liver');
    const [difficulty, setDifficulty] = useState<'casual' | 'committed' | 'ascendant'>('committed');

    // Body metrics
    const [heightCm, setHeightCm] = useState(170);
    const [weightKg, setWeightKg] = useState(70);
    const [age, setAge] = useState(25);
    const [gender, setGender] = useState<Gender>('male');
    const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
    const [targetWeightKg, setTargetWeightKg] = useState(65);

    const handleComplete = useCallback(() => {
        setProfile({
            name: name || 'Seeker',
            avatar,
            healthGoal,
            difficulty,
            createdAt: Date.now(),
            heightCm,
            weightKg,
            age,
            gender,
            activityLevel,
            targetWeightKg,
        });
        setBodyProfile({ heightCm, weightKg, age, gender, activityLevel, targetWeightKg });
        completeOnboarding();
        generateDailyQuests();
        navigate('/');
    }, [name, avatar, healthGoal, difficulty, heightCm, weightKg, age, gender, activityLevel, targetWeightKg, setProfile, setBodyProfile, completeOnboarding, generateDailyQuests, navigate]);

    const canProceed = step === 0 || (step === 1 && name.trim().length > 0) || step === 2 || step === 3;

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative">
            <AnimatedBackground />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg"
            >
                {/* Progress dots */}
                <div className="flex justify-center gap-2 mb-8">
                    {[...Array(TOTAL_STEPS)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{ scale: step === i ? 1.2 : 1, opacity: step >= i ? 1 : 0.3 }}
                            className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${step >= i ? 'bg-brand-emerald' : 'bg-white/10'
                                }`}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* Step 0: Welcome */}
                    {step === 0 && (
                        <motion.div
                            key="welcome"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center"
                        >
                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-glow-lg"
                            >
                                <Sparkles className="w-12 h-12 text-white" />
                            </motion.div>

                            <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Aether Vitality</h1>
                            <p className="text-lg text-gray-400 mb-2">Your Personal Health Alchemist</p>
                            <p className="text-sm text-gray-600 max-w-sm mx-auto leading-relaxed">
                                Transform your health journey with AI-powered guidance, gamified tracking,
                                and a mystical alchemist by your side.
                            </p>
                        </motion.div>
                    )}

                    {/* Step 1: Profile */}
                    {step === 1 && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="glass p-8"
                        >
                            <h2 className="text-2xl font-black text-white mb-1">Choose Your Identity</h2>
                            <p className="text-sm text-gray-500 mb-6">How shall the Alchemist address you?</p>

                            <div className="space-y-5">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter your name..."
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="input-field text-lg"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Avatar</label>
                                    <div className="grid grid-cols-8 gap-2">
                                        {AVATARS.map((a) => (
                                            <button
                                                key={a}
                                                onClick={() => setAvatar(a)}
                                                className={`aspect-square rounded-xl flex items-center justify-center text-2xl transition-all duration-200 cursor-pointer ${avatar === a
                                                    ? 'bg-brand-emerald/20 border-2 border-emerald-500/30 scale-110'
                                                    : 'bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06]'
                                                    }`}
                                            >
                                                {a}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Health Focus</label>
                                    <div className="grid gap-2">
                                        {HEALTH_GOALS.map((g) => (
                                            <button
                                                key={g.value}
                                                onClick={() => setHealthGoal(g.value)}
                                                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left ${healthGoal === g.value
                                                    ? 'border-emerald-500/20 bg-emerald-500/5'
                                                    : 'border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03]'
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${g.color} flex items-center justify-center flex-shrink-0`}>
                                                    <g.icon className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <span className="text-sm font-bold text-white block">{g.label}</span>
                                                    <span className="text-xs text-gray-500">{g.desc}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Body Metrics */}
                    {step === 2 && (
                        <motion.div
                            key="metrics"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="glass p-8"
                        >
                            <h2 className="text-2xl font-black text-white mb-1">Body Profile</h2>
                            <p className="text-sm text-gray-500 mb-6">Help the Alchemist calibrate your elixirs</p>

                            <div className="space-y-5">
                                {/* Gender */}
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Gender</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['male', 'female'] as Gender[]).map((g) => (
                                            <button
                                                key={g}
                                                onClick={() => setGender(g)}
                                                className={`p-3 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer capitalize ${gender === g
                                                    ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
                                                    : 'border-white/[0.05] bg-white/[0.02] text-gray-400 hover:bg-white/[0.04]'
                                                    }`}
                                            >
                                                <User className="w-4 h-4 inline mr-2" />{g}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Age */}
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                        Age <span className="text-emerald-400 normal-case font-mono">{age}</span>
                                    </label>
                                    <input
                                        type="range"
                                        min={10} max={100} value={age}
                                        onChange={(e) => setAge(Number(e.target.value))}
                                        className="w-full accent-emerald-500"
                                    />
                                    <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                                        <span>10</span><span>100</span>
                                    </div>
                                </div>

                                {/* Height */}
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                        <Ruler className="w-3 h-3 inline mr-1" />
                                        Height <span className="text-emerald-400 normal-case font-mono">{heightCm} cm</span>
                                    </label>
                                    <input
                                        type="range"
                                        min={140} max={220} value={heightCm}
                                        onChange={(e) => setHeightCm(Number(e.target.value))}
                                        className="w-full accent-emerald-500"
                                    />
                                    <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                                        <span>140 cm</span><span>220 cm</span>
                                    </div>
                                </div>

                                {/* Weight + Target */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                            <Weight className="w-3 h-3 inline mr-1" />Current
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min={30} max={250} value={weightKg}
                                                onChange={(e) => setWeightKg(Number(e.target.value))}
                                                className="input-field text-center text-lg pr-8"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600">kg</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                            🎯 Target
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min={30} max={250} value={targetWeightKg}
                                                onChange={(e) => setTargetWeightKg(Number(e.target.value))}
                                                className="input-field text-center text-lg pr-8"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600">kg</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Activity Level */}
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                                        <Activity className="w-3 h-3 inline mr-1" />Activity Level
                                    </label>
                                    <div className="space-y-1.5">
                                        {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((level) => (
                                            <button
                                                key={level}
                                                onClick={() => setActivityLevel(level)}
                                                className={`w-full p-3 rounded-xl border text-left text-sm transition-all duration-200 cursor-pointer ${activityLevel === level
                                                    ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
                                                    : 'border-white/[0.04] bg-white/[0.02] text-gray-400 hover:bg-white/[0.04]'
                                                    }`}
                                            >
                                                {ACTIVITY_LABELS[level]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Difficulty */}
                    {step === 3 && (
                        <motion.div
                            key="baseline"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="glass p-8"
                        >
                            <h2 className="text-2xl font-black text-white mb-1">Set Your Path</h2>
                            <p className="text-sm text-gray-500 mb-6">Choose the intensity of your transmutation</p>

                            <div className="grid gap-3">
                                {DIFFICULTIES.map((d) => (
                                    <button
                                        key={d.value}
                                        onClick={() => setDifficulty(d.value)}
                                        className={`p-5 rounded-xl border transition-all duration-200 cursor-pointer text-left ${difficulty === d.value
                                            ? 'border-emerald-500/25 bg-emerald-500/5 glow-emerald'
                                            : 'border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03]'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-base font-bold text-white">{d.label}</h4>
                                            <span className="text-xs font-bold text-brand-gold bg-amber-500/10 px-2 py-1 rounded-lg flex items-center gap-1">
                                                <Zap className="w-3 h-3" /> {d.xpMult} XP
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">{d.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-8">
                    {step > 0 ? (
                        <button onClick={() => setStep(step - 1)} className="btn-ghost text-sm">
                            ← Back
                        </button>
                    ) : <div />}

                    <button
                        onClick={() => (step < TOTAL_STEPS - 1 ? setStep(step + 1) : handleComplete())}
                        disabled={!canProceed}
                        className="btn-primary flex items-center gap-2"
                    >
                        {step < TOTAL_STEPS - 1 ? 'Continue' : 'Begin Transmutation'}
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
