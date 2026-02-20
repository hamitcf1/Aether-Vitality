import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface MiniTrackerProps {
    icon: LucideIcon;
    emoji?: string;
    label: string;
    value: string | number;
    subLabel?: string;
    progress: number; // 0-100
    color: string;
    link?: string;
}

export const MiniTracker: React.FC<MiniTrackerProps> = ({
    icon: Icon,
    emoji,
    label,
    value,
    subLabel,
    progress,
    color,
    link = '/trackers',
}) => {
    const navigate = useNavigate();

    const descriptions: Record<string, string> = {
        'Water': 'Track your hydration fragments. 1 glass (250ml) adds to your Aether Integrity.',
        'Steps': 'Motion is the catalyst for conversion. Reach your daily step target to optimize flow.',
        'Calories': 'The fuel of your transmutation. Log sustenance to balance your internal energy.',
        'Sugar': 'A volatile impurity. Keep sugar intake low to prevent metabolic disruption.'
    };

    const trackerContent = (
        <motion.button
            layoutId={`tracker-card-${label.toLowerCase()}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(link, { state: { tab: label.toLowerCase() } })}
            className="glass-subtle p-3 flex items-center gap-3 w-full text-left cursor-pointer group transition-all duration-200 hover:bg-white/[0.04]"
        >
            <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}15`, border: `1px solid ${color}25` }}
            >
                {emoji ? <span className="text-lg">{emoji}</span> : <Icon className="w-5 h-5" style={{ color }} />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between">
                    <span className="text-xs text-gray-500 font-medium">{label}</span>
                    <span className="text-sm font-bold text-white">{value}</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                    <motion.div
                        className="h-full rounded-full"
                        style={{ background: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                </div>
                {subLabel && <span className="text-[9px] text-gray-600 mt-0.5 block">{subLabel}</span>}
            </div>
        </motion.button>
    );

    return descriptions[label] ? (
        <Tooltip content={descriptions[label]}>
            {trackerContent}
        </Tooltip>
    ) : trackerContent;
};
