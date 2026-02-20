import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <AnimatePresence>
            {isOffline && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-rose-500/90 backdrop-blur-md text-white overflow-hidden z-50 relative"
                >
                    <div className="px-4 py-1 flex items-center justify-center gap-2 text-xs font-medium">
                        <WifiOff className="w-3 h-3" />
                        <span>You are offline. Changes will sync when connectivity returns.</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
