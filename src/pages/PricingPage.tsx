import { motion } from 'framer-motion';
// import { Button } from '../components/ui/button'; // Assuming you have a button component or use HTML button
import { Check, Star, Zap, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function PricingPage() {
    const navigate = useNavigate();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

    const plans = [
        {
            id: 'novice',
            name: 'Novice Alchemist',
            desc: 'Essential tools for your transmutation journey.',
            price: 'Free',
            features: [
                'Basic Health Tracking',
                'Daily Quests',
                'Community Access'
            ],
            icon: <Zap className="w-5 h-5 text-emerald-400" />,
            buttonText: 'Start Journey',
            variant: 'outline'
        },
        {
            id: 'master',
            name: 'Master Alchemist',
            desc: 'Unlock the full potential of your vitality.',
            price: billingCycle === 'monthly' ? '$9.99' : '$7.99',
            popular: true,
            features: [
                'Advanced AI Insights',
                'Unlimited Habit Tracking',
                'Exclusive Transmutations',
                'Priority Support',
                'Custom Themes'
            ],
            icon: <Star className="w-5 h-5 text-amber-400" />,
            buttonText: 'Ascend Now',
            variant: 'default'
        },
        {
            id: 'grandmaster',
            name: 'Grandmaster',
            desc: 'For those who guide others.',
            price: 'Custom',
            features: [
                'Coaching Dashboard',
                'Client Management',
                'White-label Reports',
                'API Access'
            ],
            icon: <Shield className="w-5 h-5 text-cyan-400" />,
            buttonText: 'Contact Us',
            variant: 'outline'
        }
    ];

    return (
        <div className="min-h-screen bg-[#060714] text-white">
            <div className="container mx-auto px-6 py-20">
                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
                    >
                        Choose Your Path
                    </motion.h1>
                    <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-12">
                        Invest in your vitality and unlock your true potential.
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4">
                        <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-500'}`}>
                            Monthly
                        </span>
                        <button
                            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annual' : 'monthly')}
                            className="w-14 h-7 rounded-full bg-white/10 p-1 relative transition-colors hover:bg-white/20"
                        >
                            <motion.div
                                animate={{ x: billingCycle === 'annual' ? 28 : 0 }}
                                className="w-5 h-5 rounded-full bg-emerald-500 shadow-lg"
                            />
                        </button>
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-white' : 'text-gray-500'}`}>
                                Annual
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                                SAVE 20%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative p-8 rounded-[2.5rem] border transition-all duration-500 group overflow-hidden ${plan.popular
                                ? 'bg-emerald-500/5 border-emerald-500/30'
                                : 'bg-white/5 border-white/10'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 px-6 py-2 bg-emerald-500 text-[10px] font-black tracking-widest text-white rounded-bl-2xl uppercase">
                                    Most Popular
                                </div>
                            )}

                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-black border border-white/5 flex items-center justify-center">
                                    {plan.icon}
                                </div>
                                <h3 className="text-xl font-bold">{plan.name}</h3>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black">{plan.price}</span>
                                    {plan.price !== 'Custom' && (
                                        <span className="text-gray-500 text-sm">{billingCycle === 'monthly' ? '/mo' : '/mo'}</span>
                                    )}
                                </div>
                                <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                                    {plan.desc}
                                </p>
                            </div>

                            <div className="space-y-4 mb-10">
                                {plan.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center mt-0.5">
                                            <Check className="w-3 h-3 text-emerald-400" />
                                        </div>
                                        <span className="text-gray-300 text-sm">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                className={`w-full h-14 rounded-2xl font-bold text-base transition-all duration-300 ${plan.popular
                                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 text-white'
                                    : 'bg-white/5 hover:bg-white/10 text-white'
                                    }`}
                                onClick={() => {
                                    if (plan.id === 'novice') {
                                        navigate('/register');
                                    } else if (plan.id === 'master') {
                                        const link = billingCycle === 'monthly'
                                            ? 'https://buy.stripe.com/test_fZu9AUabz3mA64f7IR5EY00'
                                            : 'https://buy.stripe.com/test_6oU7sM0AZ3mA78j3sB5EY01';
                                        window.location.href = link;
                                    } else {
                                        navigate('/contact');
                                    }
                                }}
                            >
                                {plan.buttonText}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div >
    );
}
