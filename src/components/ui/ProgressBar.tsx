import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

interface ProgressBarProps {
    value: number;
    max?: number;
    variant?: 'emerald' | 'cyan' | 'gold' | 'purple' | 'rose';
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    label?: string;
    animated?: boolean;
}

const gradients = {
    emerald: 'from-emerald-500 to-emerald-400',
    cyan: 'from-cyan-500 to-blue-400',
    gold: 'from-amber-500 to-yellow-400',
    purple: 'from-violet-500 to-purple-400',
    rose: 'from-rose-500 to-pink-400',
};

const glows = {
    emerald: '0 0 12px rgba(16,185,129,0.4)',
    cyan: '0 0 12px rgba(6,182,212,0.4)',
    gold: '0 0 12px rgba(245,158,11,0.4)',
    purple: '0 0 12px rgba(139,92,246,0.4)',
    rose: '0 0 12px rgba(244,63,94,0.4)',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
    value, max = 100, variant = 'emerald', size = 'md', showLabel, label, animated = true,
}) => {
    const percent = Math.min((value / max) * 100, 100);

    return (
        <div className="space-y-2">
            {(showLabel || label) && (
                <div className="flex justify-between items-center">
                    {label && <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</span>}
                    {showLabel && <span className="text-sm font-bold text-white">{Math.round(value)}/{max}</span>}
                </div>
            )}
            <div className={cn(
                'w-full bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.04]',
                size === 'sm' && 'h-1.5',
                size === 'md' && 'h-2.5',
                size === 'lg' && 'h-4',
            )}>
                <motion.div
                    initial={animated ? { width: 0 } : undefined}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={cn('h-full rounded-full bg-gradient-to-r', gradients[variant])}
                    style={{ boxShadow: glows[variant] }}
                />
            </div>
        </div>
    );
};
