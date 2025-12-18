'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import GlassCard from './GlassCard'

interface FeatureSkeletonProps {
    variant: 'tasks' | 'goals' | 'learning' | 'analytics' | 'chat'
    className?: string
}

/**
 * Premium skeleton loading states for each feature
 * 
 * Design Philosophy:
 * - Match the actual content structure
 * - Shimmer animation for perceived speed
 * - Feels like content is about to appear
 */
export default function FeatureSkeleton({ variant, className }: FeatureSkeletonProps) {
    const shimmerClass = 'animate-pulse bg-gradient-to-r from-white/[0.03] via-white/[0.08] to-white/[0.03]'

    if (variant === 'tasks') {
        return (
            <div className={cn('space-y-6', className)}>
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <div className={cn(shimmerClass, 'h-8 w-48 rounded-lg')} />
                        <div className={cn(shimmerClass, 'h-4 w-32 rounded')} />
                    </div>
                    <div className={cn(shimmerClass, 'h-12 w-32 rounded-2xl')} />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={cn(shimmerClass, 'h-20 rounded-xl')} />
                    ))}
                </div>

                {/* Input */}
                <div className={cn(shimmerClass, 'h-16 rounded-xl')} />

                {/* Tasks */}
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={cn(shimmerClass, 'h-14 rounded-xl')} />
                    ))}
                </div>
            </div>
        )
    }

    if (variant === 'goals') {
        return (
            <div className={cn('space-y-6', className)}>
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className={cn(shimmerClass, 'h-8 w-40 rounded-lg')} />
                    <div className={cn(shimmerClass, 'h-10 w-32 rounded-xl')} />
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={cn(shimmerClass, 'h-24 rounded-xl')} />
                    ))}
                </div>

                {/* Goal Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={cn(shimmerClass, 'h-40 rounded-2xl')} />
                    ))}
                </div>
            </div>
        )
    }

    if (variant === 'learning') {
        return (
            <div className={cn('space-y-6', className)}>
                {/* Header */}
                <div className="space-y-2">
                    <div className={cn(shimmerClass, 'h-8 w-56 rounded-lg')} />
                    <div className={cn(shimmerClass, 'h-4 w-80 rounded')} />
                </div>

                {/* Tab Bar */}
                <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={cn(shimmerClass, 'h-10 w-24 rounded-lg')} />
                    ))}
                </div>

                {/* Action Plan Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={cn(shimmerClass, 'h-48 rounded-2xl')} />
                    ))}
                </div>

                {/* Daily Tasks */}
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={cn(shimmerClass, 'h-16 rounded-xl')} />
                    ))}
                </div>
            </div>
        )
    }

    if (variant === 'analytics') {
        return (
            <div className={cn('space-y-6', className)}>
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={cn(shimmerClass, 'h-28 rounded-xl')} />
                    ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className={cn(shimmerClass, 'h-80 rounded-2xl')} />
                    <div className={cn(shimmerClass, 'h-80 rounded-2xl')} />
                </div>

                {/* Insights */}
                <div className={cn(shimmerClass, 'h-40 rounded-2xl')} />
            </div>
        )
    }

    if (variant === 'chat') {
        return (
            <div className={cn('h-full flex flex-col', className)}>
                {/* Messages area */}
                <div className="flex-1 p-6 space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-3">
                            <div className={cn(shimmerClass, 'w-10 h-10 rounded-full flex-shrink-0')} />
                            <div className="space-y-2 flex-1">
                                <div className={cn(shimmerClass, 'h-4 w-24 rounded')} />
                                <div className={cn(shimmerClass, 'h-16 w-3/4 rounded-xl')} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10">
                    <div className={cn(shimmerClass, 'h-12 rounded-xl')} />
                </div>
            </div>
        )
    }

    return null
}

// Quick loading placeholder for any content
export function QuickLoader() {
    return (
        <div className="h-full flex items-center justify-center">
            <div className="text-center">
                <div className="w-8 h-8 mx-auto rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
                <p className="text-white/40 text-sm mt-3">Loading...</p>
            </div>
        </div>
    )
}
