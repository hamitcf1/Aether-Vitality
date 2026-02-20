import { useState } from 'react';
import { motion } from 'framer-motion';
import { Ruler } from 'lucide-react';
import { useTrackersStore } from '../../store/trackersStore';

export function BodyMetrics() {
    const { bodyProfile, updateBodyMeasurements } = useTrackersStore();

    // Local state for inputs
    const [neck, setNeck] = useState(bodyProfile?.measurements?.neckCm || 0);
    const [waist, setWaist] = useState(bodyProfile?.measurements?.waistCm || 0);
    const [hip, setHip] = useState(bodyProfile?.measurements?.hipCm || 0);
    const [chest, setChest] = useState(bodyProfile?.measurements?.chestCm || 0);

    // Calculate Body Fat (US Navy Method)
    const calculateBF = () => {
        if (!bodyProfile?.heightCm || !neck || !waist) return null;

        const h = bodyProfile.heightCm;
        const n = neck;
        const w = waist;
        const hips = hip;

        // Formula depends on gender
        // Men: 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
        // Women: 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450

        try {
            if (bodyProfile.gender === 'male') {
                if (w - n <= 0) return 0;
                return 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450;
            } else {
                if (w + hips - n <= 0) return 0;
                return 495 / (1.29579 - 0.35004 * Math.log10(w + hips - n) + 0.22100 * Math.log10(h)) - 450;
            }
        } catch {
            return 0;
        }
    };

    const bf = calculateBF();


    const handleSave = () => {
        updateBodyMeasurements({
            neckCm: neck,
            waistCm: waist,
            hipCm: hip,
            chestCm: chest
        });
    };

    return (
        <div className="bg-brand-card/50 backdrop-blur-md rounded-2xl p-6 border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                        <Ruler size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Body Metrics</h3>
                        <div className="text-xs text-zinc-400">US Navy Method</div>
                    </div>
                </div>
                {bf !== null && (
                    <div className="bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 text-right">
                        <div className="text-xs text-emerald-400">Body Fat Est.</div>
                        <div className="text-xl font-bold text-white">{bf.toFixed(1)}%</div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Neck (cm)" value={neck} onChange={setNeck} />
                <InputGroup label="Waist (cm)" value={waist} onChange={setWaist} />
                {bodyProfile?.gender === 'female' && (
                    <InputGroup label="Hips (cm)" value={hip} onChange={setHip} />
                )}
                <InputGroup label="Chest (cm)" value={chest} onChange={setChest} />
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/20 transition-colors"
            >
                Update Metrics
            </motion.button>
        </div>
    );
}

const InputGroup = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
    <div className="space-y-1">
        <label className="text-xs text-zinc-400">{label}</label>
        <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
            placeholder="0"
        />
    </div>
);
