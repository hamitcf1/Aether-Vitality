import React from 'react';
import { cn } from '../../lib/cn';
import type { LucideIcon } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    subLabel?: string;
    color: 'emerald' | 'cyan' | 'gold' | 'purple' | 'rose';
    children?: React.ReactNode;
}

const colors = {
    emerald: { icon: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/15' },
    cyan: { icon: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/15' },
    gold: { icon: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/15' },
    purple: { icon: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/15' },
    rose: { icon: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/15' },
};

export const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, subLabel, color, children }) => {
    const c = colors[color];
    return (
        <GlassCard className={cn('relative overflow-hidden', c.border)}>
            <div className="flex items-start justify-between mb-3">
                <div className={cn('p-2.5 rounded-xl', c.bg)}>
                    <Icon className={cn('w-5 h-5', c.icon)} />
                </div>
                {subLabel && (
                    <span className="text-xs font-medium text-gray-500 bg-white/[0.03] px-2 py-1 rounded-lg">{subLabel}</span>
                )}
            </div>
            <div className="text-3xl font-black text-white tracking-tight">{value}</div>
            <div className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wider">{label}</div>
            {children && <div className="mt-4">{children}</div>}
            {/* Subtle background glow */}
            <div className={cn('absolute -top-8 -right-8 w-24 h-24 rounded-full blur-3xl opacity-20', c.bg)} />
        </GlassCard>
    );
};
