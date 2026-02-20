import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { Sparkles, X, ChevronRight } from 'lucide-react';

interface TutorialStep {
    title: string;
    content: string;
    icon?: React.ReactNode;
}

interface TutorialModalProps {
    isOpen: boolean;
    onClose: () => void;
    steps: TutorialStep[];
    pageTitle: string;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose, steps, pageTitle }) => {
    const [currentStep, setCurrentStep] = React.useState(0);

    if (!isOpen) return null;

    const step = steps[currentStep];
    const isLast = currentStep === steps.length - 1;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <GlassCard glow="emerald" className="relative p-8">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">New Location Discovered</p>
                                    <h2 className="text-xl font-black text-white">{pageTitle}</h2>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-2"
                                >
                                    {step.icon && (
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mb-2">
                                            {step.icon}
                                        </div>
                                    )}
                                    <h3 className="text-lg font-bold text-white tracking-tight">{step.title}</h3>
                                    <p className="text-sm text-gray-400 leading-relaxed font-medium">
                                        {step.content}
                                    </p>
                                </motion.div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex gap-1.5">
                                    {steps.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-1 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6 bg-emerald-500' : 'w-2 bg-white/10'}`}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={() => isLast ? onClose() : setCurrentStep(s => s + 1)}
                                    className="btn-primary group flex items-center gap-2"
                                >
                                    {isLast ? 'Enter Location' : 'Next'}
                                    <ChevronRight className={`w-4 h-4 transition-transform ${isLast ? '' : 'group-hover:translate-x-1'}`} />
                                </button>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
