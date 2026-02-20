import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'rectangular' | 'circular';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rectangular' }) => {
    const baseClasses = "animate-pulse bg-white/5 rounded-lg";
    const variantClasses = {
        text: "h-4 w-full rounded",
        rectangular: "h-full w-full",
        circular: "rounded-full"
    };

    return (
        <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
    );
};
