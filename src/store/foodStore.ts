// This store is effectively deprecated in favor of global Firestore DB.
// Keeping it to check if any other files crash, but functionality is moved.

import { create } from 'zustand';
import type { FoodItem } from '../lib/foodDatabase';

interface FoodStoreState {
    customFoods: FoodItem[];
    addCustomFood: (food: FoodItem) => void;
    removeCustomFood: (id: string) => void;
    clearAllData: () => void;
}

export const useFoodStore = create<FoodStoreState>()((set) => ({
    customFoods: [],
    addCustomFood: (food) => set((state) => ({ customFoods: [...state.customFoods, food] })),
    removeCustomFood: (id) => set((state) => ({
        customFoods: state.customFoods.filter((f) => f.id !== id),
    })),
    clearAllData: () => set({ customFoods: [] }),
}));
