import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Droplets, Footprints, Candy, Flame, Weight, Timer,
    Plus, Minus, Trash2, TrendingDown, TrendingUp,
} from 'lucide-react';
import { PageTransition } from '../components/layout/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { TabBar } from '../components/ui/TabBar';
import { CircularProgress } from '../components/ui/CircularProgress';
import { CountdownTimer } from '../components/ui/CountdownTimer';
import { FoodSearch } from '../components/ui/FoodSearch';
import { useTrackersStore } from '../store/trackersStore';
import { calculateBMI, getHealthyWeightRange } from '../lib/bmiCalculator';
import { getCaloriePlan } from '../lib/calorieCalculator';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from 'recharts';
import type { FoodItem } from '../lib/foodDatabase';

const TABS = [
    { id: 'water', label: 'Water', emoji: '💧' },
    { id: 'steps', label: 'Steps', emoji: '👟' },
    { id: 'calories', label: 'Calories', emoji: '🔥' },
    { id: 'sugar', label: 'Sugar', emoji: '🍬' },
    { id: 'weight', label: 'Weight', emoji: '⚖️' },
    { id: 'fasting', label: 'Fasting', emoji: '⏰' },
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
                    {activeTab === 'calories' && <CalorieTracker />}
                    {activeTab === 'sugar' && <SugarTracker />}
                    {activeTab === 'weight' && <WeightTracker />}
                    {activeTab === 'fasting' && <FastingTracker />}
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
    const weekData = store.waterLogs.slice(-7);

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
                <div className="flex items-end gap-2 h-24">
                    {[...Array(7)].map((_, i) => {
                        const day = weekData[weekData.length - 7 + i] || weekData[i];
                        const pct = day ? Math.min(100, (day.glasses / day.target) * 100) : 0;
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full bg-white/[0.04] rounded-full overflow-hidden h-16 relative">
                                    <motion.div
                                        className="absolute bottom-0 w-full rounded-full bg-gradient-to-t from-cyan-500 to-cyan-400"
                                        initial={{ height: 0 }}
                                        animate={{ height: `${pct}%` }}
                                        transition={{ delay: i * 0.05, duration: 0.5 }}
                                    />
                                </div>
                                <span className="text-[9px] text-gray-600">{day?.glasses || 0}</span>
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

            {/* Weekly bar chart */}
            {store.stepsLogs.length > 0 && (
                <GlassCard>
                    <h3 className="text-sm font-bold text-white mb-3">Weekly Steps</h3>
                    <ResponsiveContainer width="100%" height={140}>
                        <BarChart data={store.stepsLogs.slice(-7)}>
                            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#525252' }} axisLine={false} tickLine={false} tickFormatter={(v) => v.slice(-5)} />
                            <YAxis tick={{ fontSize: 9, fill: '#525252' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: '#111318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 12 }} />
                            <Bar dataKey="steps" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </GlassCard>
            )}
        </div>
    );
};

// ─── CALORIE TRACKER ──────────────────────────────────────────
const CalorieTracker: React.FC = () => {
    const store = useTrackersStore();
    const today = store.getTodayCalories();
    const remaining = today.target - today.consumed;
    const progress = Math.min(100, (today.consumed / today.target) * 100);
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
                <p className="text-xs text-gray-500 mt-3">Daily target: {plan?.dailyCalories || today.target} cal</p>

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
                            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#525252' }} axisLine={false} tickLine={false} tickFormatter={(v) => v.slice(-5)} />
                            <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 9, fill: '#525252' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: '#111318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 12 }} />
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
