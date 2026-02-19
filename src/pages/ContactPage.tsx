import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-6 py-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.03] border border-white/[0.06] p-8 md:p-12 rounded-2xl"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-amber-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Contact Us</h1>
                </div>

                <div className="space-y-6 text-gray-300 leading-relaxed">
                    <p>Have questions about your Aetherius journey? We'd love to hear from you.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                            <div className="flex items-center gap-3 mb-3">
                                <Mail className="w-5 h-5 text-emerald-400" />
                                <h3 className="text-lg font-bold text-white">Email Support</h3>
                            </div>
                            <p className="text-sm text-gray-400 mb-3">For general inquiries and support</p>
                            <a href="mailto:support@aetherius.com" className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                                support@aetherius.com
                            </a>
                        </div>

                        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                            <div className="flex items-center gap-3 mb-3">
                                <MessageCircle className="w-5 h-5 text-cyan-400" />
                                <h3 className="text-lg font-bold text-white">Feedback</h3>
                            </div>
                            <p className="text-sm text-gray-400 mb-3">Help us improve the experience</p>
                            <a href="mailto:feedback@aetherius.com" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                                feedback@aetherius.com
                            </a>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
