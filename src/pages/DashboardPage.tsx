import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, Zap, Star, Flame, MessageCircle, Plus, X,
    TrendingUp, Trophy, Target, UtensilsCrossed, Droplets,
    Footprints, Candy, Sparkles, Shield, CigaretteOff, Ban
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { PageTransition } from '../components/layout/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { StatCard } from '../components/ui/StatCard';
import { ProgressBar } from '../components/ui/ProgressBar';
import { XPRing } from '../components/ui/XPRing';
import { QuestCard } from '../components/ui/QuestCard';
import { MiniTracker } from '../components/ui/MiniTracker';
import { useAetherStore } from '../store/aetherStore';
import { useTrackersStore } from '../store/trackersStore';
import { useGreeting } from '../hooks/useGreeting';
import { getXPProgress, getXPForNextLevel, ACHIEVEMENTS } from '../lib/achievements';
import { getAlchemistAdvice } from '../lib/gemini';
import { getDailyInsight } from '../lib/aiInsights';
import { analyzeMeal, calculateHealthImpact, validateFoodInput } from '../lib/aiFoodAnalyzer';
import { isAIAvailable } from '../lib/aiProvider';
import { useToast } from '../context/ToastContext';
import { useSound } from '../lib/SoundManager';

export const DashboardPage: React.FC = () => {
    const navigate = useNavigate();

    // Select individual fields instead of entire store to prevent cascade re-renders
    const profile = useAetherStore((s) => s.profile);
    const hp = useAetherStore((s) => s.hp);
    const mana = useAetherStore((s) => s.mana);
    const xp = useAetherStore((s) => s.xp);
    const level = useAetherStore((s) => s.level);
    const streak = useAetherStore((s) => s.streak);
    const daysActive = useAetherStore((s) => s.daysActive);
    const mealsLogged = useAetherStore((s) => s.mealsLogged);
    const questsCompleted = useAetherStore((s) => s.questsCompleted);
    const quests = useAetherStore((s) => s.quests);
    const mealHistory = useAetherStore((s) => s.mealHistory);
    const hpHistory = useAetherStore((s) => s.hpHistory);
    const generateDailyQuests = useAetherStore((s) => s.generateDailyQuests);
    const updateStreak = useAetherStore((s) => s.updateStreak);
    const checkAchievements = useAetherStore((s) => s.checkAchievements);
    const logMeal = useAetherStore((s) => s.logMeal);
    const updateQuestProgress = useAetherStore((s) => s.updateQuestProgress);
    const completeQuest = useAetherStore((s) => s.completeQuest);

    const getTodayWater = useTrackersStore((s) => s.getTodayWater);
    const getTodaySteps = useTrackersStore((s) => s.getTodaySteps);
    const getTodayCalories = useTrackersStore((s) => s.getTodayCalories);
    const getTodaySugar = useTrackersStore((s) => s.getTodaySugar);
    const addFood = useTrackersStore((s) => s.addFood);
    const getTodayExercises = useTrackersStore((s) => s.getTodayExercises);
    const habits = useTrackersStore((s) => s.habits);
    const getHabitStreak = useTrackersStore((s) => s.getHabitStreak);
    const greeting = useGreeting(profile?.name || 'Seeker');

    const [showMealModal, setShowMealModal] = useState(false);
    const [mealInput, setMealInput] = useState('');
    const [isLogging, setIsLogging] = useState(false);
    const [newAchievements, setNewAchievements] = useState<string[]>([]);
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);

    const xpProgress = useMemo(() => getXPProgress(xp, level), [xp, level]);
    const xpNeeded = useMemo(() => getXPForNextLevel(level), [level]);
    const activeQuests = useMemo(() => quests.filter((q) => !q.completed).slice(0, 3), [quests]);

    const todayWater = useMemo(() => getTodayWater(), [getTodayWater]);
    const todaySteps = useMemo(() => getTodaySteps(), [getTodaySteps]);
    const todayCalories = useMemo(() => getTodayCalories(), [getTodayCalories]);
    const todaySugar = useMemo(() => getTodaySugar(), [getTodaySugar]);

    const chartData = useMemo(() => hpHistory.slice(-7), [hpHistory]);
    const recentMeals = useMemo(() => mealHistory.slice(0, 5), [mealHistory]);

    // Generate daily quests on mount
    useEffect(() => {
        generateDailyQuests();
        updateStreak();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch AI daily insight
    useEffect(() => {
        if (isAIAvailable()) {
            const todayExercises = getTodayExercises();
            const sobrietyDays = habits.map(h => ({ name: h.name, days: getHabitStreak(h.id).days }));
            const exerciseMinutes = todayExercises.reduce((sum, ex) => sum + ex.durationMin, 0);
            const caloriesBurned = todayCalories.burned;

            getDailyInsight({
                waterGlasses: todayWater.glasses,
                waterTarget: todayWater.target,
                steps: todaySteps.steps,
                stepsTarget: todaySteps.target,
                caloriesConsumed: todayCalories.consumed,
                calorieTarget: todayCalories.target,
                sugarGrams: todaySugar.grams,
                sugarTarget: todaySugar.target,
                streak,
                exerciseMinutes,
                caloriesBurned,
                sobrietyDays
            }).then(setAiInsight);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Check achievements
    useEffect(() => {
        const unlocked = checkAchievements();
        if (unlocked.length > 0) {
            setNewAchievements(unlocked);
            const timer = setTimeout(() => setNewAchievements([]), 5000);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mealsLogged, questsCompleted, streak, level]);

    const { addToast } = useToast();
    const { play } = useSound();

    const handleLogMeal = useCallback(async () => {
        if (!mealInput.trim()) return;
        play('click');
        setIsLogging(true);
        setValidationError(null);
        try {
            // Validate input first
            const validation = await validateFoodInput(mealInput);
            if (!validation.isFood) {
                setValidationError(validation.reason);
                addToast(validation.reason, 'error');
                play('error');
                setIsLogging(false);
                return;
            }

            // Try AI-powered meal analysis
            const mealAnalysis = await analyzeMeal(mealInput);

            let hpImpact: number;
            let advice: string;

            if (mealAnalysis) {
                const impact = calculateHealthImpact(mealAnalysis.healthScore);
                hpImpact = impact.hpImpact;
                advice = mealAnalysis.advice;

                // Also log individual items with their specific portions
                if (mealAnalysis.items && mealAnalysis.items.length > 0) {
                    mealAnalysis.items.forEach(item => {
                        addFood({
                            foodId: `meal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            name: item.name,
                            emoji: item.emoji || '🍽️',
                            calories: item.calories, // AI returns calories per unit/serving
                            sugar: item.sugar,
                            protein: item.protein,
                            carbs: item.carbs,
                            fat: item.fat,
                            servings: item.quantity || 1,
                        });
                    });
                } else if (mealAnalysis.totalCalories > 0) {
                    // Fallback for aggregate only
                    addFood({
                        foodId: `meal_${Date.now()}`,
                        name: mealInput,
                        emoji: '🍽️',
                        calories: mealAnalysis.totalCalories,
                        sugar: mealAnalysis.totalSugar,
                        protein: mealAnalysis.totalProtein,
                        carbs: mealAnalysis.totalCarbs,
                        fat: mealAnalysis.totalFat,
                        servings: 1,
                    });
                }
            } else {
                // Fallback to old method
                const profileStr = `Goal: ${profile?.healthGoal}, Difficulty: ${profile?.difficulty}, HP: ${hp}`;
                advice = await getAlchemistAdvice(mealInput, profileStr);
                const positive = /healthy|green|salad|fish|chicken|fruit|vegetable|water|soup|oat/i.test(mealInput);
                hpImpact = positive ? Math.floor(Math.random() * 10 + 5) : -Math.floor(Math.random() * 10 + 3);
            }

            logMeal(mealInput, hpImpact, advice);

            // Update quest progress for meal logging
            quests.forEach((q) => {
                if (q.title === 'Substance Analysis' && !q.completed) {
                    updateQuestProgress(q.id, q.progress + 1);
                }
            });

            addToast('Sustenance recorded successfully.', 'success');
            play('success');

            setMealInput('');
            setShowMealModal(false);
        } catch {
            addToast('Failed to analyze sustenance.', 'error');
            play('error');
        }
        setIsLogging(false);
    }, [mealInput, profile, hp, quests, logMeal, updateQuestProgress, addFood, addToast, play]);

    return (
        <PageTransition className="space-y-6">
            {/* Achievement Toast */}
            <AnimatePresence>
                {newAchievements.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 glass border-emerald-500/20 glow-emerald px-6 py-4 flex items-center gap-3"
                    >
                        <Trophy className="w-6 h-6 text-amber-400" />
                        <div>
                            <p className="text-sm font-bold text-white">Achievement Unlocked!</p>
                            <p className="text-xs text-gray-400">
                                {newAchievements.map((id) => ACHIEVEMENTS.find((a) => a.id === id)?.title).join(', ')}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Greeting */}
            <div className="flex items-start justify-between">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl lg:text-4xl font-black text-white tracking-tight"
                    >
                        {greeting}
                    </motion.h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Day {daysActive || 1} of your transmutation journey
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{profile?.avatar}</span>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard icon={Heart} label="Aether Integrity" value={hp} color="rose" subLabel="HP">
                    <ProgressBar value={hp} variant="rose" size="sm" />
                </StatCard>
                <StatCard icon={Zap} label="Zenith Focus" value={mana} color="cyan" subLabel="Mana">
                    <ProgressBar value={mana} variant="cyan" size="sm" />
                </StatCard>
                <StatCard icon={Flame} label="Streak" value={streak} color="gold" subLabel={`${streak} days`}>
                    <div className="flex gap-0.5 mt-1">
                        {[...Array(7)].map((_, i) => {
                            const activeDots = streak === 0 ? 0 : (streak % 7 || 7);
                            return (
                                <div key={i} className={`h-1.5 w-full rounded-full ${i < activeDots ? 'bg-amber-400' : 'bg-white/[0.04]'}`} />
                            );
                        })}
                    </div>
                </StatCard>
                <StatCard icon={Star} label="Total XP" value={xp} color="emerald" subLabel={`Lv.${level}`}>
                    <ProgressBar value={xpProgress} variant="emerald" size="sm" />
                </StatCard>
            </div>

            {/* Health Trackers Mini-Widgets */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" /> Health Trackers
                    </h3>
                    <button onClick={() => navigate('/trackers')} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer">
                        View All →
                    </button>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div onClick={() => navigate('/trackers')} className="cursor-pointer">
                        <MiniTracker
                            icon={Droplets}
                            label="Water"
                            value={`${todayWater.glasses} glasses`}
                            progress={(todayWater.glasses / todayWater.target) * 100}
                            color="#06b6d4"
                        />
                    </div>
                    <div onClick={() => navigate('/trackers')} className="cursor-pointer">
                        <MiniTracker
                            icon={Footprints}
                            label="Steps"
                            value={`${todaySteps.steps} steps`}
                            progress={(todaySteps.steps / todaySteps.target) * 100}
                            color="#10b981"
                        />
                    </div>
                    <div onClick={() => navigate('/trackers')} className="cursor-pointer">
                        <MiniTracker
                            icon={Flame}
                            label="Calories"
                            value={`${todayCalories.consumed} kcal`}
                            progress={(todayCalories.consumed / todayCalories.target) * 100}
                            color="#f59e0b"
                        />
                    </div>
                    <div onClick={() => navigate('/trackers')} className="cursor-pointer">
                        <MiniTracker
                            icon={Candy}
                            label="Sugar"
                            value={`${todaySugar.grams}g`}
                            progress={(todaySugar.grams / todaySugar.target) * 100}
                            color="#f43f5e"
                        />
                    </div>
                </div>
            </div>

            {/* Active Journeys (Habits) Mini-Widget */}
            {habits.length > 0 && (
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-400" /> Active Journeys
                        </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {habits.slice(0, 2).map(habit => {
                            const streak = getHabitStreak(habit.id);
                            return (
                                <GlassCard
                                    key={habit.id}
                                    className="p-3 cursor-pointer hover:bg-white/[0.05] transition-colors"
                                    onClick={() => navigate('/trackers')}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                            {habit.type === 'smoking' && <CigaretteOff className="w-4 h-4 text-emerald-400" />}
                                            {habit.type === 'nofap' && <Ban className="w-4 h-4 text-cyan-400" />}
                                            {habit.type === 'custom' && <Shield className="w-4 h-4 text-gray-400" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold text-white truncate">{habit.name}</p>
                                            <p className="text-[10px] text-emerald-400 font-mono">{streak.days}d {streak.hours}h</p>
                                        </div>
                                    </div>
                                </GlassCard>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* AI Daily Insight */}
            {aiInsight && (
                <GlassCard glow="emerald" padding="md">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/15 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-emerald-400 mb-1">Alchemist's Daily Insight</p>
                            <p className="text-sm text-gray-300 leading-relaxed">{aiInsight}</p>
                        </div>
                    </div>
                </GlassCard>
            )}

            {/* Middle Row: XP Ring + Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* XP Ring + Level Info */}
                <GlassCard className="flex flex-col items-center py-8" glow="emerald">
                    <XPRing progress={xpProgress} level={level} size={140} />
                    <p className="text-xs text-gray-500 mt-4 font-mono">
                        {xp} / {xpNeeded} XP to Level {level + 1}
                    </p>
                    <div className="flex gap-2 mt-4">
                        <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-lg font-medium">
                            🍽️ {mealsLogged} meals
                        </span>
                        <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-1 rounded-lg font-medium">
                            📜 {questsCompleted} quests
                        </span>
                    </div>
                </GlassCard>

                {/* HP Trend Chart */}
                <GlassCard className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                            <h3 className="text-sm font-bold text-white">Integrity Trend</h3>
                        </div>
                        <span className="text-xs text-gray-600">Last 7 entries</span>
                    </div>
                    {hpHistory.length > 1 ? (
                        <ResponsiveContainer width="100%" height={160}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="hpGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#525252' }} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#525252' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ background: '#111318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 12 }}
                                    labelStyle={{ color: '#9ca3af' }}
                                />
                                <Area type="monotone" dataKey="hp" stroke="#10b981" fill="url(#hpGradient)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[160px] text-gray-600 text-sm">
                            Log meals to see your trend chart appear here
                        </div>
                    )}
                </GlassCard>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button onClick={() => setShowMealModal(true)} className="btn-primary flex items-center justify-center gap-3 py-4 text-sm">
                    <UtensilsCrossed className="w-5 h-5" /> Log Meal
                </button>
                <button onClick={() => navigate('/chat')} className="btn-secondary flex items-center justify-center gap-3 py-4 text-sm">
                    <MessageCircle className="w-5 h-5" /> Ask Alchemist
                </button>
                <button onClick={() => {
                    const q = quests.find(q => !q.completed);
                    if (q) updateQuestProgress(q.id, q.progress + 1);
                }} className="btn-secondary flex items-center justify-center gap-3 py-4 text-sm">
                    <Target className="w-5 h-5" /> Quick Progress
                </button>
            </div>

            {/* Active Quests */}
            {activeQuests.length > 0 && (
                <GlassCard>
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-sm font-bold text-white">Active Quests</h3>
                    </div>
                    <div className="space-y-2">
                        {activeQuests.map((quest) => (
                            <QuestCard
                                key={quest.id}
                                quest={quest}
                                onComplete={() => completeQuest(quest.id)}
                            />
                        ))}
                    </div>
                </GlassCard>
            )}

            {/* Recent Activity */}
            {mealHistory.length > 0 && (
                <GlassCard>
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <UtensilsCrossed className="w-4 h-4 text-rose-400" /> Recent Meals
                    </h3>
                    <div className="space-y-2">
                        {recentMeals.map((log) => (
                            <div key={log.id} className="glass-subtle p-3 flex items-center justify-between">
                                <div>
                                    <span className="text-sm font-medium text-white">{log.meal}</span>
                                    <span className="text-xs text-gray-600 ml-2">
                                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <span className={`text-xs font-bold ${log.hpImpact >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {log.hpImpact >= 0 ? '+' : ''}{log.hpImpact} HP
                                </span>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            )}

            {/* Meal Log Modal */}
            <AnimatePresence>
                {showMealModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => !isLogging && setShowMealModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 10 }}
                            className="glass p-6 w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-black text-white">Log Meal</h3>
                                <button onClick={() => setShowMealModal(false)} className="btn-ghost p-1">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mb-2">What did you consume, Seeker?</p>
                            <p className="text-xs text-emerald-400/60 mb-4 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> AI will analyze nutrition & cache results
                            </p>
                            <textarea
                                value={mealInput}
                                onChange={(e) => {
                                    setMealInput(e.target.value);
                                    if (validationError) setValidationError(null);
                                }}
                                placeholder="e.g. Grilled salmon with steamed broccoli and brown rice..."
                                className={`input-field min-h-[100px] resize-none mb-4 ${validationError ? 'border-rose-500/50 bg-rose-500/5' : ''}`}
                                autoFocus
                            />

                            {validationError && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 mb-4"
                                >
                                    <p className="text-xs text-rose-400 font-bold flex items-center gap-2">
                                        <X className="w-3 h-3" /> {validationError}
                                    </p>
                                </motion.div>
                            )}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleLogMeal}
                                    disabled={!mealInput.trim() || isLogging}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                                >
                                    {isLogging ? (
                                        <>
                                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                                            AI Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4" /> Log & Analyze
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </PageTransition>
    );
};
