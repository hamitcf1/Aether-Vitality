import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Check } from 'lucide-react';
import { searchFoods, type FoodItem } from '../../lib/foodDatabase';

interface FoodSearchProps {
    onAddFood: (food: FoodItem, servings: number) => void;
    className?: string;
}

export const FoodSearch: React.FC<FoodSearchProps> = ({ onAddFood, className = '' }) => {
    const [query, setQuery] = useState('');
    const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
    const [servings, setServings] = useState<Record<string, number>>({});

    const results = useMemo(() => searchFoods(query).slice(0, 20), [query]);

    const handleAdd = (food: FoodItem) => {
        const s = servings[food.id] || 1;
        onAddFood(food, s);
        setAddedIds((prev) => new Set(prev).add(food.id));
        setTimeout(() => {
            setAddedIds((prev) => {
                const next = new Set(prev);
                next.delete(food.id);
                return next;
            });
        }, 1500);
    };

    return (
        <div className={className}>
            {/* Search input */}
            <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search foods..."
                    className="input-field pl-10 text-sm"
                />
            </div>

            {/* Results */}
            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                <AnimatePresence mode="popLayout">
                    {results.map((food) => {
                        const isAdded = addedIds.has(food.id);
                        return (
                            <motion.div
                                key={food.id}
                                layout
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="glass-subtle p-3 flex items-center gap-3 group"
                            >
                                <span className="text-xl flex-shrink-0">{food.emoji}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">{food.name}</p>
                                    <p className="text-[10px] text-gray-500">
                                        {food.calories} cal · {food.sugar}g sugar · {food.protein}g protein · {food.servingSize}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <select
                                        value={servings[food.id] || 1}
                                        onChange={(e) => setServings((s) => ({ ...s, [food.id]: Number(e.target.value) }))}
                                        className="bg-white/[0.04] border border-white/[0.08] text-white text-xs rounded-lg px-1.5 py-1 cursor-pointer"
                                    >
                                        {[0.5, 1, 1.5, 2, 3].map((v) => (
                                            <option key={v} value={v} className="bg-gray-900">{v}×</option>
                                        ))}
                                    </select>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleAdd(food)}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer ${isAdded
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] hover:text-white'
                                            }`}
                                    >
                                        {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                    </motion.button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                {results.length === 0 && query && (
                    <p className="text-sm text-gray-600 text-center py-8">No foods found for &ldquo;{query}&rdquo;</p>
                )}
            </div>
        </div>
    );
};
