import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface JournalEntry {
    id: string;
    date: string;
    content: string;
    mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
    tags: string[];
}

export interface MeditationSession {
    id: string;
    date: string;
    durationSeconds: number;
    type: 'breathing' | 'guided' | 'silent';
}

interface JournalState {
    entries: JournalEntry[];
    meditationHistory: MeditationSession[];

    addEntry: (entry: Omit<JournalEntry, 'id'>) => void;
    deleteEntry: (id: string) => void;

    logMeditation: (session: Omit<MeditationSession, 'id'>) => void;

    getTotalMeditationMinutes: () => number;
    getStreak: () => number;
}

export const useJournalStore = create<JournalState>()(
    persist(
        (set, get) => ({
            entries: [],
            meditationHistory: [],

            addEntry: (entry) => {
                const newEntry = { ...entry, id: `journal_${Date.now()}` };
                set((state) => ({ entries: [newEntry, ...state.entries] }));
            },

            deleteEntry: (id) => {
                set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }));
            },

            logMeditation: (session) => {
                const newSession = { ...session, id: `med_${Date.now()}` };
                set((state) => ({ meditationHistory: [newSession, ...state.meditationHistory] }));
            },

            getTotalMeditationMinutes: () => {
                const totalSeconds = get().meditationHistory.reduce((acc, curr) => acc + curr.durationSeconds, 0);
                return Math.floor(totalSeconds / 60);
            },

            getStreak: () => {
                const entries = get().entries;
                if (entries.length === 0) return 0;

                const sortedDates = [...new Set(entries.map(e => e.date.split('T')[0]))].sort().reverse();
                const today = new Date().toISOString().split('T')[0];
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

                if (sortedDates[0] !== today && sortedDates[0] !== yesterday) return 0;

                let streak = 1;
                let currentDate = new Date(sortedDates[0]);

                for (let i = 1; i < sortedDates.length; i++) {
                    const prevDate = new Date(currentDate);
                    prevDate.setDate(prevDate.getDate() - 1);
                    const prevDateStr = prevDate.toISOString().split('T')[0];

                    if (sortedDates[i] === prevDateStr) {
                        streak++;
                        currentDate = prevDate;
                    } else {
                        break;
                    }
                }

                return streak;
            }
        }),
        { name: 'aether-journal-store' }
    )
);
