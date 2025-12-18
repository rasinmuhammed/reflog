'use client'

import { cn } from '@/lib/utils'

interface ShimmerLoaderProps {
    className?: string
    variant?: 'text' | 'circle' | 'card' | 'button'
    lines?: number
}

/**
 * Premium shimmer loading skeleton
 * 
 * Replaces boring spinners with elegant loading states
 * that match the content structure
 */
export default function ShimmerLoader({
    className,
    variant = 'text',
    lines = 1
}: ShimmerLoaderProps) {
    const baseClasses = 'animate-shimmer bg-gradient-to-r from-[#1a1a1e] via-[#2e2e33] to-[#1a1a1e] bg-[length:200%_100%]'

    if (variant === 'circle') {
        return (
            <div className={cn(baseClasses, 'rounded-full w-10 h-10', className)} />
        )
    }

    if (variant === 'button') {
        return (
            <div className={cn(baseClasses, 'rounded-xl h-10 w-24', className)} />
        )
    }

    if (variant === 'card') {
        return (
            <div className={cn('space-y-4 p-6 rounded-2xl bg-[#1a1a1e]/50', className)}>
                <div className={cn(baseClasses, 'h-4 w-1/3 rounded')} />
                <div className={cn(baseClasses, 'h-3 w-full rounded')} />
                <div className={cn(baseClasses, 'h-3 w-4/5 rounded')} />
                <div className={cn(baseClasses, 'h-8 w-1/4 rounded-lg mt-4')} />
            </div>
        )
    }

    // Text variant
    return (
        <div className={cn('space-y-2', className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        baseClasses,
                        'h-3 rounded',
                        i === lines - 1 ? 'w-3/4' : 'w-full'
                    )}
                />
            ))}
        </div>
    )
}

// Add shimmer animation to globals or design-tokens
// @keyframes shimmer {
//   0% { background-position: 200% 0; }
//   100% { background-position: -200% 0; }
// }
