import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar, TrendingUp, Droplets, Footprints, Flame, Candy,
    Weight, Award, ChevronLeft, ChevronRight
} from 'lucide-react';
import { format, subDays, startOfWeek, addDays } from 'date-fns';
import { PageTransition } from '../components/layout/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { TabBar } from '../components/ui/TabBar';
import { CircularProgress } from '../components/ui/CircularProgress';
import { useTrackersStore } from '../store/trackersStore';
import { useAetherStore } from '../store/aetherStore';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, CartesianGrid } from 'recharts';

const REPORT_TABS = [
    { id: 'daily', label: 'Today', emoji: '📊' },
    { id: 'weekly', label: 'Weekly', emoji: '📈' },
];

export const ReportsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('daily');

    return (
        <PageTransition className="space-y-5">
            <div>
                <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">Reports</h1>
                <p className="text-sm text-gray-500 mt-1">Track your daily & weekly progression</p>
            </div>

            <TabBar tabs={REPORT_TABS} activeTab={activeTab} onChange={setActiveTab} />

            {activeTab === 'daily' ? <DailyReport /> : <WeeklyReport />}
        </PageTransition>
    );
};

// ─── DAILY REPORT ────────────────────────────────────────────
const DailyReport: React.FC = () => {
    const trackers = useTrackersStore();
    const aether = useAetherStore();
    const water = trackers.getTodayWater();
    const steps = trackers.getTodaySteps();
    const cals = trackers.getTodayCalories();
    const sugar = trackers.getTodaySugar();

    const metrics = [
        {
            label: 'Water',
            icon: Droplets,
            emoji: '💧',
            value: water.glasses,
            target: water.target,
            unit: 'glasses',
            color: '#06b6d4',
        },
        {
            label: 'Steps',
            icon: Footprints,
            emoji: '👟',
            value: steps.steps,
            target: steps.target,
            unit: 'steps',
            color: '#10b981',
        },
        {
            label: 'Calories',
            icon: Flame,
            emoji: '🔥',
            value: cals.consumed,
            target: cals.target,
            unit: 'cal',
            color: '#f59e0b',
        },
        {
            label: 'Sugar',
            icon: Candy,
            emoji: '🍬',
            value: sugar.grams,
            target: sugar.target,
            unit: 'g',
            color: '#8b5cf6',
            inverse: true, // lower is better
        },
    ];

    // Overall score
    const scores = metrics.map((m) => {
        if (m.inverse) {
            return m.value <= m.target ? 100 : Math.max(0, (1 - (m.value - m.target) / m.target) * 100);
        }
        return Math.min(100, (m.value / m.target) * 100);
    });
    const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    return (
        <div className="space-y-4">
            {/* Overall Score */}
            <GlassCard className="flex flex-col items-center py-6" glow="emerald">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Today&apos;s Health Score</p>
                <CircularProgress
                    value={overallScore}
                    size={140}
                    strokeWidth={10}
                    color={overallScore >= 80 ? '#10b981' : overallScore >= 50 ? '#f59e0b' : '#f43f5e'}
                    label={`${overallScore}%`}
                    sublabel="Overall"
                    icon={<Award className="w-5 h-5 text-emerald-400" />}
                />
                <p className="text-xs text-gray-600 mt-3">
                    {overallScore >= 80 ? '🏆 Outstanding day!' : overallScore >= 50 ? '💪 Good progress, keep going!' : '🌟 Every bit counts, keep pushing!'}
                </p>
            </GlassCard>

            {/* Individual metrics */}
            <div className="grid grid-cols-2 gap-3">
                {metrics.map((m) => {
                    const pct = m.inverse
                        ? (m.value <= m.target ? 100 : Math.max(0, (1 - (m.value - m.target) / m.target) * 100))
                        : Math.min(100, (m.value / m.target) * 100);
                    return (
                        <GlassCard key={m.label} className="flex flex-col items-center py-4">
                            <CircularProgress
                                value={pct}
                                size={80}
                                strokeWidth={6}
                                color={m.color}
                                label={`${m.value}`}
                                sublabel={m.unit}
                            />
                            <p className="text-xs font-bold text-white mt-2">{m.emoji} {m.label}</p>
                            <p className="text-[10px] text-gray-600">{m.value} / {m.target} {m.unit}</p>
                        </GlassCard>
                    );
                })}
            </div>

            {/* Quick stats */}
            <GlassCard>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Quick Stats
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    <div className="glass-subtle p-3 text-center rounded-xl">
                        <p className="text-lg font-black text-amber-400">{aether.streak}</p>
                        <p className="text-[9px] text-gray-500 uppercase">Streak</p>
                    </div>
                    <div className="glass-subtle p-3 text-center rounded-xl">
                        <p className="text-lg font-black text-emerald-400">{aether.level}</p>
                        <p className="text-[9px] text-gray-500 uppercase">Level</p>
                    </div>
                    <div className="glass-subtle p-3 text-center rounded-xl">
                        <p className="text-lg font-black text-cyan-400">{aether.xp}</p>
                        <p className="text-[9px] text-gray-500 uppercase">XP</p>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

// ─── WEEKLY REPORT ───────────────────────────────────────────
const WeeklyReport: React.FC = () => {
    const trackers = useTrackersStore();
    const [weekOffset, setWeekOffset] = useState(0);

    const weekStart = startOfWeek(subDays(new Date(), weekOffset * 7), { weekStartsOn: 1 });
    const weekDates = Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), 'yyyy-MM-dd'));
    const weekLabel = `${format(weekStart, 'MMM d')} – ${format(addDays(weekStart, 6), 'MMM d')}`;

    const weeklyData = useMemo(() => {
        return weekDates.map((date) => {
            const w = trackers.waterLogs.find((l) => l.date === date);
            const s = trackers.stepsLogs.find((l) => l.date === date);
            const c = trackers.calorieLogs.find((l) => l.date === date);
            const su = trackers.sugarLogs.find((l) => l.date === date);
            return {
                date: date.slice(-5),
                water: w?.glasses || 0,
                steps: s?.steps || 0,
                calories: c?.consumed || 0,
                sugar: su?.grams || 0,
            };
        });
    }, [weekDates, trackers.waterLogs, trackers.stepsLogs, trackers.calorieLogs, trackers.sugarLogs]);

    // Weekly totals
    const totals = weeklyData.reduce(
        (acc, d) => ({
            water: acc.water + d.water,
            steps: acc.steps + d.steps,
            calories: acc.calories + d.calories,
            sugar: acc.sugar + d.sugar,
        }),
        { water: 0, steps: 0, calories: 0, sugar: 0 }
    );

    return (
        <div className="space-y-4">
            {/* Week navigation */}
            <div className="flex items-center justify-between">
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setWeekOffset((o) => o + 1)} className="btn-ghost p-2">
                    <ChevronLeft className="w-5 h-5" />
                </motion.button>
                <span className="text-sm font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400" /> {weekLabel}
                </span>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setWeekOffset((o) => Math.max(0, o - 1))}
                    disabled={weekOffset === 0}
                    className="btn-ghost p-2"
                >
                    <ChevronRight className="w-5 h-5" />
                </motion.button>
            </div>

            {/* Weekly totals */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                    { label: 'Water', value: `${totals.water} glasses`, emoji: '💧', color: 'text-cyan-400' },
                    { label: 'Steps', value: totals.steps.toLocaleString(), emoji: '👟', color: 'text-emerald-400' },
                    { label: 'Calories', value: `${totals.calories.toLocaleString()} cal`, emoji: '🔥', color: 'text-amber-400' },
                    { label: 'Sugar', value: `${totals.sugar}g`, emoji: '🍬', color: 'text-violet-400' },
                ].map((t) => (
                    <div key={t.label} className="glass-subtle p-3 text-center rounded-xl">
                        <p className="text-lg">{t.emoji}</p>
                        <p className={`text-sm font-black ${t.color}`}>{t.value}</p>
                        <p className="text-[9px] text-gray-500 uppercase">{t.label}</p>
                    </div>
                ))}
            </div>

            {/* Water chart */}
            <GlassCard>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-cyan-400" /> Water Intake
                </h3>
                <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={weeklyData}>
                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#525252' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: '#525252' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#111318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 12 }} />
                        <Bar dataKey="water" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </GlassCard>

            {/* Steps chart */}
            <GlassCard>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Footprints className="w-4 h-4 text-emerald-400" /> Steps
                </h3>
                <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={weeklyData}>
                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#525252' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: '#525252' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#111318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 12 }} />
                        <Bar dataKey="steps" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </GlassCard>

            {/* Calories & Sugar combined line chart */}
            <GlassCard>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" /> Calories & Sugar
                </h3>
                <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#525252' }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="cal" tick={{ fontSize: 9, fill: '#525252' }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="sugar" orientation="right" tick={{ fontSize: 9, fill: '#525252' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#111318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 12 }} />
                        <Line yAxisId="cal" type="monotone" dataKey="calories" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} />
                        <Line yAxisId="sugar" type="monotone" dataKey="sugar" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: '#8b5cf6' }} />
                    </LineChart>
                </ResponsiveContainer>
            </GlassCard>

            {/* Weight trend (if available) */}
            {trackers.weightLog.length > 1 && (
                <GlassCard>
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <Weight className="w-4 h-4 text-emerald-400" /> Weight Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={140}>
                        <LineChart data={trackers.weightLog.slice(-14)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#525252' }} axisLine={false} tickLine={false} tickFormatter={(v) => v.slice(-5)} />
                            <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 9, fill: '#525252' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: '#111318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 12 }} />
                            <Line type="monotone" dataKey="weightKg" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </GlassCard>
            )}
        </div>
    );
};
