import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Droplets, Footprints, Candy, Flame, Weight, Timer,
    Plus, Minus, Trash2, TrendingDown, TrendingUp, X,
    Activity, Dumbbell, Clock,
    Shield, Ban, Coins, Cigarette, CigaretteOff, History
} from 'lucide-react';
import { format, parseISO, startOfWeek, addDays } from 'date-fns';
import { PageTransition } from '../components/layout/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { TabBar } from '../components/ui/TabBar';
import { CircularProgress } from '../components/ui/CircularProgress';
import { CountdownTimer } from '../components/ui/CountdownTimer';
import { FoodSearch } from '../components/ui/FoodSearch';
import { useTrackersStore } from '../store/trackersStore';
import { calculateBMI, getHealthyWeightRange } from '../lib/bmiCalculator';
import { getCaloriePlan } from '../lib/calorieCalculator';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { FoodItem } from '../lib/foodDatabase';
import { SleepTracker } from '../components/trackers/SleepTracker';
import { BodyMetrics } from '../components/trackers/BodyMetrics';

const TABS = [
    { id: 'water', label: 'Water', emoji: '💧' },
    { id: 'steps', label: 'Steps', emoji: '👟' },
    { id: 'fitness', label: 'Fitness', emoji: '💪' },
    { id: 'habits', label: 'Habits', emoji: '🛡️' },
    { id: 'calories', label: 'Calories', emoji: '🔥' },
    { id: 'sugar', label: 'Sugar', emoji: '🍬' },
    { id: 'weight', label: 'Weight', emoji: '⚖️' },
    { id: 'fasting', label: 'Fasting', emoji: '⏰' },
    { id: 'sleep', label: 'Sleep', emoji: '😴' },
    { id: 'body', label: 'Body', emoji: '📏' },
];

export const TrackersPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('water');

    return (
        <PageTransition className="space-y-5">
            <div>
                <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">Health Trackers</h1>
                <p className="text-sm text-gray-500 mt-1">Track every aspect of your wellness journey</p>
            </div>

            <TabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'water' && <WaterTracker />}
                    {activeTab === 'steps' && <StepsTracker />}
                    {activeTab === 'fitness' && <FitnessTracker />}
                    {activeTab === 'habits' && <HabitTrackerView />}
                    {activeTab === 'calories' && <CalorieTracker />}
                    {activeTab === 'sugar' && <SugarTracker />}
                    {activeTab === 'weight' && <WeightTracker />}
                    {activeTab === 'fasting' && <FastingTracker />}
                    {activeTab === 'sleep' && <SleepTracker />}
                    {activeTab === 'body' && <BodyMetrics />}
                </motion.div>
            </AnimatePresence>
        </PageTransition>
    );
};

