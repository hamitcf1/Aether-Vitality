export const PackageTier = {
    NOVICE: 'novice',
    GUARDIAN: 'guardian',
    AETHERIUS: 'aetherius', // VIP/Admin
} as const;

export type PackageTier = typeof PackageTier[keyof typeof PackageTier];

export interface PackageFeatures {
    canAccessAI: boolean;
    canAccessReports: boolean;
    canAccessGamification: boolean;
    canAccessJournal: boolean;
    canAccessMeditation: boolean;
    maxTrackers: number;
}

export const PACKAGES: Record<PackageTier, PackageFeatures> = {
    [PackageTier.NOVICE]: {
        canAccessAI: false,
        canAccessReports: false,
        canAccessGamification: false,
        canAccessJournal: true,
        canAccessMeditation: true,
        maxTrackers: 3,
    },
    [PackageTier.GUARDIAN]: {
        canAccessAI: true,
        canAccessReports: true,
        canAccessGamification: true,
        canAccessJournal: true,
        canAccessMeditation: true,
        maxTrackers: 999,
    },
    [PackageTier.AETHERIUS]: {
        canAccessAI: true,
        canAccessReports: true,
        canAccessGamification: true,
        canAccessJournal: true,
        canAccessMeditation: true,
        maxTrackers: 999,
    },
};

export const DEFAULT_PACKAGE = PackageTier.NOVICE;
