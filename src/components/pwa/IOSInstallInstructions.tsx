import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share, PlusSquare, X } from 'lucide-react';

export const IOSInstallInstructions: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Detect iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        // Detect if already installed (standalone mode)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

        // Show only if iOS and NOT standalone
        if (isIOS && !isStandalone) {
            // Check session storage to not annoy user every refresh
            const hasSeen = sessionStorage.getItem('ios_install_prompt_seen');
            if (!hasSeen) {
                // Delay slightly to not bombard immediately
                const timer = setTimeout(() => setIsVisible(true), 3000);
                return () => clearTimeout(timer);
            }
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem('ios_install_prompt_seen', 'true');
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: '100%' }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: '100%' }}
                    className="fixed bottom-0 left-0 right-0 z-[60] p-4 bg-black/80 backdrop-blur-xl border-t border-white/10 rounded-t-2xl shadow-2xl"
                >
                    <div className="max-w-md mx-auto relative">
                        <button
                            onClick={handleDismiss}
                            className="absolute top-0 right-0 p-2 text-gray-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-white font-bold text-lg mb-2">Install Aetherius Vitality</h3>
                        <p className="text-gray-300 text-sm mb-4">
                            Install this app on your iPhone for the best experience.
                        </p>

                        <div className="space-y-3 text-sm text-gray-300">
                            <div className="flex items-center gap-3">
                                <Share className="w-5 h-5 text-blue-400" />
                                <span>1. Tap the <strong>Share</strong> button in Safari</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <PlusSquare className="w-5 h-5 text-gray-400" />
                                <span>2. Scroll down and tap <strong>Add to Home Screen</strong></span>
                            </div>
                        </div>

                        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-6" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
