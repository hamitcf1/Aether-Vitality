import { CheckCircle2, Coins } from 'lucide-react';
import { cn } from '../../lib/cn';
import { ProgressBar } from './ProgressBar';
import type { QuestData as Quest } from '../../lib/firebaseTypes';

interface QuestCardProps {
    quest: Quest;
    onComplete?: () => void;
}

export const QuestCard: React.FC<QuestCardProps> = ({ quest, onComplete }) => (
    <div className={cn(
        'glass-subtle p-4 flex items-center gap-4 transition-all duration-200',
        quest.completed && 'opacity-50'
    )}>
        <span className="text-xl flex-shrink-0">{quest.icon}</span>
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white truncate">{quest.title}</h4>
                {quest.completed && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{quest.description}</p>
            {!quest.completed && (
                <div className="mt-2">
                    <ProgressBar value={quest.progress} max={quest.target} variant="emerald" size="sm" />
                </div>
            )}
        </div>
        <div className="text-right flex-shrink-0 flex flex-col gap-1">
            <span className="text-xs font-bold text-amber-400">+{quest.rewardXP} XP</span>
            {quest.rewardCoins > 0 && (
                <span className="text-[10px] font-bold text-emerald-400 flex items-center justify-end gap-1">
                    +{quest.rewardCoins} <Coins className="w-3 h-3" />
                </span>
            )}
            {!quest.completed && quest.progress >= quest.target && onComplete && (
                <button onClick={onComplete} className="block mt-1 text-xs font-bold text-emerald-400 hover:text-emerald-300">
                    Claim
                </button>
            )}
        </div>
    </div>
);
