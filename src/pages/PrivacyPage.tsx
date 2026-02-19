import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-6 py-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.03] border border-white/[0.06] p-8 md:p-12 rounded-2xl"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
                </div>

                <div className="space-y-6 text-gray-300 leading-relaxed">
                    <p className="text-gray-500">Last updated: February 2026</p>
                    <p>At Aetherius Vitality, we take your privacy seriously. Your health data is your own.</p>

                    <h2 className="text-xl font-bold text-white mt-8">1. Data Collection</h2>
                    <p>We collect only the data necessary to provide our gamified health services, including but not limited to usage data, health metrics you input, and device information.</p>

                    <h2 className="text-xl font-bold text-white mt-8">2. Data Usage</h2>
                    <p>Your data is used solely to generate your gameplay statistics, health insights, and to improve the Aetherius experience.</p>

                    <h2 className="text-xl font-bold text-white mt-8">3. Data Security</h2>
                    <p>All data is encrypted in transit and at rest. We use industry-standard security measures including Firebase Authentication and Firestore security rules to protect your information.</p>

                    <h2 className="text-xl font-bold text-white mt-8">4. Third-Party Services</h2>
                    <p>We use Google Firebase for authentication and data storage, and Google's Gemini AI for food analysis. These services have their own privacy policies.</p>

                    <h2 className="text-xl font-bold text-white mt-8">5. Your Rights</h2>
                    <p>You can request deletion of your data at any time by contacting us. You have full control over the data you input into the application.</p>
                </div>
            </motion.div>
        </div>
    );
};
