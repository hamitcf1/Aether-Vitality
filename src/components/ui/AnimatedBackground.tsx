import React from 'react';

// CSS-only animated background — zero JS overhead per frame
const orbStyle = `
@keyframes orb1 {
  0%   { transform: translate(0, 0) scale(1); }
  25%  { transform: translate(60px, -40px) scale(1.2); }
  50%  { transform: translate(-30px, 20px) scale(0.9); }
  100% { transform: translate(0, 0) scale(1); }
}
@keyframes orb2 {
  0%   { transform: translate(0, 0) scale(1); }
  25%  { transform: translate(-50px, 30px) scale(0.85); }
  50%  { transform: translate(40px, -50px) scale(1.15); }
  100% { transform: translate(0, 0) scale(1); }
}
@keyframes orb3 {
  0%   { transform: translate(0, 0); }
  25%  { transform: translate(30px, -60px); }
  50%  { transform: translate(-60px, 30px); }
  100% { transform: translate(0, 0); }
}
`;

export const AnimatedBackground: React.FC = React.memo(() => (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <style>{orbStyle}</style>
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#060714] via-[#0a0d1a] to-[#060714]" />

        {/* Floating orbs — pure CSS animations, GPU-composited */}
        <div
            className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full will-change-transform"
            style={{
                background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
                animation: 'orb1 25s linear infinite',
            }}
        />
        <div
            className="absolute top-[50%] right-[10%] w-[600px] h-[600px] rounded-full will-change-transform"
            style={{
                background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)',
                animation: 'orb2 30s linear infinite',
            }}
        />
        <div
            className="absolute bottom-[5%] left-[30%] w-[400px] h-[400px] rounded-full will-change-transform"
            style={{
                background: 'radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)',
                animation: 'orb3 35s linear infinite',
            }}
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
));
