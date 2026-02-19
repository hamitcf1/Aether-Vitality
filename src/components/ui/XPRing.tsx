import React from 'react';
import { motion } from 'framer-motion';

interface XPRingProps {
    progress: number; // 0-100
    size?: number;
    strokeWidth?: number;
    level: number;
}

export const XPRing: React.FC<XPRingProps> = ({ progress, size = 120, strokeWidth = 6, level }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                {/* Background ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth={strokeWidth}
                />
                {/* Progress ring */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="url(#xpGradient)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    style={{ filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.4))' }}
                />
                <defs>
                    <linearGradient id="xpGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-white">{level}</span>
                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">Level</span>
            </div>
        </div>
    );
};
