'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassCardProps {
    children: ReactNode
    className?: string
    hover?: boolean
    glow?: boolean
    onClick?: () => void
}

/**
 * Premium glass-morphism card with depth layers
 * 
 * Design Philosophy:
 * - Multi-layer glass effect for depth
 * - Subtle gradient overlay
 * - Optional glow on hover
 * - Smooth spring animations
 */
export default function GlassCard({
    children,
    className,
    hover = true,
    glow = false,
    onClick
}: GlassCardProps) {
    return (
        <motion.div
            onClick={onClick}
            whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
            whileTap={onClick ? { scale: 0.98 } : undefined}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={cn(
                // Base glass effect
                'relative overflow-hidden rounded-2xl',
                'bg-gradient-to-br from-[rgba(36,36,40,0.7)] to-[rgba(26,26,30,0.9)]',
                'backdrop-blur-xl',
                'border border-white/[0.06]',

                // Shadow layers for depth
                'shadow-[0_8px_32px_rgba(0,0,0,0.3),0_2px_8px_rgba(0,0,0,0.2)]',

                // Hover states
                hover && 'transition-shadow duration-300',
                hover && 'hover:shadow-[0_12px_40px_rgba(0,0,0,0.35),0_4px_12px_rgba(0,0,0,0.25)]',
                hover && 'hover:border-white/[0.1]',

                // Glow effect
                glow && 'shadow-[0_0_40px_rgba(147,51,234,0.15)]',
                glow && 'hover:shadow-[0_0_60px_rgba(147,51,234,0.25),0_12px_40px_rgba(0,0,0,0.35)]',

                // Cursor
                onClick && 'cursor-pointer',

                className
            )}
        >
            {/* Inner glow overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    )
}
