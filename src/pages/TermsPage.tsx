import React from 'react';
import { motion } from 'framer-motion';
import { ScrollText } from 'lucide-react';

export const TermsPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-6 py-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.03] border border-white/[0.06] p-8 md:p-12 rounded-2xl"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                        <ScrollText className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
                </div>

                <div className="space-y-6 text-gray-300 leading-relaxed">
                    <p>Welcome to Aetherius Vitality.</p>

                    <h2 className="text-xl font-bold text-white mt-8">1. Acceptance of Terms</h2>
                    <p>By accessing or using Aetherius Vitality, you agree to be bound by these terms.</p>

                    <h2 className="text-xl font-bold text-white mt-8">2. Gamification Disclaimer</h2>
                    <p>This is a game-like interface for health tracking. It is not a substitute for professional medical advice. Always consult a physician before starting any new diet or exercise program.</p>

                    <h2 className="text-xl font-bold text-white mt-8">3. User Accounts</h2>
                    <p>You are responsible for maintaining the security of your account credentials. All activities under your account are your responsibility.</p>

                    <h2 className="text-xl font-bold text-white mt-8">4. Subscription & Billing</h2>
                    <p>Free tier users have access to basic features. Paid subscriptions unlock additional features and can be cancelled at any time.</p>

                    <h2 className="text-xl font-bold text-white mt-8">5. Intellectual Property</h2>
                    <p>All content, features, and functionality of Aetherius Vitality are owned by us and are protected by copyright and trademark laws.</p>
                </div>
            </motion.div>
        </div>
    );
};
