import { create } from 'zustand';
import { saveToFirestore, loadFromFirestore } from '../lib/firestoreSync';

export interface JournalEntry {
    id: string;
    date: string;
    content: string;
    mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
    tags: string[];
    factors?: string[]; // e.g. Work, Family, Sleep, Diet
    sleepQuality?: number; // 0-100, synced from Sleep Log or manually entered
    productivity?: number; // 1-5
}

export interface MeditationSession {
    id: string;
    date: string;
    durationSeconds: number;
    type: 'breathing' | 'guided' | 'silent';
}

interface JournalState {
    _uid: string | null;
    entries: JournalEntry[];
    meditationHistory: MeditationSession[];

    addEntry: (entry: Omit<JournalEntry, 'id'>) => void;
    deleteEntry: (id: string) => void;

    logMeditation: (session: Omit<MeditationSession, 'id'>) => void;

    getTotalMeditationMinutes: () => number;
    getStreak: () => number;

    loadData: (uid: string) => Promise<void>;
    clearAllData: () => void;
}

const DATA_KEYS = ['entries', 'meditationHistory'] as const;

function getDataSnapshot(state: JournalState): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    for (const key of DATA_KEYS) { data[key] = state[key]; }
    return data;
}

function autoSave(get: () => JournalState) {
    const state = get();
    if (state._uid) saveToFirestore(state._uid, 'journal', getDataSnapshot(state));
}

export const useJournalStore = create<JournalState>()((set, get) => ({
    _uid: null,
    entries: [],
    meditationHistory: [],

    loadData: async (userUid) => {
        set({ _uid: userUid });
        const data = await loadFromFirestore(userUid, 'journal');
        if (data) {
            const patch: Record<string, unknown> = {};
            for (const key of DATA_KEYS) {
                if (data[key] !== undefined) patch[key] = data[key];
            }
            set(patch as Partial<JournalState>);
        }
    },

    addEntry: (entry) => {
        const newEntry = { ...entry, id: `journal_${Date.now()}` };
        set((state) => ({ entries: [newEntry, ...state.entries] }));
        autoSave(get);
    },

    deleteEntry: (id) => {
        set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }));
        autoSave(get);
    },

    logMeditation: (session) => {
        const newSession = { ...session, id: `med_${Date.now()}` };
        set((state) => ({ meditationHistory: [newSession, ...state.meditationHistory] }));
        autoSave(get);
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
    },

    clearAllData: () => set({
        _uid: null,
        entries: [],
        meditationHistory: [],
    }),
}));