// ─── WATER TRACKER ───────────────────────────────────────────
const WaterTracker: React.FC = () => {
    const store = useTrackersStore();
    const today = store.getTodayWater();
    const progress = Math.min(100, (today.glasses / today.target) * 100);

    // Generate current week data (Monday - Sunday)
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekData = Array.from({ length: 7 }, (_, i) => {
        const d = addDays(weekStart, i);
        const dateStr = format(d, 'yyyy-MM-dd');
        const log = store.waterLogs.find(l => l.date === dateStr);
        return {
            date: dateStr,
            dayName: format(d, 'EEE'), // Mon, Tue, etc.
            glasses: log?.glasses || 0,
            target: log?.target || 8,
        };
    });

    return (
        <div className="space-y-4">
            <GlassCard className="flex flex-col items-center py-8" glow="cyan">
                <CircularProgress
                    value={progress}
                    size={160}
                    strokeWidth={10}
                    color="#06b6d4"
                    label={`${today.glasses}`}
                    sublabel={`of ${today.target} glasses`}
                    icon={<Droplets className="w-5 h-5 text-cyan-400" />}
                />
                <div className="flex items-center gap-3 mt-6">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => store.removeWater(1)}
                        className="btn-ghost p-3 text-cyan-400 hover:bg-cyan-400/10 rounded-xl"
                        title="Remove glass"
                    >
                        <Minus className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => store.addWater(1)}
                        className="btn-primary px-6 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add Glass
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => store.addWater(2)}
                        className="btn-secondary px-4"
                    >
                        +2
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => store.addWater(3)}
                        className="btn-secondary px-4"
                    >
                        +3
                    </motion.button>
                </div>
                {progress >= 100 && (
                    <motion.p
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-emerald-400 text-sm font-bold mt-3"
                    >
                        🎉 Daily goal reached!
                    </motion.p>
                )}
            </GlassCard>

            {/* Timeline */}
            <GlassCard>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-cyan-400" /> This Week
                </h3>
                <div className="flex justify-between items-end gap-2 mt-4 px-2">
                    {weekData.map((day, i) => {
                        const pct = Math.min(100, (day.glasses / day.target) * 100) || 0;
                        const isToday = day.date === format(new Date(), 'yyyy-MM-dd');
                        return (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <div className="w-6 sm:w-8 bg-white/[0.04] rounded-full overflow-hidden h-24 relative shadow-inner">
                                    <motion.div
                                        className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-cyan-600 to-cyan-400"
                                        initial={{ height: 0 }}
                                        animate={{ height: `${pct}%` }}
                                        transition={{ delay: i * 0.05, duration: 0.5 }}
                                    />
                                </div>
                                <span className={`text-[10px] font-bold uppercase ${isToday ? 'text-cyan-400' : 'text-gray-500'}`}>
                                    {day.dayName.charAt(0)}
                                </span>
                                <span className={`text-[10px] ${isToday ? 'text-white font-bold' : 'text-gray-600'}`}>
                                    {day.glasses}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </GlassCard>
        </div>
    );
};

// ─── STEPS TRACKER ───────────────────────────────────────────
const StepsTracker: React.FC = () => {
    const store = useTrackersStore();
    const today = store.getTodaySteps();
    const progress = Math.min(100, (today.steps / today.target) * 100);
    const [addAmount, setAddAmount] = useState('');

    return (
        <div className="space-y-4">
            <GlassCard className="flex flex-col items-center py-8" glow="emerald">
                <CircularProgress
                    value={progress}
                    size={160}
                    strokeWidth={10}
                    color="#10b981"
                    label={today.steps.toLocaleString()}
                    sublabel={`of ${today.target.toLocaleString()} steps`}
                    icon={<Footprints className="w-5 h-5 text-emerald-400" />}
                />
                <div className="flex items-center gap-2 mt-6">
                    <input
                        type="number"
                        value={addAmount}
                        onChange={(e) => setAddAmount(e.target.value)}
                        placeholder="Steps..."
                        className="input-field w-28 text-center text-sm"
                    />
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                            const n = parseInt(addAmount);
                            if (n > 0) { store.removeSteps(n); setAddAmount(''); }
                        }}
                        disabled={!addAmount || parseInt(addAmount) <= 0}
                        className="btn-ghost p-3 text-emerald-400 hover:bg-emerald-400/10 rounded-xl"
                        title="Subtract steps"
                    >
                        <Minus className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                            const n = parseInt(addAmount);
                            if (n > 0) { store.addSteps(n); setAddAmount(''); }
                        }}
                        disabled={!addAmount || parseInt(addAmount) <= 0}
                        className="btn-primary px-6"
                    >
                        <Plus className="w-4 h-4" />
                    </motion.button>
                </div>
                <div className="flex gap-2 mt-3">
                    {[1000, 2500, 5000].map((v) => (
                        <motion.button
                            key={v}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => store.addSteps(v)}
                            className="btn-secondary text-xs px-3 py-2"
                        >
                            +{(v / 1000).toFixed(v >= 1000 ? 0 : 1)}K
                        </motion.button>
                    ))}
                </div>
                {progress >= 100 && (
                    <motion.p
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-emerald-400 text-sm font-bold mt-3"
                    >
                        🏆 Step goal smashed!
                    </motion.p>
                )}
            </GlassCard>

            {/* Weekly Timeline */}
            <GlassCard>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Footprints className="w-4 h-4 text-emerald-400" /> This Week
                </h3>

                <div className="flex justify-between items-end gap-2 mt-4 px-2">
                    {Array.from({ length: 7 }, (_, i) => {
                        const d = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i);
                        const dateStr = format(d, 'yyyy-MM-dd');
                        const log = store.stepsLogs.find(l => l.date === dateStr);
                        const steps = log?.steps || 0;
                        const target = log?.target || 10000;
                        const pct = Math.min(100, (steps / target) * 100) || 0;
                        const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
                        const cals = Math.round(store.calorieLogs.find(l => l.date === dateStr)?.burned || 0);

                        return (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <div className="text-[9px] text-amber-400 font-bold mb-1">
                                    {cals > 0 ? `${cals} 🔥` : ''}
                                </div>
                                <div className="w-6 sm:w-8 bg-white/[0.04] rounded-full overflow-hidden h-24 relative shadow-inner">
                                    <motion.div
                                        className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-emerald-600 to-emerald-400"
                                        initial={{ height: 0 }}
                                        animate={{ height: `${pct}%` }}
                                        transition={{ delay: i * 0.05, duration: 0.5 }}
                                    />
                                </div>
                                <span className={`text-[10px] font-bold uppercase ${isToday ? 'text-emerald-400' : 'text-gray-500'}`}>
                                    {format(d, 'EEE').charAt(0)}
                                </span>
                                <span className={`text-[10px] ${isToday ? 'text-white font-bold' : 'text-gray-600'}`}>
                                    {steps > 999 ? `${(steps / 1000).toFixed(1)}k` : steps}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </GlassCard>
        </div>
    );
};

// ─── CALORIE TRACKER ──────────────────────────────────────────
const CalorieTracker: React.FC = () => {
    const store = useTrackersStore();
    const today = store.getTodayCalories();

    // Net Calories Formula: Target + Burned - Consumed
    const totalBudget = today.target + today.burned;
    const remaining = totalBudget - today.consumed;

    const progress = Math.min(100, (today.consumed / totalBudget) * 100);
    const bp = store.bodyProfile;

    // Calculate TDEE-based target if profile exists
    const plan = bp ? getCaloriePlan(bp.weightKg, bp.heightCm, bp.age, bp.gender, bp.activityLevel, bp.targetWeightKg) : null;

    return (
        <div className="space-y-4">
            <GlassCard className="flex flex-col items-center py-6" glow="gold">
                <CircularProgress
                    value={progress}
                    size={150}
                    strokeWidth={10}
                    color={remaining >= 0 ? '#f59e0b' : '#f43f5e'}
                    label={`${today.consumed}`}
                    sublabel={`${remaining >= 0 ? remaining : 0} cal left`}
                    icon={<Flame className="w-5 h-5 text-amber-400" />}
                />

                <div className="flex gap-4 mt-4 w-full max-w-sm">
                    <div className="flex-1 glass-subtle p-2 text-center rounded-xl">
                        <p className="text-[10px] text-gray-500 uppercase">Target</p>
                        <p className="text-sm font-bold text-white">{today.target}</p>
                    </div>
                    <div className="flex-1 glass-subtle p-2 text-center rounded-xl">
                        <p className="text-[10px] text-emerald-400 uppercase font-black">+ Burned</p>
                        <p className="text-sm font-bold text-emerald-400">{Math.round(today.burned)}</p>
                    </div>
                    <div className="flex-1 glass-subtle p-2 text-center rounded-xl border border-white/5">
                        <p className="text-[10px] text-gray-500 uppercase">Total</p>
                        <p className="text-sm font-bold text-white">{Math.round(totalBudget)}</p>
                    </div>
                </div>

                <p className="text-[10px] text-gray-600 mt-4 italic">Consumed {today.consumed} of {Math.round(totalBudget)} calories</p>

                {plan && (
                    <div className="grid grid-cols-3 gap-3 mt-4 w-full max-w-sm">
                        <div className="glass-subtle p-2 text-center rounded-xl">
                            <p className="text-xs text-gray-500">BMR</p>
                            <p className="text-sm font-bold text-white">{plan.bmr}</p>
                        </div>
                        <div className="glass-subtle p-2 text-center rounded-xl">
                            <p className="text-xs text-gray-500">TDEE</p>
                            <p className="text-sm font-bold text-white">{plan.tdee}</p>
                        </div>
                        <div className="glass-subtle p-2 text-center rounded-xl">
                            <p className="text-xs text-gray-500">Deficit</p>
                            <p className="text-sm font-bold text-amber-400">{plan.dailyDeficit}</p>
                        </div>
                    </div>
                )}
            </GlassCard>

            {/* Food Search & Log */}
            <GlassCard>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" /> Add Food
                </h3>
                <FoodSearch
                    onAddFood={(food: FoodItem, servings: number) => {
                        store.addFood({
                            foodId: food.id,
                            name: food.name,
                            emoji: food.emoji,
                            calories: food.calories,
                            sugar: food.sugar,
                            protein: food.protein,
                            carbs: food.carbs,
                            fat: food.fat,
                            servings,
                        });
                    }}
                />
            </GlassCard>

            {/* Today's log */}
            {today.foods.length > 0 && (
                <GlassCard>
                    <h3 className="text-sm font-bold text-white mb-3">Today&apos;s Food Log</h3>
                    <div className="space-y-1.5">
                        {today.foods.map((f, i) => (
                            <div key={i} className="glass-subtle p-2.5 flex items-center justify-between group">
                                <span className="flex items-center gap-2 text-sm text-white">
                                    <span>{f.emoji}</span> {f.name}
                                    {f.servings !== 1 && <span className="text-xs text-gray-500">×{f.servings}</span>}
                                </span>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-amber-400">{Math.round(f.calories * f.servings)} cal</span>
                                    <button
                                        onClick={() => store.removeFood(f.foodId)}
                                        className="text-gray-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Delete entry"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            )}
        </div>
    );
};

// ─── SUGAR TRACKER ────────────────────────────────────────────
const SugarTracker: React.FC = () => {
    const store = useTrackersStore();
    const today = store.getTodaySugar();
    const progress = Math.min(100, (today.grams / today.target) * 100);
    const overLimit = today.grams > today.target;
    const [addAmount, setAddAmount] = useState('');

    return (
        <div className="space-y-4">
            <GlassCard className="flex flex-col items-center py-8" glow={overLimit ? undefined : 'purple'}>
                <CircularProgress
                    value={progress}
                    size={150}
                    strokeWidth={10}
                    color={overLimit ? '#f43f5e' : progress > 75 ? '#f59e0b' : '#8b5cf6'}
                    label={`${today.grams}g`}
                    sublabel={`of ${today.target}g limit`}
                    icon={<Candy className="w-5 h-5" style={{ color: overLimit ? '#f43f5e' : '#8b5cf6' }} />}
                />

                {/* Danger zones */}
                <div className="flex gap-1 mt-4 w-full max-w-xs">
                    <div className={`h-2 flex-1 rounded-l-full ${progress <= 50 ? 'bg-emerald-500' : 'bg-emerald-500/20'}`} />
                    <div className={`h-2 flex-1 ${progress > 50 && progress <= 75 ? 'bg-amber-500' : 'bg-amber-500/20'}`} />
                    <div className={`h-2 flex-1 rounded-r-full ${progress > 75 ? (overLimit ? 'bg-rose-500' : 'bg-rose-500/50') : 'bg-rose-500/20'}`} />
                </div>
                <div className="flex justify-between text-[9px] text-gray-600 w-full max-w-xs mt-1">
                    <span>Good</span>
                    <span>Moderate</span>
                    <span>High</span>
                </div>

                <div className="flex items-center gap-2 mt-4">
                    <input
                        type="number"
                        value={addAmount}
                        onChange={(e) => setAddAmount(e.target.value)}
                        placeholder="Grams..."
                        className="input-field w-24 text-center text-sm"
                    />
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                            const n = parseFloat(addAmount);
                            if (n > 0) { store.removeSugar(n); setAddAmount(''); }
                        }}
                        disabled={!addAmount || parseFloat(addAmount) <= 0}
                        className="btn-ghost p-3 text-rose-400 hover:bg-rose-400/10 rounded-xl"
                        title="Subtract sugar"
                    >
                        <Minus className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                            const n = parseFloat(addAmount);
                            if (n > 0) { store.addSugar(n); setAddAmount(''); }
                        }}
                        disabled={!addAmount || parseFloat(addAmount) <= 0}
                        className="btn-primary px-5"
                    >
                        <Plus className="w-4 h-4" />
                    </motion.button>
                </div>
                <p className="text-xs text-gray-600 mt-2">Sugar is also tracked automatically when logging food</p>

                {overLimit && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-rose-400 text-xs font-bold mt-2"
                    >
                        ⚠️ You&apos;re over your daily sugar limit!
                    </motion.p>
                )}
            </GlassCard>
        </div>
    );
};

