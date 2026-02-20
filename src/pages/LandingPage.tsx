import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    Brain,
    Trophy,
    Users,
    Target,
    Sparkles,
    Dna,
    ArrowRight,
    ChevronRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [currentWordIndex, setCurrentWordIndex] = useState(0);

    const words = ['Vitality', 'Focus', 'Energy', 'Strength', 'Balance'];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }, 2500);
        return () => clearInterval(interval);
    }, [words.length]);

    // Generate random bar heights once on initial mount
    const [barHeights] = useState(() => [1, 2, 3, 4, 5].map(() => Math.random() * 60 + 40));

    const features = [
        {
            icon: <Target className="w-6 h-6 text-emerald-400" />,
            title: "Smart Goal Tracking",
            desc: "AI-powered objectives that adapt to your progress and energy levels."
        },
        {
            icon: <Brain className="w-6 h-6 text-purple-400" />,
            title: "Mental Clarity",
            desc: "Meditation and journaling tools designed to enhance cognitive function."
        },
        {
            icon: <Activity className="w-6 h-6 text-rose-400" />,
            title: "Bio-Metric Analytics",
            desc: "Deep insights into your health data with predictive analysis."
        },
        {
            icon: <Dna className="w-6 h-6 text-cyan-400" />,
            title: "Genetic Potential",
            desc: "Unlock your latent capabilities through optimized habits."
        },
        {
            icon: <Users className="w-6 h-6 text-amber-400" />,
            title: "Community Guilds",
            desc: "Join forces with other alchemists on the same path."
        },
        {
            icon: <Trophy className="w-6 h-6 text-indigo-400" />,
            title: "Gamified Growth",
            desc: "Earn XP and ascend through ranks as you improve your life."
        }
    ];

    return (
        <div className="text-white">
            {/* Hero Section */}
            <section className="relative pt-16 pb-20 px-6 max-w-7xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm"
                >
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-200">The Alchemist's Path v2.0 is Live</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight mb-8 leading-tight"
                >
                    Master Your <br />
                    <span className="relative inline-block" style={{ minHeight: '1.15em' }}>
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={words[currentWordIndex]}
                                initial={{ y: 40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -40, opacity: 0 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400"
                            >
                                {words[currentWordIndex]}
                            </motion.span>
                        </AnimatePresence>
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
                >
                    Aetherius Vitality combines ancient wisdom with cutting-edge AI to help you transmute your potential into reality.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <button
                        onClick={() => navigate('/register')}
                        className="h-14 px-8 text-lg bg-emerald-500 hover:bg-emerald-600 text-white rounded-full w-full sm:w-auto shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 font-semibold flex items-center justify-center gap-2"
                    >
                        Start Your Journey <ArrowRight className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="h-14 px-8 text-lg rounded-full w-full sm:w-auto hover:bg-white/5 border border-white/10 font-medium transition-all"
                    >
                        Sign In
                    </button>
                </motion.div>
            </section>

            {/* Floating Decorative Cards */}
            <div className="relative max-w-7xl mx-auto px-6 hidden lg:block" style={{ height: '120px' }}>
                <div className="absolute left-0 top-0 w-64 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm animate-float">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <div className="text-xs text-gray-400">Recovery Score</div>
                            <div className="text-lg font-bold text-white">98%</div>
                        </div>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[98%] rounded-full" />
                    </div>
                </div>

                <div className="absolute right-0 top-0 w-64 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm animate-float-delayed">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <Brain className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <div className="text-xs text-gray-400">Focus Streak</div>
                            <div className="text-lg font-bold text-white">12 Days</div>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        {barHeights.map((height, i) => (
                            <div key={i} className="h-8 w-full bg-purple-500/20 rounded-sm flex items-end justify-center pb-1">
                                <div className="w-1 bg-purple-400 rounded-full" style={{ height: `${height}%` }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>


            {/* Features Grid */}
            <section className="py-24 max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Transmute Your Life</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Comprehensive tools to master every aspect of your existence.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: idx * 0.08, duration: 0.4 }}
                            className="p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all duration-300 group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                            <p className="text-gray-500 leading-relaxed text-sm">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Pricing Teaser */}
            <section className="py-20 max-w-4xl mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
                <p className="text-gray-400 mb-10 max-w-xl mx-auto">
                    Start free. Upgrade when you're ready to unlock your full potential.
                </p>
                <Link
                    to="/pricing"
                    className="inline-flex items-center gap-2 h-14 px-8 text-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-medium transition-all group"
                >
                    View Plans <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
            </section>

            {/* CTA Section */}
            <section className="py-20 max-w-5xl mx-auto px-6 mb-10">
                <div className="relative rounded-3xl overflow-hidden p-12 md:p-20 text-center bg-gradient-to-b from-emerald-900/30 to-transparent border border-emerald-500/10">
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to Ascend?</h2>
                        <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10">
                            Join thousands of others who are actively designing their dream lives with Aetherius Vitality.
                        </p>
                        <button
                            onClick={() => navigate('/register')}
                            className="h-16 px-10 text-xl bg-white text-emerald-900 hover:bg-gray-100 rounded-full font-bold shadow-2xl shadow-white/10 transition-all hover:scale-105"
                        >
                            Begin Transformation
                        </button>
                        <p className="mt-4 text-xs text-gray-500">No credit card required. Cancel anytime.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};
