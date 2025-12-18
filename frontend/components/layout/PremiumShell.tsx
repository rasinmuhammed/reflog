'use client'

import { ReactNode, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
    Search,
    Bell,
    Command,
    Sparkles
} from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import Sidebar from './Sidebar'
import NotificationBell from '@/components/features/notifications/NotificationBell'

interface PremiumShellProps {
    children: ReactNode
    activeTab: string
    onTabChange: (tab: string) => void
    githubUsername: string
    userStats?: {
        level: number
        xp: number
        streak: number
        fullName?: string
    }
    onCommandPalette?: () => void
}

/**
 * Premium application shell
 * 
 * Design Philosophy:
 * - Gradient mesh background for depth
 * - Floating command palette
 * - Collapsible sidebar
 * - Status bar with live stats
 */
export default function PremiumShell({
    children,
    activeTab,
    onTabChange,
    githubUsername,
    userStats,
    onCommandPalette
}: PremiumShellProps) {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Keyboard shortcut for command palette
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                onCommandPalette?.()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onCommandPalette])

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-[#0a0a0b]">
            {/* Gradient mesh background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {/* Purple glow top right */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] opacity-30">
                    <div className="absolute inset-0 bg-gradient-radial from-purple-600/30 via-purple-600/5 to-transparent" />
                </div>

                {/* Blue glow bottom left */}
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] opacity-20">
                    <div className="absolute inset-0 bg-gradient-radial from-indigo-600/30 via-indigo-600/5 to-transparent" />
                </div>

                {/* Subtle noise texture */}
                <div className="absolute inset-0 opacity-[0.015] bg-[url('/noise.png')] bg-repeat" />
            </div>

            {/* Header */}
            <header className={cn(
                'h-14 flex items-center justify-between px-4 md:px-6',
                'border-b border-white/[0.06]',
                'bg-[#0a0a0b]/80 backdrop-blur-xl',
                'relative z-30'
            )}>
                {/* Left: Mobile menu or logo */}
                <div className="flex items-center gap-4">
                    {isMobile && (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-white">Reflog</span>
                        </div>
                    )}
                </div>

                {/* Center: Command palette trigger */}
                <button
                    onClick={onCommandPalette}
                    className={cn(
                        'hidden md:flex items-center gap-3 px-4 py-2 rounded-xl',
                        'bg-white/[0.04] border border-white/[0.08]',
                        'text-white/50 hover:text-white hover:bg-white/[0.06]',
                        'transition-all duration-200',
                        'min-w-[280px]'
                    )}
                >
                    <Search className="w-4 h-4" />
                    <span className="text-sm">Search or type a command...</span>
                    <kbd className="ml-auto text-xs bg-white/[0.08] px-2 py-0.5 rounded">
                        ⌘K
                    </kbd>
                </button>

                {/* Right: Notifications + User */}
                <div className="flex items-center gap-3">
                    <NotificationBell githubUsername={githubUsername} />
                    <UserButton
                        afterSignOutUrl="/"
                        appearance={{
                            elements: {
                                avatarBox: 'w-8 h-8 rounded-full ring-2 ring-white/10'
                            }
                        }}
                    />
                </div>
            </header>

            {/* Main content area */}
            <div className="flex-1 flex overflow-hidden relative z-10">
                {/* Sidebar - hidden on mobile */}
                {!isMobile && (
                    <Sidebar
                        activeTab={activeTab}
                        onTabChange={onTabChange}
                        userStats={userStats ? {
                            level: userStats.level,
                            xp: userStats.xp,
                            streak: userStats.streak
                        } : undefined}
                    />
                )}

                {/* Content */}
                <main className="flex-1 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Mobile bottom navigation */}
            {isMobile && (
                <MobileNav activeTab={activeTab} onTabChange={onTabChange} />
            )}
        </div>
    )
}

function MobileNav({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
    const items = [
        { id: 'today', icon: '✓', label: 'Today' },
        { id: 'goals', icon: '🎯', label: 'Goals' },
        { id: 'learning', icon: '📚', label: 'Learn' },
        { id: 'chat', icon: '💬', label: 'AI' },
    ]

    return (
        <nav className={cn(
            'h-16 flex items-center justify-around',
            'bg-[#121214]/90 backdrop-blur-xl',
            'border-t border-white/[0.06]',
            'relative z-30'
        )}>
            {items.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={cn(
                        'flex flex-col items-center gap-1 px-4 py-2',
                        'transition-colors',
                        activeTab === item.id ? 'text-purple-400' : 'text-white/50'
                    )}
                >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-xs font-medium">{item.label}</span>
                </button>
            ))}
        </nav>
    )
}
