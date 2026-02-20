import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';

export const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setIsVisible(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-8 md:w-96"
                >
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                <Download className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-white font-bold text-sm">Install App</h3>
                                <p className="text-gray-400 text-xs">Add to home screen for better experience</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleDismiss}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                aria-label="Dismiss"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                            <button
                                onClick={handleInstall}
                                className="px-4 py-2 bg-emerald-500 rounded-lg text-white text-xs font-bold hover:bg-emerald-400 transition-colors"
                            >
                                Install
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
