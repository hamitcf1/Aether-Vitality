import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAetherStore } from '../../store/aetherStore';

export const ExpPopups: React.FC = () => {
    const { expPopups, clearExpPopup } = useAetherStore();

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            <AnimatePresence>
                {expPopups.map((popup: any) => (
                    <motion.div
                        key={popup.id}
                        initial={{ opacity: 0, y: popup.y, x: popup.x, scale: 0.5 }}
                        animate={{ opacity: 1, y: popup.y - 100, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.5 }}
                        onAnimationComplete={() => clearExpPopup(popup.id)}
                        className="absolute text-emerald-400 font-black text-xl flex items-center gap-1 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    >
                        +{popup.amount} <span className="text-xs uppercase tracking-tighter">XP</span>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
