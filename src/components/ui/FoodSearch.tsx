import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Check, Loader2 } from 'lucide-react';
import { searchFoods, type FoodItem } from '../../lib/foodDatabase';
import { searchGlobalFoods } from '../../lib/foodService';
import { getAllCachedFoods } from '../../lib/aiCache';

interface FoodSearchProps {
    onAddFood: (food: FoodItem, servings: number) => void;
    className?: string;
}

export const FoodSearch: React.FC<FoodSearchProps> = ({ onAddFood, className = '' }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<FoodItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
    const [servings, setServings] = useState<Record<string, number>>({});

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!query.trim()) {
                // Return cached AI foods + some static database defaults
                const cached = getAllCachedFoods().map(f => ({ ...f, id: f.name }));
                const defaults = searchFoods('').slice(0, 10);

                // Merge, prioritizing cached foods
                const mergedMap = new Map<string, FoodItem>();
                cached.forEach(c => mergedMap.set(c.id, c));
                defaults.forEach(d => { if (!mergedMap.has(d.id)) mergedMap.set(d.id, d) });

                setResults(Array.from(mergedMap.values()));
                setIsSearching(false);
                return;
            }

            setIsSearching(true);
            try {
                // 1. Search local static DB first for instant feedback
                const localResults = searchFoods(query).slice(0, 5);

                // 2. Search global Firestore DB
                const globalResults = await searchGlobalFoods(query);

                // 3. Merge results (prefer global if duplicates, or handle ID collision)
                const mergedMap = new Map<string, FoodItem>();

                [...localResults, ...globalResults].forEach(item => {
                    // Use normalized ID or name to dedupe
                    mergedMap.set(item.id, item);
                });

                setResults(Array.from(mergedMap.values()));
            } catch (error) {
                console.error("Search error:", error);
                setResults(searchFoods(query).slice(0, 20)); // Fallback
            } finally {
                setIsSearching(false);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [query]);

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
                    placeholder="Search global foods..."
                    className="input-field pl-10 text-sm"
                />
                {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 animate-spin" />
                )}
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
                {results.length === 0 && query && !isSearching && (
                    <p className="text-sm text-gray-600 text-center py-8">No foods found for &ldquo;{query}&rdquo;</p>
                )}
            </div>
        </div>
    );
};
