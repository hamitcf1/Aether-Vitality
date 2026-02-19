import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Coins, Check, Zap, Shield, Palette } from 'lucide-react';
import { useAetherStore } from '../store/aetherStore';
import { SHOP_ITEMS } from '../lib/ShopData';
import type { ShopItem, ShopCategory } from '../lib/ShopData';

export const ShopPage: React.FC = () => {
    const { coins, inventory, equipped, purchaseItem, equipItem } = useAetherStore();
    const [activeTab, setActiveTab] = useState<ShopCategory | 'all'>('all');
    const [purchaseStatus, setPurchaseStatus] = useState<{ id: string, status: 'success' | 'error' } | null>(null);

    const categories: { id: ShopCategory | 'all', label: string, icon: any }[] = [
        { id: 'all', label: 'All Items', icon: ShoppingBag },
        { id: 'theme', label: 'Themes', icon: Palette },
        { id: 'boost', label: 'Boosts', icon: Zap },
        { id: 'utility', label: 'Utility', icon: Shield },
    ];

    const filteredItems = activeTab === 'all'
        ? SHOP_ITEMS
        : SHOP_ITEMS.filter(item => item.category === activeTab);

    const handlePurchase = (item: ShopItem) => {
        const success = purchaseItem(item.id);
        if (success) {
            setPurchaseStatus({ id: item.id, status: 'success' });
            setTimeout(() => setPurchaseStatus(null), 2000);
        } else {
            setPurchaseStatus({ id: item.id, status: 'error' });
            setTimeout(() => setPurchaseStatus(null), 2000);
        }
    };

    return (
        <div className="min-h-screen pb-20 pt-8 px-4 max-w-4xl mx-auto">
            {/* Header / Balance */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <ShoppingBag className="w-8 h-8 text-emerald-400" />
                        Aether Shop
                    </h1>
                    <p className="text-gray-400 mt-1">Spend your hard-earned coins on artifacts and themes.</p>
                </div>

                <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                        <Coins className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <p className="text-xs text-amber-500/80 font-bold uppercase tracking-wider">Balance</p>
                        <p className="text-2xl font-black text-white">{coins.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto gap-2 mb-8 pb-2 no-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveTab(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                            ${activeTab === cat.id
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                : 'glass text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <cat.icon className="w-4 h-4" />
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode='popLayout'>
                    {filteredItems.map(item => {
                        const isOwned = inventory.includes(item.id);
                        const isEquipped = item.category === 'theme' && equipped.theme === item.value;
                        const canAfford = coins >= item.cost;
                        const isBoost = item.category === 'boost';

                        return (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`glass p-5 relative overflow-hidden group ${isEquipped ? 'border-emerald-500/50 shadow-glow-sm' : ''}`}
                            >
                                {/* Background glow for themes */}
                                {item.category === 'theme' && (
                                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-${item.value === 'cyberpunk' ? 'pink-500' : item.value === 'gold' ? 'amber-500' : 'emerald-500'}/10 to-transparent blur-2xl rounded-bl-full pointer-events-none transition-opacity opacity-50 group-hover:opacity-100`} />
                                )}

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl border border-white/10 group-hover:scale-110 transition-transform">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{item.name}</h3>
                                            <p className="text-xs text-emerald-400 uppercase font-black tracking-wider">{item.category}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1.5 justify-end text-amber-400 font-bold">
                                            <Coins className="w-4 h-4" />
                                            {item.cost}
                                        </div>
                                        {purchaseStatus?.id === item.id && (
                                            <motion.span
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className={`text-xs ${purchaseStatus.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}
                                            >
                                                {purchaseStatus.status === 'success' ? 'Purchased!' : 'Not enough coins'}
                                            </motion.span>
                                        )}
                                    </div>
                                </div>

                                <p className="text-sm text-gray-400 mb-6 relative z-10 h-10 line-clamp-2">
                                    {item.description}
                                </p>

                                <div className="flex gap-2 relative z-10">
                                    {isOwned && !isBoost ? (
                                        item.category === 'theme' ? (
                                            <button
                                                onClick={() => equipItem(item.id, 'theme')}
                                                disabled={isEquipped}
                                                className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all
                                                    ${isEquipped
                                                        ? 'bg-emerald-500/20 text-emerald-400 cursor-default border border-emerald-500/20'
                                                        : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}
                                            >
                                                {isEquipped ? <><Check className="w-4 h-4" /> Active</> : 'Equip'}
                                            </button>
                                        ) : (
                                            <button disabled className="flex-1 py-2.5 rounded-xl bg-white/5 text-gray-500 font-bold text-sm cursor-default border border-white/5">
                                                Owned
                                            </button>
                                        )
                                    ) : (
                                        <button
                                            onClick={() => handlePurchase(item)}
                                            disabled={!canAfford}
                                            className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all
                                                ${canAfford
                                                    ? 'bg-white/5 hover:bg-emerald-500 hover:text-white text-emerald-400 border border-emerald-500/30'
                                                    : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'}`}
                                        >
                                            {isBoost && isOwned ? 'Buy Again' : 'Purchase'}
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            <div className="mt-12 text-center">
                <button onClick={() => equipItem('default', 'theme')} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                    Reset to Default Theme
                </button>
            </div>
        </div>
    );
};
