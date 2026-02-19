import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';
import { ACHIEVEMENTS } from '../../lib/achievements';

interface BadgeProps {
    achievementId: string;
    unlocked: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ achievementId, unlocked }) => {
    const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!achievement) return null;

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300',
                unlocked
                    ? 'glass border-emerald-500/20 glow-emerald'
                    : 'bg-white/[0.01] border-white/[0.04] opacity-40 grayscale'
            )}
        >
            <span className="text-2xl">{achievement.icon}</span>
            <span className="text-xs font-bold text-white text-center leading-tight">{achievement.title}</span>
            <span className="text-[10px] text-gray-500 text-center">{achievement.description}</span>
        </motion.div>
    );
};
