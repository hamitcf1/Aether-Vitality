import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedBackground: React.FC = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#060714] via-[#0a0d1a] to-[#060714]" />

        {/* Floating orbs */}
        <motion.div
            animate={{ x: [0, 60, -30, 0], y: [0, -40, 20, 0], scale: [1, 1.2, 0.9, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)' }}
        />
        <motion.div
            animate={{ x: [0, -50, 40, 0], y: [0, 30, -50, 0], scale: [1, 0.85, 1.15, 1] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute top-[50%] right-[10%] w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)' }}
        />
        <motion.div
            animate={{ x: [0, 30, -60, 0], y: [0, -60, 30, 0] }}
            transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-[5%] left-[30%] w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)' }}
        />

        {/* Grid pattern */}
        <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '60px 60px',
            }}
        />

        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }} />
    </div>
);
