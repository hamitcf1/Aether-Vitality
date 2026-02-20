import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wind, Play, Square, Clock, Settings2 } from 'lucide-react';
import { PageTransition } from '../components/layout/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { useJournalStore } from '../store/journalStore';

type BreathingPreset = 'calm' | 'awake' | 'box';
type Phase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

const PRESETS: Record<BreathingPreset, { name: string; inhale: number; hold1: number; exhale: number; hold2: number }> = {
    calm: { name: 'Calm (4-7-8)', inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
    awake: { name: 'Awake (6-0-2)', inhale: 6, hold1: 0, exhale: 2, hold2: 0 },
    box: { name: 'Box (4-4-4-4)', inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
};

export const MeditationPage: React.FC = () => {
    const store = useJournalStore();
    const [isActive, setIsActive] = useState(false);
    const [duration, setDuration] = useState(60); // seconds
    const [timeLeft, setTimeLeft] = useState(60);
    const [preset, setPreset] = useState<BreathingPreset>('calm');
    const [phase, setPhase] = useState<Phase>('inhale');

    // Timer logic - Countdown
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive]);

    // Timer logic - Completion
    useEffect(() => {
        if (isActive && timeLeft === 0) {
            setTimeout(() => setIsActive(false), 0);
            store.logMeditation({
                date: new Date().toISOString(),
                durationSeconds: duration,
                type: 'breathing',
            });
        }
    }, [isActive, timeLeft, duration, store]);

    // Breathing animation phase logic
    useEffect(() => {
        if (!isActive) return;
        let active = true;

        const p = PRESETS[preset];
        const cycle = (p.inhale + p.hold1 + p.exhale + p.hold2) * 1000;

        let t1: NodeJS.Timeout, t2: NodeJS.Timeout, t3: NodeJS.Timeout;

        const runCycle = () => {
            if (!active) return;
            setPhase('inhale');

            let nextTime = p.inhale * 1000;
            if (p.hold1 > 0) {
                t1 = setTimeout(() => { if (active) setPhase('hold1') }, nextTime);
                nextTime += p.hold1 * 1000;
            }

            t2 = setTimeout(() => { if (active) setPhase('exhale') }, nextTime);
            nextTime += p.exhale * 1000;

            if (p.hold2 > 0) {
                t3 = setTimeout(() => { if (active) setPhase('hold2') }, nextTime);
            }
        };

        const loop = setInterval(runCycle, cycle);
        runCycle();

        return () => {
            active = false;
            clearInterval(loop);
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [isActive, preset]);

    const handleStart = () => {
        setTimeLeft(duration);
        setIsActive(true);
    };

    const handleStop = () => {
        setIsActive(false);
        setTimeLeft(duration);
    };

    const getPhaseText = () => {
        switch (phase) {
            case 'inhale': return 'Inhale...';
            case 'hold1': return 'Hold...';
            case 'exhale': return 'Exhale...';
            case 'hold2': return 'Hold...';
        }
    };

    const getCircleScale = () => {
        switch (phase) {
            case 'inhale': return 1.5;
            case 'hold1': return 1.5;
            case 'exhale': return 1;
            case 'hold2': return 1;
        }
    };

    const getPhaseDuration = () => {
        const p = PRESETS[preset];
        switch (phase) {
            case 'inhale': return p.inhale;
            case 'hold1': return p.hold1;
            case 'exhale': return p.exhale;
            case 'hold2': return p.hold2;
        }
    };

    return (
        <PageTransition className="space-y-6">
            <div>
                <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                    <Wind className="w-8 h-8 text-sky-400" /> Meditation
                </h1>
                <p className="text-sm text-gray-500 mt-1">Center your mind, Seeker.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard className="flex flex-col items-center justify-center min-h-[400px]" glow={isActive ? 'cyan' : undefined}>
                    <div className="relative flex items-center justify-center">
                        {/* Breathing Circle */}
                        <motion.div
                            animate={{
                                scale: isActive ? getCircleScale() : 1,
                                opacity: isActive ? 0.8 : 0.3,
                            }}
                            transition={{
                                duration: getPhaseDuration(),
                                ease: 'easeInOut'
                            }}
                            className="w-48 h-48 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 blur-2xl absolute"
                        />
                        <motion.div
                            animate={{
                                scale: isActive ? getCircleScale() : 1,
                            }}
                            transition={{
                                duration: getPhaseDuration(),
                                ease: 'easeInOut'
                            }}
                            className="w-40 h-40 rounded-full border-2 border-sky-200/50 flex items-center justify-center z-10 backdrop-blur-sm"
                        >
                            <p className="text-xl font-bold text-white tracking-widest uppercase">
                                {isActive ? getPhaseText() : 'Ready'}
                            </p>
                        </motion.div>
                    </div>

                    <div className="mt-12 flex gap-4">
                        {!isActive ? (
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleStart}
                                className="btn-primary px-8 py-3 flex items-center gap-2"
                            >
                                <Play className="w-5 h-5" /> Start
                            </motion.button>
                        ) : (
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleStop}
                                className="btn-secondary px-8 py-3 flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20"
                            >
                                <Square className="w-5 h-5 fill-current" /> Stop
                            </motion.button>
                        )}
                    </div>
                </GlassCard>

                <div className="space-y-4">
                    <GlassCard>
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-sky-400" /> Settings
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 mb-2 block flex items-center gap-1">
                                    <Settings2 className="w-3 h-3" /> Technique
                                </label>
                                <div className="grid grid-cols-1 gap-2 mb-4">
                                    {(Object.keys(PRESETS) as BreathingPreset[]).map((pKey) => (
                                        <button
                                            key={pKey}
                                            onClick={() => { setPreset(pKey); setIsActive(false); }}
                                            className={`p-2 rounded-lg text-sm font-medium transition-all text-left ${preset === pKey
                                                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            {PRESETS[pKey].name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 mb-2 block">Duration</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[60, 180, 300].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => { setDuration(s); setTimeLeft(s); setIsActive(false); }}
                                            className={`p-2 rounded-lg text-sm font-medium transition-all ${duration === s
                                                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            {s / 60} min
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">Time Remaining</span>
                                    <span className="font-mono text-xl font-bold text-white">
                                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <h3 className="text-sm font-bold text-white mb-3">Stats</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="glass-subtle p-3 rounded-xl text-center">
                                <p className="text-2xl font-black text-white">{store.meditationHistory.length}</p>
                                <p className="text-[10px] text-gray-500 uppercase">Sessions</p>
                            </div>
                            <div className="glass-subtle p-3 rounded-xl text-center">
                                <p className="text-2xl font-black text-white">{store.getTotalMeditationMinutes()}m</p>
                                <p className="text-[10px] text-gray-500 uppercase">Total Time</p>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </PageTransition>
    );
};
