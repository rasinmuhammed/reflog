'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
    CheckCircle2,
    Target,
    BookOpen,
    Code2,
    BarChart3,
    MessageCircle,
    Settings,
    ChevronLeft,
    Sparkles,
    Flame
} from 'lucide-react'
import { LevelBadge, StreakFlame } from '../ui/premium/Gamification'

interface SidebarProps {
    activeTab: string
    onTabChange: (tab: string) => void
    userStats?: {
        level: number
        xp: number
        streak: number
    }
}

const navigationItems = [
    {
        id: 'today',
        label: 'Today',
        icon: CheckCircle2,
        description: 'Tasks & Focus'
    },
    {
        id: 'goals',
        label: 'Goals',
        icon: Target,
        description: 'Track progress'
    },
    {
        id: 'learning',
        label: 'Learning',
        icon: BookOpen,
        description: 'Curriculum & Dojo'
    },
    {
        id: 'insights',
        label: 'Insights',
        icon: BarChart3,
        description: 'Analytics'
    },
]

const bottomItems = [
    {
        id: 'chat',
        label: 'AI Coach',
        icon: MessageCircle,
        accent: true
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: Settings
    },
]

/**
 * Premium collapsible sidebar navigation
 * 
 * Design Philosophy:
 * - Icons + labels when expanded
 * - Icons only when collapsed
 * - Smooth spring animations
 * - Active state with glow
 * - User stats at bottom
 */
export default function Sidebar({ activeTab, onTabChange, userStats }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 72 : 240 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={cn(
                'h-full flex flex-col',
                'bg-gradient-to-b from-[#121214] to-[#0a0a0b]',
                'border-r border-white/[0.06]',
                'relative z-20'
            )}
        >
            {/* Logo & Collapse Toggle */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.06]">
                <AnimatePresence mode="wait">
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex items-center gap-2"
                        >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-lg text-white">Reflog</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        'text-white/50 hover:text-white hover:bg-white/[0.06]',
                        'transition-colors'
                    )}
                >
                    <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }}>
                        <ChevronLeft className="w-4 h-4" />
                    </motion.div>
                </motion.button>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                {navigationItems.map((item) => (
                    <NavItem
                        key={item.id}
                        item={item}
                        isActive={activeTab === item.id}
                        isCollapsed={isCollapsed}
                        onClick={() => onTabChange(item.id)}
                    />
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="border-t border-white/[0.06] py-4 px-2 space-y-1">
                {bottomItems.map((item) => (
                    <NavItem
                        key={item.id}
                        item={item}
                        isActive={activeTab === item.id}
                        isCollapsed={isCollapsed}
                        onClick={() => onTabChange(item.id)}
                        accent={item.accent}
                    />
                ))}

                {/* User Stats */}
                {userStats && (
                    <motion.div
                        className={cn(
                            'mt-4 p-3 rounded-xl',
                            'bg-gradient-to-br from-white/[0.04] to-transparent',
                            'border border-white/[0.06]'
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <LevelBadge level={userStats.level} xp={userStats.xp} />

                            <AnimatePresence mode="wait">
                                {!isCollapsed && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="flex-1 min-w-0"
                                    >
                                        <div className="flex items-center gap-2">
                                            <StreakFlame streak={userStats.streak} size="sm" />
                                            <span className="text-sm font-semibold text-white">
                                                {userStats.streak} day streak
                                            </span>
                                        </div>
                                        <p className="text-xs text-white/50 mt-0.5">
                                            {userStats.xp.toLocaleString()} XP
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.aside>
    )
}

interface NavItemProps {
    item: {
        id: string
        label: string
        icon: any
        description?: string
    }
    isActive: boolean
    isCollapsed: boolean
    onClick: () => void
    accent?: boolean
}

function NavItem({ item, isActive, isCollapsed, onClick, accent }: NavItemProps) {
    const Icon = item.icon

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl',
                'transition-all duration-200',
                'relative overflow-hidden',

                // Base state
                !isActive && 'text-white/60 hover:text-white hover:bg-white/[0.04]',

                // Active state
                isActive && 'text-white bg-gradient-to-r from-purple-600/20 to-purple-600/5',
                isActive && 'border border-purple-500/20',

                // Accent (AI Coach)
                accent && !isActive && 'text-purple-400 hover:text-purple-300'
            )}
        >
            {/* Active indicator bar */}
            {isActive && (
                <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-purple-500"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
            )}

            <Icon className={cn('w-5 h-5 flex-shrink-0', isCollapsed && 'mx-auto')} />

            <AnimatePresence mode="wait">
                {!isCollapsed && (
                    <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                        {item.label}
                    </motion.span>
                )}
            </AnimatePresence>

            {/* Glow effect for active */}
            {isActive && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-transparent pointer-events-none"
                />
            )}
        </motion.button>
    )
}
