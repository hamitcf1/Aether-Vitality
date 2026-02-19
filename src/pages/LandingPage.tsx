import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Shield, Brain, ChevronRight, Star, Activity, Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatedBackground } from '../components/ui/AnimatedBackground';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const onLogin = () => navigate('/login');
    const onRegister = () => navigate('/register');

    return (
        <div className="min-h-screen relative overflow-x-hidden selection:bg-emerald-500/30">
            <AnimatedBackground />

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-glow-sm">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-white tracking-tight">Aether Vitality</span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={onLogin}
                        className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                    >
                        Login
                    </button>
                    <button
                        onClick={onRegister}
                        className="btn-primary px-5 py-2 text-sm rounded-full"
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-emerald-400 mb-6"
                >
                    <Star className="w-3 h-3 fill-current" />
                    <span>The #1 Gamified Health Platform</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 mb-6 tracking-tight leading-tight"
                >
                    Level Up Your <br />
                    <span className="gradient-text">Biological Engine</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed"
                >
                    Transform your health journey into an epic RPG. Track macros with AI, complete quests, and unlock your ultimate potential.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center gap-4"
                >
                    <button
                        onClick={onRegister}
                        className="btn-primary px-8 py-4 text-lg rounded-full flex items-center gap-2 group w-full sm:w-auto justify-center shadow-glow"
                    >
                        Start Your Journey <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        className="px-8 py-4 text-lg rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all w-full sm:w-auto"
                    >
                        View Demo
                    </button>
                </motion.div>

                {/* Dashboard Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="mt-20 relative w-full max-w-5xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                    <div className="glass p-2 rounded-2xl border border-white/10 shadow-2xl shadow-emerald-500/10 rotate-x-12 transform-gpu perspective-1000">
                        <img
                            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop"
                            alt="Dashboard Preview"
                            className="w-full h-auto rounded-xl opacity-80"
                        />
                        {/* Overlay UI Mockups */}
                        <div className="absolute top-10 left-10 p-4 glass rounded-xl flex items-center gap-4 animate-float">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-400 uppercase">Daily HP</div>
                                <div className="text-xl font-bold text-white">98/100</div>
                            </div>
                        </div>

                        <div className="absolute bottom-20 right-10 p-4 glass rounded-xl flex items-center gap-4 animate-float-delayed">
                            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                                <Utensils className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-400 uppercase">AI Analysis</div>
                                <div className="text-sm font-bold text-white">Salmon & Quinoa</div>
                                <div className="text-xs text-emerald-400">+15 HP Recovers</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Features Grid */}
            <section className="py-32 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Built for the <span className="gradient-text">Modern Alchemist</span></h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">Everything you need to optimize your biology, wrapped in a game-like experience.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={Brain}
                        title="AI Food Analysis"
                        desc="Snap a photo or type a meal. Our AI breaks down macros, calculates health scores, and saves it to your personal database."
                        color="text-cyan-400"
                        delay={0.1}
                    />
                    <FeatureCard
                        icon={Zap}
                        title="Gamified Progress"
                        desc="Earn XP, unlock achievements, and level up as you build healthy habits. Your body is your character."
                        color="text-amber-400"
                        delay={0.2}
                    />
                    <FeatureCard
                        icon={Shield}
                        title="Comprehensive Tracking"
                        desc="Monitor water, sleep, meditation, and more. Visualize your trends and optimize your daily routine."
                        color="text-emerald-400"
                        delay={0.3}
                    />
                </div>
            </section>

            {/* Social Proof / Trust */}
            <section className="py-20 border-t border-white/5 bg-black/20">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="flex justify-center items-center gap-1 mb-6">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />)}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-10">"The only health app that I actually want to open every day."</h3>

                    <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Logos could go here, using placeholders for now */}
                        <div className="text-xl font-black text-white tracking-widest">FITNESS+</div>
                        <div className="text-xl font-black text-white tracking-widest">TECHHEALTH</div>
                        <div className="text-xl font-black text-white tracking-widest">BIOHACKER</div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-32 px-6 text-center">
                <div className="max-w-4xl mx-auto glass p-12 rounded-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 relative z-10">Ready to Ascend?</h2>
                    <p className="text-xl text-gray-400 mb-10 relative z-10 max-w-xl mx-auto">Join thousands of others transforming their health into a legendary journey.</p>

                    <div className="relative z-10">
                        <button
                            onClick={onRegister}
                            className="btn-primary px-10 py-4 text-lg rounded-full inline-flex items-center gap-2 shadow-glow"
                        >
                            Create Free Account
                        </button>
                        <p className="mt-4 text-xs text-gray-500">No credit card required. Cancel anytime.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                        </div>
                        <span className="text-sm font-bold text-gray-400">Aether Vitality</span>
                    </div>
                    <div className="flex gap-6 text-sm text-gray-500">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                    </div>
                    <div className="text-xs text-gray-600">
                        © 2024 Aether Vitality. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard: React.FC<{ icon: any, title: string, desc: string, color: string, delay: number }> = ({ icon: Icon, title, desc, color, delay }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className="glass p-8 rounded-2xl hover:bg-white/5 transition-colors group"
        >
            <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{desc}</p>
        </motion.div>
    );
}
