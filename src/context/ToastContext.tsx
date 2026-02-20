/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    addToast: (message: string, type?: ToastType) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto dismiss
        setTimeout(() => {
            removeToast(id);
        }, 4000);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            layout
                            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md min-w-[300px] max-w-sm
                ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-100' :
                                    toast.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-100' :
                                        'bg-blue-500/10 border-blue-500/20 text-blue-100'}`}
                        >
                            <div className={`p-1 rounded-full ${toast.type === 'success' ? 'bg-emerald-500/20' : toast.type === 'error' ? 'bg-rose-500/20' : 'bg-blue-500/20'}`}>
                                {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                                {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
                                {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
                            </div>
                            <p className="text-sm font-medium flex-1">{toast.message}</p>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4 opacity-50 hover:opacity-100" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
