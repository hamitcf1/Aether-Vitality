import React from 'react';
import { motion } from 'framer-motion';

interface Tab {
    id: string;
    label: string;
    icon?: React.ReactNode;
    emoji?: string;
}

interface TabBarProps {
    tabs: Tab[];
    activeTab: string;
    onChange: (id: string) => void;
    className?: string;
}

export const TabBar: React.FC<TabBarProps> = ({ tabs, activeTab, onChange, className = '' }) => {
    return (
        <div
            className={`flex gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-x-auto no-scrollbar ${className}`}
        >
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors duration-200 cursor-pointer ${activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                        }`}
                >
                    {activeTab === tab.id && (
                        <motion.div
                            layoutId="tab-active"
                            className="absolute inset-0 rounded-xl bg-white/[0.08] border border-white/[0.1]"
                            transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
                        />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                        {tab.emoji && <span>{tab.emoji}</span>}
                        {tab.icon}
                        {tab.label}
                    </span>
                </button>
            ))}
        </div>
    );
};
