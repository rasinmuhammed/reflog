'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FloatingXPProps {
    amount: number
    show: boolean
    onComplete?: () => void
}

/**
 * Floating XP notification
 * 
 * Creates a satisfying "+50 XP" animation when user earns points
 * Provides instant dopamine feedback for achievements
 */
export function FloatingXP({ amount, show, onComplete }: FloatingXPProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: -40, scale: 1 }}
                    exit={{ opacity: 0, y: -80, scale: 0.6 }}
                    transition={{
                        duration: 0.6,
                        ease: [0.16, 1, 0.3, 1]
                    }}
                    onAnimationComplete={onComplete}
                    className="fixed pointer-events-none z-50 flex items-center gap-1"
                    style={{ left: '50%', top: '50%', transform: 'translateX(-50%)' }}
                >
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 drop-shadow-lg">
                        +{amount} XP
                    </span>
                    <motion.span
                        initial={{ rotate: 0 }}
                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-xl"
                    >
                        ✨
                    </motion.span>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

interface StreakFlameProps {
    streak: number
    className?: string
    size?: 'sm' | 'md' | 'lg'
}

/**
 * Animated streak flame
 * 
 * Visual representation of user's streak with pulsing animation
 * Larger streaks get more intense flames
 */
export function StreakFlame({ streak, className, size = 'md' }: StreakFlameProps) {
    const sizes = {
        sm: 'text-lg',
        md: 'text-2xl',
        lg: 'text-4xl'
    }

    const intensity = Math.min(streak / 10, 1) // 0-1 based on streak

    return (
        <motion.div
            className={cn('relative', className)}
            animate={{
                scale: [1, 1.1, 1],
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
            }}
        >
            <span className={cn(sizes[size], 'relative z-10')}>
                🔥
            </span>

            {/* Glow effect - intensifies with streak */}
            <motion.div
                className="absolute inset-0 blur-lg rounded-full"
                style={{
                    background: `radial-gradient(circle, rgba(249,115,22,${0.3 + intensity * 0.4}) 0%, transparent 70%)`
                }}
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
            />
        </motion.div>
    )
}

interface LevelBadgeProps {
    level: number
    xp: number
    className?: string
}

/**
 * Premium level badge with progress ring
 */
export function LevelBadge({ level, xp, className }: LevelBadgeProps) {
    const xpInLevel = xp % 1000
    const progress = (xpInLevel / 1000) * 100

    return (
        <div className={cn('relative', className)}>
            {/* Background ring */}
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 40 40">
                <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    stroke="rgba(147, 51, 234, 0.2)"
                    strokeWidth="3"
                />
                <motion.circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    stroke="url(#levelGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: progress / 100 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    style={{ strokeDasharray: '100 100' }}
                />
                <defs>
                    <linearGradient id="levelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#9333ea" />
                        <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Level number */}
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-white">{level}</span>
            </div>
        </div>
    )
}
