export type ShopCategory = 'theme' | 'boost' | 'cosmetic' | 'utility' | 'banner' | 'effect';

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    category: ShopCategory;
    cost: number;
    icon: string;
    // For themes/effects, this matches the CSS class or ID
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
        id: 'theme_gold',
        name: 'Midas Touch',
        description: 'Luxurious gold and black for the elite.',
        category: 'theme',
        cost: 5000,
        icon: '👑',
        value: 'gold'
    },

    // ── Banners ──
    {
        id: 'banner_standard',
        name: 'Seeker Banner',
        description: 'A simple, clean banner for the beginning of your journey.',
        category: 'banner',
        cost: 200,
        icon: '🚩',
        value: 'bg-gradient-to-r from-gray-800 to-gray-900'
    },
    {
        id: 'banner_emerald',
        name: 'Emerald Overlord',
        description: 'A glowing emerald banner for the disciplined.',
        category: 'banner',
        cost: 1200,
        icon: '🐍',
        value: 'bg-gradient-to-r from-emerald-900/80 to-emerald-600/40 border-l-4 border-emerald-400'
    },
    {
        id: 'banner_cosmic',
        name: 'Cosmic Traveler',
        description: 'The swirling stars accompany your every move.',
        category: 'banner',
        cost: 2500,
        icon: '✨',
        value: 'bg-gradient-to-r from-indigo-950 via-purple-900 to-indigo-950 animate-gradient-shift'
    },

    // ── Effects & Names ──
    {
        id: 'effect_glow_cyan',
        name: 'Cyan Resonance',
        description: 'Your name pulses with a biological blue glow.',
        category: 'effect',
        cost: 800,
        icon: '❄️',
        value: 'neon-text-cyan animate-glow-pulse'
    },
    {
        id: 'effect_glow_emerald',
        name: 'Vitality Core',
        description: 'A vibrant green aura follows your interactions.',
        category: 'effect',
        cost: 1500,
        icon: '🍀',
        value: 'neon-text-emerald'
    },

    // ── Emojis & Titles ──
    {
        id: 'cosmetic_emoji_dragon',
        name: 'Aether Dragon',
        description: 'A rare emoji to show your true power.',
        category: 'cosmetic',
        cost: 1000,
        icon: '🐉',
        value: '🐉'
    },
    {
        id: 'cosmetic_emoji_crown',
        name: 'Vanguard Crown',
        description: 'The ultimate mark of a champion.',
        category: 'cosmetic',
        cost: 3000,
        icon: '👑',
        value: '👑'
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
