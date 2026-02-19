export type ShopCategory = 'theme' | 'boost' | 'cosmetic' | 'utility';

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    category: ShopCategory;
    cost: number;
    icon: string;
    // For themes, this matches the CSS class or theme ID
    value?: string;
    // For boosts, duration in hours
    durationHours?: number;
}

export const SHOP_ITEMS: ShopItem[] = [
    // ── Themes ──
    {
        id: 'theme_midnight',
        name: 'Midnight Aura',
        description: 'A deep, mysterious dark theme with violet accents.',
        category: 'theme',
        cost: 500,
        icon: '🌙',
        value: 'midnight'
    },
    {
        id: 'theme_aurora',
        name: 'Aurora Borealis',
        description: 'Shimmering greens and blues like the northern lights.',
        category: 'theme',
        cost: 1000,
        icon: '🌌',
        value: 'aurora'
    },
    {
        id: 'theme_cyberpunk',
        name: 'Neon City',
        description: 'High contrast pinks and cyans for the digital rebel.',
        category: 'theme',
        cost: 1500,
        icon: '🌆',
        value: 'cyberpunk'
    },
    {
        id: 'theme_zen',
        name: 'Zen Garden',
        description: 'Calming nature tones for peaceful focus.',
        category: 'theme',
        cost: 500,
        icon: '🎋',
        value: 'zen'
    },
    {
        id: 'theme_gold',
        name: 'Midas Touch',
        description: 'Luxurious gold and black for the elite.',
        category: 'theme',
        cost: 5000,
        icon: '👑',
        value: 'gold'
    },

    // ── Utility ──
    {
        id: 'streak_freeze',
        name: 'Chronos Shield',
        description: 'Protects your streak for one missed day. Consumed on use.',
        category: 'utility',
        cost: 300,
        icon: '🛡️',
    },
    {
        id: 'xp_boost_24h',
        name: 'Elixir of Wisdom',
        description: 'Gain 2x XP for the next 24 hours.',
        category: 'boost',
        cost: 400,
        icon: '🧪',
        durationHours: 24
    },
    {
        id: 'coin_magnet_24h',
        name: 'Coin Magnet',
        description: 'Gain 1.5x Coins for the next 24 hours.',
        category: 'boost',
        cost: 400,
        icon: '🧲',
        durationHours: 24
    }
];
