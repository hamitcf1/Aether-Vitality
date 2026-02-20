export const PackageTier = {
    NOVICE: 'novice',
    GUARDIAN: 'guardian',
    AETHERIUS: 'aetherius', // VIP/Admin
} as const;

export type PackageTier = typeof PackageTier[keyof typeof PackageTier];

export interface PackageFeatures {
    name: string;
    features: string[];
    canAccessAI: boolean;
    canAccessReports: boolean;
    canAccessGamification: boolean;
    canAccessJournal: boolean;
    canAccessMeditation: boolean;
    maxTrackers: number;
    maxAiTokens: number;
}

export const PACKAGES: Record<PackageTier, PackageFeatures> = {
    [PackageTier.NOVICE]: {
        name: 'Aether Novice',
        features: ['5 Daily AI Tokens', 'Standard Health Trackers', 'Community Hub Access', 'Basic Missions'],
        canAccessAI: true,
        canAccessReports: false,
        canAccessGamification: true,
        canAccessJournal: true,
        canAccessMeditation: true,
        maxTrackers: 3,
        maxAiTokens: 5,
    },
    [PackageTier.GUARDIAN]: {
        name: 'Aether Guardian',
        features: ['25 Daily AI Tokens', 'Advanced Reports & Charts', 'Unlimited Health Trackers', 'Priority Alchemist Tips', 'Custom Theme Access'],
        canAccessAI: true,
        canAccessReports: true,
        canAccessGamification: true,
        canAccessJournal: true,
        canAccessMeditation: true,
        maxTrackers: 999,
        maxAiTokens: 25,
    },
    [PackageTier.AETHERIUS]: {
        name: 'Aetherius VIP',
        features: ['100 Daily AI Tokens', 'All Guardian Benefits', 'Founder/Admin Badges', 'Early Feature Access', 'Guild Boss Multipliers'],
        canAccessAI: true,
        canAccessReports: true,
        canAccessGamification: true,
        canAccessJournal: true,
        canAccessMeditation: true,
        maxTrackers: 999,
        maxAiTokens: 100,
    },
};

export const DEFAULT_PACKAGE = PackageTier.NOVICE;
