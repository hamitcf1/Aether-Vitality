import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Star, Zap, Sparkles, ChevronRight } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { STRIPE_PAYMENT_LINK_MONTHLY, STRIPE_PAYMENT_LINK_ANNUAL } from '../../lib/stripe';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

    const handleUpgrade = () => {
        const link = billingCycle === 'monthly' ? STRIPE_PAYMENT_LINK_MONTHLY : STRIPE_PAYMENT_LINK_ANNUAL;
        window.location.href = link;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg overflow-hidden"
                    >
                        <GlassCard className="relative p-0 border-white/10 overflow-hidden" glow="emerald">
                            {/* Header Gradient */}
                            <div className="h-32 bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-transparent relative">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-gray-400 hover:text-white transition-colors z-10"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center">
                                        <Star className="w-8 h-8 text-amber-400 animate-pulse" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 text-center">
                                <h2 className="text-3xl font-black text-white mb-2">Become a Master Alchemist</h2>
                                <p className="text-gray-400 text-sm mb-8">
                                    Unlock the full spectrum of Aetherius Vitality and transmute your potential.
                                </p>

                                {/* Billing Toggle */}
                                <div className="flex items-center justify-center gap-4 mb-8">
                                    <span className={`text-xs font-bold uppercase tracking-widest ${billingCycle === 'monthly' ? 'text-emerald-400' : 'text-gray-500'}`}>
                                        Monthly
                                    </span>
                                    <button
                                        onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annual' : 'monthly')}
                                        className="w-12 h-6 rounded-full bg-white/5 p-1 relative transition-colors hover:bg-white/10 border border-white/10"
                                    >
                                        <motion.div
                                            animate={{ x: billingCycle === 'annual' ? 24 : 0 }}
                                            className="w-4 h-4 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40"
                                        />
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold uppercase tracking-widest ${billingCycle === 'annual' ? 'text-emerald-400' : 'text-gray-500'}`}>
                                            Annual
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black border border-emerald-500/20">
                                            -20%
                                        </span>
                                    </div>
                                </div>

                                {/* Features List */}
                                <div className="grid grid-cols-2 gap-4 text-left mb-8">
                                    {[
                                        { icon: Zap, text: 'Advanced AI Insights' },
                                        { icon: Sparkles, text: 'Unlimited Habits' },
                                        { icon: Check, text: 'Exclusive Transmutations' },
                                        { icon: Check, text: 'Priority Support' },
                                    ].map((f, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <div className="mt-1">
                                                <f.icon className="w-3 h-3 text-emerald-400" />
                                            </div>
                                            <span className="text-[13px] text-gray-300 font-medium">{f.text}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Price Display */}
                                <div className="mb-8">
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-4xl font-black text-white">
                                            {billingCycle === 'monthly' ? '$9.99' : '$7.99'}
                                        </span>
                                        <span className="text-gray-500 text-sm font-bold uppercase tracking-widest">/mo</span>
                                    </div>
                                    {billingCycle === 'annual' && (
                                        <p className="text-[10px] text-emerald-400/60 font-bold uppercase tracking-widest mt-1">
                                            Billed as $95.88 per year
                                        </p>
                                    )}
                                </div>

                                {/* CTA Button */}
                                <button
                                    onClick={handleUpgrade}
                                    className="w-full h-14 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl font-black text-white shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                                >
                                    Ascend Now <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <p className="mt-4 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                                    Secure checkout via Stripe • Cancel anytime
                                </p>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
