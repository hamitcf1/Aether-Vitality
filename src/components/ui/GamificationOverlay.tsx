import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, ArrowUpCircle } from 'lucide-react';
import { useAetherStore } from '../../store/aetherStore';
import { ACHIEVEMENTS } from '../../lib/achievements';
import { useSound } from '../../lib/SoundManager';

interface XPPopup {
    id: number;
    amount: number;
}

export const GamificationOverlay: React.FC = () => {
    const xp = useAetherStore((s) => s.xp);
    const level = useAetherStore((s) => s.level);
    const mealsLogged = useAetherStore((s) => s.mealsLogged);
    const questsCompleted = useAetherStore((s) => s.questsCompleted);
    const streak = useAetherStore((s) => s.streak);
    const checkAchievements = useAetherStore((s) => s.checkAchievements);

    const prevXP = useRef(xp);
    // Ignore initial mount level so it doesn't pop up on load if we're e.g. level 5
    const [hydratedLevel, setHydratedLevel] = useState(level);
    const prevLevel = useRef(hydratedLevel);

    const [xpPopups, setXpPopups] = useState<XPPopup[]>([]);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [newAchievements, setNewAchievements] = useState<string[]>([]);

    const { play } = useSound();

    useEffect(() => {
        setHydratedLevel(level);
        prevLevel.current = level;
    }, []);

    // Check Achievements globally
    useEffect(() => {
        const unlocked = checkAchievements();
        if (unlocked.length > 0) {
            setNewAchievements(unlocked);
            play('success');
            const timer = setTimeout(() => setNewAchievements([]), 6000);
            return () => clearTimeout(timer);
        }
    }, [mealsLogged, questsCompleted, streak, level, checkAchievements, play]);

    // Track XP changes
    useEffect(() => {
        // Only trigger if xp actually increases, ignoring initial mount 0 -> loaded
        if (prevXP.current > 0 && xp > prevXP.current) {
            const diff = xp - prevXP.current;
            const newPopup = { id: Date.now(), amount: diff };
            setXpPopups((prev) => [...prev, newPopup]);
            setTimeout(() => {
                setXpPopups((prev) => prev.filter((p) => p.id !== newPopup.id));
            }, 2000);
        }
        prevXP.current = xp;
    }, [xp]);

    // Track Level Up
    useEffect(() => {
        if (prevLevel.current > 0 && level > prevLevel.current) {
            setShowLevelUp(true);
            play('levelUp');
            setTimeout(() => {
                setShowLevelUp(false);
            }, 4000);
        }
        prevLevel.current = level;
    }, [level, play]);


    return (
        <div className="pointer-events-none fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden">

            {/* XP Flyouts */}
            <AnimatePresence>
                {xpPopups.map((popup) => (
                    <motion.div
                        key={popup.id}
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: -50, scale: 1 }}
                        exit={{ opacity: 0, y: -100, scale: 0.8 }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        className="fixed bottom-32 right-8 font-black text-2xl text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)] flex items-center gap-2"
                    >
                        <Star className="w-6 h-6" /> +{popup.amount} XP
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Level Up Banner */}
            <AnimatePresence>
                {showLevelUp && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: -50 }}
                        className="absolute top-[30%] flex flex-col items-center justify-center bg-black/80 px-12 py-8 rounded-3xl backdrop-blur-xl border border-amber-500/50 shadow-[0_0_80px_rgba(251,191,36,0.3)]"
                    >
                        <ArrowUpCircle className="w-16 h-16 text-amber-400 mb-4 animate-bounce drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
                        <h2 className="text-5xl font-black text-white tracking-widest uppercase mb-2 drop-shadow-lg">Level Up!</h2>
                        <p className="text-2xl inline-block bg-gradient-to-r from-amber-400 to-emerald-400 bg-clip-text text-transparent font-bold">
                            You are now level {level}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Achievements Toast */}
            <AnimatePresence>
                {newAchievements.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="absolute top-8 left-1/2 -translate-x-1/2 glass border-amber-500/40 px-6 py-4 flex items-center gap-4 shadow-[0_0_30px_rgba(251,191,36,0.2)] bg-black/60 backdrop-blur-md"
                    >
                        <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                            <Trophy className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-white uppercase tracking-wider">Achievement Unlocked</p>
                            <p className="text-xs text-amber-400 font-bold mt-1">
                                {newAchievements.map((id) => ACHIEVEMENTS.find((a) => a.id === id)?.title).join(', ')}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};