// ─── WEIGHT / BMI TRACKER ─────────────────────────────────────
const WeightTracker: React.FC = () => {
    const store = useTrackersStore();
    const bp = store.bodyProfile;
    const [newWeight, setNewWeight] = useState('');
    const latestWeight = store.weightLog.length > 0 ? store.weightLog[store.weightLog.length - 1].weightKg : bp?.weightKg || 0;
    const bmi = bp ? calculateBMI(latestWeight, bp.heightCm) : null;
    const healthyRange = bp ? getHealthyWeightRange(bp.heightCm) : null;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Weight input */}
                <GlassCard className="flex flex-col items-center py-6" glow="emerald">
                    <Weight className="w-8 h-8 text-emerald-400 mb-2" />
                    <p className="text-3xl font-black text-white">{latestWeight} kg</p>
                    {bp && (
                        <p className="text-xs text-gray-500 mt-1">
                            Target: {bp.targetWeightKg} kg
                            {latestWeight > bp.targetWeightKg && (
                                <span className="text-amber-400 ml-1">({(latestWeight - bp.targetWeightKg).toFixed(1)} kg to go)</span>
                            )}
                        </p>
                    )}
                    <div className="flex items-center gap-2 mt-4">
                        <input
                            type="number"
                            step="0.1"
                            value={newWeight}
                            onChange={(e) => setNewWeight(e.target.value)}
                            placeholder="kg..."
                            className="input-field w-24 text-center text-sm"
                        />
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                                const w = parseFloat(newWeight);
                                if (w > 0) { store.logWeight(w); setNewWeight(''); }
                            }}
                            disabled={!newWeight || parseFloat(newWeight) <= 0}
                            className="btn-primary px-5"
                        >
                            Log
                        </motion.button>
                    </div>
                </GlassCard>

                {/* BMI card */}
                {bmi && (
                    <GlassCard className="flex flex-col items-center py-6">
                        <p className="text-xs text-gray-500 mb-1">Body Mass Index</p>
                        <p className="text-4xl font-black" style={{ color: bmi.color }}>{bmi.bmi}</p>
                        <p className="text-sm font-bold mt-1" style={{ color: bmi.color }}>
                            {bmi.emoji} {bmi.label}
                        </p>
                        {healthyRange && (
                            <p className="text-xs text-gray-600 mt-2">
                                Healthy range: {healthyRange.min} – {healthyRange.max} kg
                            </p>
                        )}
                    </GlassCard>
                )}
            </div>

            {/* Weight trend */}
            {store.weightLog.length > 1 && (
                <GlassCard>
                    <div className="flex items-center gap-2 mb-3">
                        {store.weightLog[store.weightLog.length - 1].weightKg < store.weightLog[store.weightLog.length - 2].weightKg ? (
                            <TrendingDown className="w-4 h-4 text-emerald-400" />
                        ) : (
                            <TrendingUp className="w-4 h-4 text-rose-400" />
                        )}
                        <h3 className="text-sm font-bold text-white">Weight Trend</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={160}>
                        <AreaChart data={store.weightLog.slice(-14)}>
                            <defs>
                                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 9, fill: '#525252' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => format(parseISO(v), 'EEE')}
                            />
                            <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 9, fill: '#525252' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ background: '#111318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 12 }}
                                labelFormatter={(v) => format(parseISO(v), 'PPP')}
                            />
                            <Area type="monotone" dataKey="weightKg" stroke="#10b981" fill="url(#weightGrad)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </GlassCard>
            )}
        </div>
    );
};

