import React from 'react';
import { cn } from '../../lib/cn';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    hover?: boolean;
    glow?: 'emerald' | 'cyan' | 'gold' | 'purple' | 'none';
    padding?: 'sm' | 'md' | 'lg';
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children, hover = true, glow = 'none', padding = 'md', className, ...props
}) => (
    <div
        className={cn(
            hover ? 'glass-hover' : 'glass',
            padding === 'sm' && 'p-4',
            padding === 'md' && 'p-6',
            padding === 'lg' && 'p-8',
            glow === 'emerald' && 'border-emerald-500/15 glow-emerald',
            glow === 'cyan' && 'border-cyan-500/15 glow-cyan',
            glow === 'gold' && 'border-amber-500/15 glow-gold',
            glow === 'purple' && 'border-violet-500/15 glow-purple',
            className
        )}
        {...props}
    >
        {children}
    </div>
);
