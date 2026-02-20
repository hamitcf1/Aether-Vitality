import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CircularProgress } from './CircularProgress';

interface CountdownTimerProps {
    startTime: number | null;
    plan: '16:8' | '18:6' | '20:4' | '14:10';
    active: boolean;
    onEnd: () => void;
    className?: string;
}

const PLAN_HOURS: Record<string, number> = { '16:8': 16, '18:6': 18, '20:4': 20, '14:10': 14 };

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ startTime, plan, active, onEnd, className = '' }) => {
    const targetHours = PLAN_HOURS[plan] || 16;
    const targetMs = targetHours * 3600000;

    const calcRemaining = useCallback(() => {
        if (!active || !startTime) return targetMs;
        const elapsed = Date.now() - startTime;
        return Math.max(0, targetMs - elapsed);
    }, [active, startTime, targetMs]);

    const [remaining, setRemaining] = useState(calcRemaining);

    useEffect(() => {
        if (!active) {
            setTimeout(() => setRemaining(targetMs), 0);
            return;
        }
        const interval = setInterval(() => {
            const r = calcRemaining();
            setRemaining(r);
            if (r <= 0) {
                clearInterval(interval);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [active, calcRemaining, targetMs]);

    const [elapsed, setElapsed] = useState(0);

    // Calculate elapsed safely within an effect hook
    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (active && startTime) {
            timer = setInterval(() => {
                setElapsed(Date.now() - startTime);
            }, 1000);
            setTimeout(() => setElapsed(Date.now() - startTime), 0); // Initial catch-up
        } else {
            setTimeout(() => setElapsed(0), 0);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [active, startTime]);

    const progress = Math.min(100, (elapsed / targetMs) * 100);

    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    const isComplete = remaining <= 0 && active;

    return (
        <div className={`flex flex-col items-center ${className}`}>
            <CircularProgress
                value={progress}
                size={180}
                strokeWidth={10}
                color={isComplete ? '#10b981' : active ? '#f59e0b' : '#525252'}
                label={active ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}` : '--:--'}
                sublabel={active ? `${seconds}s remaining` : `${plan} plan`}
                icon={<span className="text-xl">{isComplete ? '✅' : active ? '⏳' : '🍽️'}</span>}
            />
            <div className="mt-4">
                {active ? (
                    <div className="flex flex-col items-center gap-2">
                        {isComplete ? (
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={onEnd}
                                className="btn-primary px-6"
                            >
                                ✅ Complete Fast
                            </motion.button>
                        ) : (
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={onEnd}
                                className="px-6 py-3 bg-rose-500/20 text-rose-400 font-bold rounded-xl border border-rose-500/20 hover:bg-rose-500/30 transition-colors cursor-pointer"
                            >
                                End Fast Early
                            </motion.button>
                        )}
                        <p className="text-xs text-gray-600">
                            Fasting for {targetHours}h (eating window: {24 - targetHours}h)
                        </p>
                    </div>
                ) : (
                    <p className="text-xs text-gray-600 text-center">
                        Start a fast to begin the countdown timer
                    </p>
                )}
            </div>
        </div>
    );
};
