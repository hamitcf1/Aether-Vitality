import React from 'react';
import { useUserStore } from '../../store/userStore';
import { PackageTier } from '../../constants/packages';
import { Sparkles, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RestrictedProps {
    to?: PackageTier; // Minimum tier required, defaults to GUARDIAN if not specified but feature flag is used
    feature?: string; // Feature flag name in PackageFeatures
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const Restricted: React.FC<RestrictedProps> = ({ to, feature, children, fallback }) => {
    const { profile, features } = useUserStore();

    // If no specific requirement, assume we just need to be logged in (which is handled by routing)
    // But here we are checking for *premium* features.

    let hasAccess = true;

    if (feature) {
        // @ts-ignore - dynamic key access
        if (!features[feature]) {
            hasAccess = false;
        }
    }

    if (to) {
        // Simple hierarchy check: Novice < Guardian < Aetherius
        const tiers = [PackageTier.NOVICE, PackageTier.GUARDIAN, PackageTier.AETHERIUS];
        const userTierIndex = tiers.indexOf(profile?.packageTier || PackageTier.NOVICE);
        const requiredTierIndex = tiers.indexOf(to);

        if (userTierIndex < requiredTierIndex) {
            hasAccess = false;
        }
    }

    if (hasAccess) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    // Default Fallback: Locked State UI
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center glass rounded-2xl border border-white/5">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Premium Feature</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-md">
                This feature is available exclusively to
                <span className="text-brand-emerald font-bold mx-1">Guardian</span>
                and
                <span className="text-cyan-400 font-bold mx-1">Aetherius</span>
                members.
            </p>
            <Link
                to="/pricing"
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full font-bold text-white shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform"
            >
                <Sparkles className="w-4 h-4" />
                Upgrade to Unlock
            </Link>
        </div>
    );
};