// ─── FASTING TRACKER ──────────────────────────────────────────
const FastingTracker: React.FC = () => {
    const store = useTrackersStore();
    const { active, startTime, plan, totalFastsCompleted, history } = store.fasting;
    const PLANS: Array<{ value: '16:8' | '18:6' | '20:4' | '14:10'; label: string; desc: string }> = [
        { value: '14:10', label: '14:10', desc: '14h fast, 10h eat' },
        { value: '16:8', label: '16:8', desc: '16h fast, 8h eat' },
        { value: '18:6', label: '18:6', desc: '18h fast, 6h eat' },
        { value: '20:4', label: '20:4', desc: '20h fast, 4h eat' },
    ];

    return (
        <div className="space-y-4">
            <GlassCard className="py-6" glow={active ? 'gold' : undefined}>
                <CountdownTimer
                    startTime={startTime}
                    plan={plan}
                    active={active}
                    onEnd={() => store.endFast()}
                />
            </GlassCard>

            {/* Plan selector */}
            {!active && (
                <GlassCard>
                    <h3 className="text-sm font-bold text-white mb-3">Fasting Plan</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {PLANS.map((p) => (
                            <button
                                key={p.value}
                                onClick={() => store.setFastingPlan(p.value)}
                                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${plan === p.value
                                    ? 'border-amber-500/25 bg-amber-500/5'
                                    : 'border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03]'
                                    }`}
                            >
                                <p className="text-sm font-bold text-white">{p.label}</p>
                                <p className="text-[10px] text-gray-500">{p.desc}</p>
                            </button>
                        ))}
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => store.startFast()}
                        className="btn-primary w-full mt-4"
                    >
                        <Timer className="w-4 h-4 mr-2" /> Start {plan} Fast
                    </motion.button>
                </GlassCard>
            )}

            {/* Stats */}
            <GlassCard>
                <div className="grid grid-cols-2 gap-3">
                    <div className="glass-subtle p-3 text-center rounded-xl">
                        <p className="text-2xl font-black text-white">{totalFastsCompleted}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Fasts</p>
                    </div>
                    <div className="glass-subtle p-3 text-center rounded-xl">
                        <p className="text-2xl font-black text-white">
                            {history.length > 0 ? `${history[history.length - 1].durationHrs}h` : '—'}
                        </p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Last Duration</p>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

// ─── FITNESS TRACKER ──────────────────────────────────────────
import { ACTIVITIES } from '../lib/fitnessCalculator';

const FitnessTracker: React.FC = () => {
    const store = useTrackersStore();
    const todayExercises = store.getTodayExercises();
    const todayCalories = store.getTodayCalories();
    const [selectedCategory, setSelectedCategory] = useState<string>('cardio');
    const [selectedActivity, setSelectedActivity] = useState<string>('');
    const [duration, setDuration] = useState<string>('30');

    const categories = ['cardio', 'strength', 'sports', 'flexibility', 'recreational'];
    const filteredActivities = ACTIVITIES.filter(a => a.category === selectedCategory);

    const handleAdd = () => {
        if (selectedActivity && duration) {
            store.addExercise(selectedActivity, parseInt(duration));
            setSelectedActivity('');
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassCard className="flex flex-col items-center py-6" glow="emerald">
                    <Activity className="w-8 h-8 text-emerald-400 mb-2" />
                    <p className="text-3xl font-black text-white">{Math.round(todayCalories.burned)}</p>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Total Calories Burned</p>
                </GlassCard>
                <GlassCard className="flex flex-col items-center py-6" glow="cyan">
                    <Clock className="w-8 h-8 text-cyan-400 mb-2" />
                    <p className="text-3xl font-black text-white">
                        {todayExercises.reduce((sum, ex) => sum + ex.durationMin, 0)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Exercise Minutes</p>
                </GlassCard>
            </div>

            <GlassCard>
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-emerald-400" /> Log Exercise
                </h3>

                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${selectedCategory === cat
                                ? 'bg-emerald-500 text-black'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Activity List */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                    {filteredActivities.map(act => (
                        <button
                            key={act.id}
                            onClick={() => setSelectedActivity(act.id)}
                            className={`p-2 rounded-xl border text-left transition-all ${selectedActivity === act.id
                                ? 'border-emerald-500/50 bg-emerald-500/10'
                                : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                                }`}
                        >
                            <span className="text-lg">{act.emoji}</span>
                            <p className="text-[10px] font-bold text-white mt-1 leading-tight">{act.name}</p>
                        </button>
                    ))}
                </div>

                <div className="flex gap-3 items-end">
                    <div className="flex-1">
                        <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block">Duration (min)</label>
                        <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="input-field w-full"
                        />
                    </div>
                    <button
                        onClick={handleAdd}
                        disabled={!selectedActivity || !duration}
                        className="btn-primary h-11 px-8"
                    >
                        Log
                    </button>
                </div>
            </GlassCard>

            {/* Exercise List */}
            {todayExercises.length > 0 && (
                <GlassCard>
                    <h3 className="text-sm font-bold text-white mb-3 tracking-tight">Today&apos;s Training</h3>
                    <div className="space-y-2">
                        {todayExercises.map((ex) => (
                            <div key={ex.id} className="glass-subtle p-3 flex items-center justify-between group rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">
                                        {ex.emoji}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{ex.name}</p>
                                        <p className="text-[10px] text-gray-500">
                                            {ex.durationMin} minutes • {ex.caloriesBurned} cal
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => store.removeExercise(ex.id)}
                                    className="p-2 text-gray-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            )}
        </div>
    );
};

// ─── HABIT TRACKER ─────────────────────────────────────────────
function HabitTrackerView() {
    const store = useTrackersStore();
    const habits = store.habits;
    const [showStartModal, setShowStartModal] = useState(false);
    const [newHabitType, setNewHabitType] = useState<'smoking' | 'nofap' | 'custom'>('smoking');
    const [newHabitName, setNewHabitName] = useState('');

    // Smoking specifics
    const [cigsPerDay, setCigsPerDay] = useState('20');
    const [pricePerPack, setPricePerPack] = useState('15');

    const handleStart = () => {
        const settings = newHabitType === 'smoking' ? {
            cigarettesPerDay: parseInt(cigsPerDay),
            costPerPack: parseFloat(pricePerPack),
            currency: '$'
        } : undefined;

        const name = newHabitName || (newHabitType === 'smoking' ? 'Smoking Cessation' : newHabitType === 'nofap' ? 'NoFap' : 'Custom Habit');
        store.startHabit(newHabitType, name, settings);
        setShowStartModal(false);
        setNewHabitName('');
    };

    return (
        <div className="space-y-4">
            {habits.length === 0 ? (
                <GlassCard className="py-12 flex flex-col items-center justify-center text-center">
                    <Shield className="w-12 h-12 text-emerald-500/20 mb-4" />
                    <h3 className="text-xl font-black text-white mb-2">Build Your Sovereignty</h3>
                    <p className="text-sm text-gray-500 max-w-xs mb-6">
                        Transmute your weaknesses into strengths. Track sobriety from smoking, NoFap, or generic habits.
                    </p>
                    <button onClick={() => setShowStartModal(true)} className="btn-primary px-8">
                        Start New Journey
                    </button>
                </GlassCard>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-black text-white flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-400" /> Active Journeys
                        </h3>
                        <button onClick={() => setShowStartModal(true)} className="btn-ghost text-xs flex items-center gap-1">
                            <Plus className="w-3 h-3" /> New
                        </button>
                    </div>
                    {habits.map(habit => (
                        <HabitCard key={habit.id} habit={habit} />
                    ))}
                </>
            )}

            {/* Start Habit Modal */}
            <AnimatePresence>
                {showStartModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowStartModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
                            className="glass p-6 w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black text-white">Start New Journey</h3>
                                <button onClick={() => setShowStartModal(false)} className="btn-ghost p-1"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-6">
                                {(['smoking', 'nofap', 'custom'] as const).map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setNewHabitType(t)}
                                        className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${newHabitType === t ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-white/[0.02]'
                                            }`}
                                    >
                                        {t === 'smoking' && <Cigarette className={`w-5 h-5 ${newHabitType === t ? 'text-emerald-400' : 'text-gray-500'}`} />}
                                        {t === 'nofap' && <Ban className={`w-5 h-5 ${newHabitType === t ? 'text-emerald-400' : 'text-gray-500'}`} />}
                                        {t === 'custom' && <Shield className={`w-5 h-5 ${newHabitType === t ? 'text-emerald-400' : 'text-gray-500'}`} />}
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-white capitalize">{t}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block">Journey Name</label>
                                    <input
                                        type="text"
                                        value={newHabitName}
                                        onChange={(e) => setNewHabitName(e.target.value)}
                                        placeholder={newHabitType === 'smoking' ? 'Smoking Cessation' : newHabitType === 'nofap' ? 'NoFap' : 'My Habit'}
                                        className="input-field w-full"
                                    />
                                </div>

                                {newHabitType === 'smoking' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block">Cigs/Day</label>
                                            <input
                                                type="number"
                                                value={cigsPerDay}
                                                onChange={(e) => setCigsPerDay(e.target.value)}
                                                className="input-field w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block">Price per Pack</label>
                                            <input
                                                type="number"
                                                value={pricePerPack}
                                                onChange={(e) => setPricePerPack(e.target.value)}
                                                className="input-field w-full"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button onClick={handleStart} className="btn-primary w-full mt-8">
                                Begin Transmutation
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

function HabitCard({ habit }: { habit: any }) {
    const store = useTrackersStore();
    const streak = store.getHabitStreak(habit.id);
    const [showRelapseModal, setShowRelapseModal] = useState(false);

    // Smoking stats
    const savings = habit.type === 'smoking' && habit.settings ?
        ((habit.settings.cigarettesPerDay / 20) * habit.settings.costPerPack * (streak.totalMinutes / 1440)).toFixed(2) : '0';

    return (
        <GlassCard className="mb-4 overflow-hidden" glow={habit.type === 'smoking' ? 'emerald' : habit.type === 'nofap' ? 'cyan' : 'purple'}>
            <div className="p-4">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-white/5 border border-white/5`}>
                            {habit.type === 'smoking' && <CigaretteOff className="w-6 h-6 text-emerald-400" />}
                            {habit.type === 'nofap' && <Ban className="w-6 h-6 text-cyan-400" />}
                            {habit.type === 'custom' && <Shield className="w-6 h-6 text-gray-400" />}
                        </div>
                        <div>
                            <h4 className="text-base font-black text-white leading-tight">{habit.name}</h4>
                            <p className="text-[10px] text-gray-500 flex items-center gap-1 uppercase tracking-widest">
                                <History className="w-3 h-3" /> Since {new Date(habit.startDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => store.deleteHabit(habit.id)} className="p-2 text-gray-600 hover:text-rose-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="glass-subtle p-3 rounded-2xl flex flex-col items-center">
                        <p className="text-xl font-black text-white">{streak.days}</p>
                        <p className="text-[8px] text-gray-500 uppercase font-black">Days</p>
                    </div>
                    <div className="glass-subtle p-3 rounded-2xl flex flex-col items-center">
                        <p className="text-xl font-black text-white">{streak.hours}</p>
                        <p className="text-[8px] text-gray-500 uppercase font-black">Hours</p>
                    </div>
                    <div className="glass-subtle p-3 rounded-2xl flex flex-col items-center">
                        <p className="text-xl font-black text-white">{streak.minutes}</p>
                        <p className="text-[8px] text-gray-500 uppercase font-black">Minutes</p>
                    </div>
                </div>

                {habit.type === 'smoking' && (
                    <div className="flex gap-2 mb-6">
                        <div className="flex-1 glass-subtle p-3 rounded-2xl border border-emerald-500/10">
                            <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                <Coins className="w-3 h-3 text-amber-500" /> Money Saved
                            </p>
                            <p className="text-lg font-black text-white">{habit.settings.currency || '$'}{savings}</p>
                        </div>
                        <div className="flex-1 glass-subtle p-3 rounded-2xl border border-cyan-500/10">
                            <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                <CigaretteOff className="w-3 h-3 text-cyan-500" /> Cigs Not Smoked
                            </p>
                            <p className="text-lg font-black text-white">
                                {Math.floor((habit.settings.cigarettesPerDay * streak.totalMinutes) / 1440)}
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={() => store.resistUrge(habit.id)}
                        className="flex-[2] btn-primary flex items-center justify-center gap-2 py-4 shadow-lg shadow-emerald-500/20"
                    >
                        <Shield className="w-4 h-4" />
                        <span>Resist Urge</span>
                        <span className="bg-black/20 px-2 py-0.5 rounded-full text-[10px] ml-1">{habit.resistedCount}</span>
                    </button>
                    <button
                        onClick={() => setShowRelapseModal(true)}
                        className="flex-1 btn-secondary border-rose-500/20 text-rose-400 hover:bg-rose-500/5 py-4"
                    >
                        Relapsed
                    </button>
                </div>
            </div>

            {/* Relapse Modal */}
            <AnimatePresence>
                {showRelapseModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowRelapseModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="glass p-6 w-full max-w-sm border-rose-500/30"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-black text-rose-400 mb-2">Relapse Noted</h3>
                            <p className="text-sm text-gray-400 mb-6">
                                It&apos;s okay, Seeker. Each failure is a lesson on the path. Reset the timer and begin again with fresh resolve.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        store.logRelapse(habit.id);
                                        setShowRelapseModal(false);
                                    }}
                                    className="btn-primary bg-rose-500 hover:bg-rose-600 border-none flex-1"
                                >
                                    Reset Timer
                                </button>
                                <button onClick={() => setShowRelapseModal(false)} className="btn-ghost flex-1">Wait, cancel</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </GlassCard>
    );
};
