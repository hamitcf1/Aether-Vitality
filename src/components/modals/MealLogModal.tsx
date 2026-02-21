import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Search, Sparkles, Utensils,
    ArrowRight, Plus, Check, History
} from 'lucide-react';
import { cn } from '../../lib/cn';
import { searchFoods, PORTIONS } from '../../lib/foodDatabase';
import type { FoodItem } from '../../lib/foodDatabase';
import { searchGlobalFoods } from '../../lib/foodService';
import { analyzeMeal, calculateHealthImpact } from '../../lib/aiFoodAnalyzer';

interface MealLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLog: (meal: string, hpImpact: number, advice: string, items: any[]) => void;
    aiTokens: number;
    recentMeals?: any[];
}

type Tab = 'search' | 'ai' | 'recent';

export const MealLogModal: React.FC<MealLogModalProps> = ({ isOpen, onClose, onLog, aiTokens, recentMeals = [] }) => {
    const [activeTab, setActiveTab] = useState<Tab>('search');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedItems, setSelectedItems] = useState<{ food: FoodItem, multiplier: number }[]>([]);
    const [aiInput, setAiInput] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Search Logic
    const handleSearch = useCallback(async (val: string) => {
        setSearchQuery(val);
        if (val.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        // Search local database
        const local = searchFoods(val);
        // Search global database (Firestore)
        const global = await searchGlobalFoods(val);

        // Merge and deduplicate
        const merged = [...local];
        global.forEach(g => {
            if (!merged.find(m => m.id === g.id)) {
                merged.push(g);
            }
        });

        setSearchResults(merged.slice(0, 8));
        setIsSearching(false);
    }, []);

    const addItem = (food: FoodItem) => {
        setSelectedItems(prev => [...prev, { food, multiplier: 1 }]);
        setSearchQuery('');
        setSearchResults([]);
    };

    const removeItem = (index: number) => {
        setSelectedItems(prev => prev.filter((_, i) => i !== index));
    };

    const updateMultiplier = (index: number, multiplier: number) => {
        setSelectedItems(prev => prev.map((item, i) => i === index ? { ...item, multiplier } : item));
    };

    const totals = useMemo(() => {
        return selectedItems.reduce((acc, current) => {
            const m = current.multiplier;
            return {
                calories: acc.calories + (current.food.calories * m),
                protein: acc.protein + ((current.food.protein || 0) * m),
                carbs: acc.carbs + ((current.food.carbs || 0) * m),
                fat: acc.fat + ((current.food.fat || 0) * m),
                sugar: acc.sugar + ((current.food.sugar || 0) * m),
            };
        }, { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 });
    }, [selectedItems]);

    const handleAILog = async () => {
        if (!aiInput.trim() || aiTokens < 1) return;
        setIsAnalyzing(true);
        try {
            const result = await analyzeMeal(aiInput);
            if (result) {
                const impact = calculateHealthImpact(result.healthScore);
                onLog(
                    aiInput,
                    impact.hpImpact,
                    result.advice,
                    result.items.map(item => ({
                        name: item.name,
                        emoji: item.emoji || '🍽️',
                        calories: item.calories,
                        sugar: item.sugar,
                        protein: item.protein,
                        carbs: item.carbs,
                        fat: item.fat,
                        servings: item.quantity || 1
                    }))
                );
                onClose();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleManualLog = () => {
        if (selectedItems.length === 0) return;
        const mealName = selectedItems.length === 1
            ? selectedItems[0].food.name
            : `${selectedItems.length} items logged`;

        // Simple heuristic for health score based on items
        const avgHealthScore = 7;
        const impact = calculateHealthImpact(avgHealthScore);

        onLog(
            mealName,
            impact.hpImpact,
            `Energy restored with ${mealName}. Keep it up!`,
            selectedItems.map(item => ({
                name: item.food.name,
                emoji: item.food.emoji,
                calories: item.food.calories,
                sugar: item.food.sugar,
                protein: item.food.protein || 0,
                carbs: item.food.carbs || 0,
                fat: item.food.fat || 0,
                servings: item.multiplier
            }))
        );
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 20, opacity: 0 }}
                    className="glass border-white/10 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 flex items-center justify-center">
                                <Utensils className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight">Sustenance Log</h3>
                                <p className="text-xs text-gray-500 font-medium">Record your nutritional intake</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/5 rounded-full transition-colors group"
                        >
                            <X className="w-5 h-5 text-gray-500 group-hover:text-white" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex px-6 border-b border-white/5 bg-white/[0.01]">
                        <button
                            onClick={() => setActiveTab('search')}
                            className={cn(
                                "px-4 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all",
                                activeTab === 'search' ? "border-emerald-500 text-emerald-400" : "border-transparent text-gray-500 hover:text-gray-300"
                            )}
                        >
                            Discovery
                        </button>
                        <button
                            onClick={() => setActiveTab('ai')}
                            className={cn(
                                "px-4 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2",
                                activeTab === 'ai' ? "border-purple-500 text-purple-400" : "border-transparent text-gray-500 hover:text-gray-300"
                            )}
                        >
                            <Sparkles className="w-3 h-3" /> Oracle Analysis
                        </button>
                        <button
                            onClick={() => setActiveTab('recent')}
                            className={cn(
                                "px-4 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all",
                                activeTab === 'recent' ? "border-cyan-500 text-cyan-400" : "border-transparent text-gray-500 hover:text-gray-300"
                            )}
                        >
                            Recent
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {activeTab === 'search' && (
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Search 10,000+ items..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                    {isSearching && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full"
                                            />
                                        </div>
                                    )}
                                </div>

                                {searchResults.length > 0 && (
                                    <div className="grid grid-cols-1 gap-2">
                                        {searchResults.map(food => (
                                            <button
                                                key={food.id}
                                                onClick={() => addItem(food)}
                                                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">{food.emoji}</span>
                                                    <div className="text-left">
                                                        <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{food.name}</p>
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{food.calories} kcal • {food.servingSize}</p>
                                                    </div>
                                                </div>
                                                <Plus className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-all" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'ai' && (
                            <div className="space-y-4">
                                <div className="glass-subtle p-4 rounded-2xl space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                            <Sparkles className="w-4 h-4 text-purple-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">Oracle Vision</p>
                                            <p className="text-sm text-gray-400">Describe your entire meal in plain language.</p>
                                        </div>
                                    </div>
                                    <textarea
                                        value={aiInput}
                                        onChange={(e) => setAiInput(e.target.value)}
                                        placeholder="e.g. '3 scrambled eggs with a slice of whole wheat toast...'"
                                        className="w-full bg-black/20 border border-white/5 rounded-xl p-4 text-sm text-white h-32 focus:outline-none focus:border-purple-500/30 transition-all resize-none"
                                    />
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Cost: 1 Essence</span>
                                        </div>
                                        <button
                                            onClick={handleAILog}
                                            disabled={isAnalyzing || !aiInput.trim() || aiTokens < 1}
                                            className="btn-primary bg-purple-600 hover:bg-purple-500 flex items-center gap-2 py-2 px-6"
                                        >
                                            {isAnalyzing ? "Analyzing..." : "Divine Essence"}
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'recent' && (
                            <div className="space-y-4">
                                {recentMeals.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-2">
                                        {recentMeals.slice(0, 10).map((meal, idx) => (
                                            <button
                                                key={`${meal.id}-${idx}`}
                                                onClick={() => {
                                                    onLog(meal.meal, meal.hpImpact, meal.advice || `Nourished with ${meal.meal} again.`, []);
                                                    onClose();
                                                }}
                                                className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                                        <History className="w-4 h-4 text-cyan-400" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{meal.meal}</p>
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                                                            {new Date(meal.timestamp).toLocaleDateString()} • {meal.hpImpact >= 0 ? '+' : ''}{meal.hpImpact} HP
                                                        </p>
                                                    </div>
                                                </div>
                                                <Plus className="w-4 h-4 text-cyan-500 opacity-0 group-hover:opacity-100 transition-all" />
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <History className="w-8 h-8 text-gray-600 mb-3" />
                                        <p className="text-sm font-bold text-gray-400">No History Found</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Current Selection */}
                        {selectedItems.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Current Log</h4>
                                    <button onClick={() => setSelectedItems([])} className="text-[10px] font-bold text-rose-400 uppercase">Clear</button>
                                </div>
                                <div className="space-y-3">
                                    {selectedItems.map((item, idx) => (
                                        <div key={`${item.food.id}-${idx}`} className="glass-subtle p-4 rounded-2xl border-white/5 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">{item.food.emoji}</span>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{item.food.name}</p>
                                                        <p className="text-[10px] text-gray-500">{Math.round(item.food.calories * item.multiplier)} kcal</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => removeItem(idx)} className="text-rose-500/40 hover:text-rose-500 transition-colors">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-4 gap-2">
                                                {PORTIONS.map(p => (
                                                    <button
                                                        key={p.label}
                                                        onClick={() => updateMultiplier(idx, p.multiplier)}
                                                        className={cn(
                                                            "px-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                                            item.multiplier === p.multiplier
                                                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                                                : "bg-white/5 border-transparent text-gray-500 hover:bg-white/10"
                                                        )}
                                                    >
                                                        {p.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Summary */}
                    {selectedItems.length > 0 && (
                        <div className="p-6 bg-white/[0.03] border-t border-white/5 space-y-6">
                            <div className="grid grid-cols-4 gap-4 text-center">
                                <div>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Kcal</p>
                                    <p className="text-sm font-black text-white">{Math.round(totals.calories)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Protein</p>
                                    <p className="text-sm font-black text-emerald-400">{Math.round(totals.protein)}g</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Carbs</p>
                                    <p className="text-sm font-black text-cyan-400">{Math.round(totals.carbs)}g</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sugar</p>
                                    <p className="text-sm font-black text-rose-400">{Math.round(totals.sugar)}g</p>
                                </div>
                            </div>
                            <button
                                onClick={handleManualLog}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3"
                            >
                                <Check className="w-4 h-4" /> Finalize Transmutation
                            </button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
