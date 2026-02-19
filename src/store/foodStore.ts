// This store is effectively deprecated in favor of global Firestore DB.
// Keeping it to check if any other files crash, but functionality is moved.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FoodItem } from '../lib/foodDatabase';

interface FoodStoreState {
    customFoods: FoodItem[];
    addCustomFood: (food: FoodItem) => void;
    removeCustomFood: (id: string) => void;
}

export const useFoodStore = create<FoodStoreState>()(
    persist(
        (set) => ({
            customFoods: [],
            addCustomFood: (food) => set((state) => ({ customFoods: [...state.customFoods, food] })),
            removeCustomFood: (id) => set((state) => ({
                customFoods: state.customFoods.filter((f) => f.id !== id),
            })),
        }),
        {
            name: 'aether-food-store-deprecated',
        }
    )
);
