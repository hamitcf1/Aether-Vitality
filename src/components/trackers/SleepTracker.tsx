import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Clock, Star, BedDouble } from 'lucide-react';
import { useTrackersStore, type SleepLog } from '../../store/trackersStore';
import { format } from 'date-fns';

export function SleepTracker() {
    const { logSleep, sleepLogs } = useTrackersStore();
    const today = format(new Date(), 'yyyy-MM-dd');
    const existingLog = sleepLogs.find(l => l.date.startsWith(today));

    const [bedTime, setBedTime] = useState(existingLog ? '23:00' : '23:00'); // Default or calculated
    const [wakeTime, setWakeTime] = useState(existingLog?.wakeTime || '07:00');

    // Calculate duration based on times
    const calculateDuration = (bed: string, wake: string) => {
        const [bedH, bedM] = bed.split(':').map(Number);
        const [wakeH, wakeM] = wake.split(':').map(Number);

        let duration = (wakeH + wakeM / 60) - (bedH + bedM / 60);
        if (duration < 0) duration += 24; // Crossed midnight
        return Number(duration.toFixed(1));
    };


    const [quality, setQuality] = useState(existingLog?.quality || 75);

    const handleSave = () => {
        const calcDur = calculateDuration(bedTime, wakeTime);
        const log: SleepLog = {
            date: new Date().toISOString(),
            durationHours: calcDur,
            quality,
            wakeTime
        };
        logSleep(log);
    };

    return (
        <div className="bg-brand-card/50 backdrop-blur-md rounded-2xl p-6 border border-white/5 space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                    <Moon size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">Sleep Tracker</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm text-zinc-400 flex items-center gap-2">
                        <BedDouble size={14} /> Bed Time
                    </label>
                    <input
                        type="time"
                        value={bedTime}
                        onChange={(e) => setBedTime(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm text-zinc-400 flex items-center gap-2">
                        <Sun size={14} /> Wake Up
                    </label>
                    <input
                        type="time"
                        value={wakeTime}
                        onChange={(e) => setWakeTime(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                </div>
            </div>

            <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Clock className="text-indigo-400" />
                    <div>
                        <div className="text-xs text-indigo-300">Duration</div>
                        <div className="text-xl font-bold text-white">{calculateDuration(bedTime, wakeTime)} hrs</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Star className="text-yellow-400" />
                    <div>
                        <div className="text-xs text-yellow-300">Quality</div>
                        <div className="text-xl font-bold text-white">{quality}%</div>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm text-zinc-400 flex justify-between">
                    <span>Sleep Quality</span>
                    <span>{quality}%</span>
                </label>
                <input
                    type="range"
                    min="1"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
            </div>

            <motion.button
                whileHover={existingLog ? {} : { scale: 1.02 }}
                whileTap={existingLog ? {} : { scale: 0.98 }}
                onClick={handleSave}
                disabled={!!existingLog}
                className={`w-full py-3 rounded-xl font-medium shadow-lg transition-colors ${existingLog
                    ? 'bg-indigo-500/50 text-white/70 cursor-not-allowed shadow-none'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
                    }`}
            >
                {existingLog ? 'Sleep Logged for Today' : 'Log Sleep'}
            </motion.button>
        </div>
    );
}
