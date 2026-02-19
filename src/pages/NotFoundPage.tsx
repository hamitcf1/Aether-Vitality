import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ghost, Home, ArrowLeft } from 'lucide-react';
import { AnimatedBackground } from '../components/ui/AnimatedBackground';

export const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-6">
            <AnimatedBackground />

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 text-center max-w-md w-full"
            >
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shadow-glow animate-float">
                    <Ghost className="w-12 h-12 text-gray-400" />
                </div>

                <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-600 mb-2">
                    404
                </h1>
                <h2 className="text-2xl font-bold text-white mb-4">Lost in the Void</h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                    The path you seek has not been forged in this realm. Return to the sanctuary before your mana depletes.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Sanctuary
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
