'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { DashboardProvider, useDashboard } from '@/contexts/DashboardContext'
import PremiumShell from '@/components/layout/PremiumShell'
import TodayView from '@/components/features/today/TodayView'
import CheckInModal from '@/components/features/checkin/CheckInModal'
import CommandPalette from '@/components/shared/CommandPalette'
import { motion, AnimatePresence } from 'framer-motion'

// Lazy load heavy components for performance
const Goals = dynamic(() => import('@/components/features/goals/Goals'), {
    loading: () => <TabLoader />
})
const LearningHub = dynamic(() => import('@/components/features/learning/LearningHub'), {
    loading: () => <TabLoader />
})
const Dojo = dynamic(() => import('@/components/features/dojo/Dojo'), {
    loading: () => <TabLoader />
})
const Analytics = dynamic(() => import('@/components/features/analytics/Analytics'), {
    loading: () => <TabLoader />
})
const LifeDecisions = dynamic(() => import('@/components/features/life-decisions/LifeDecisions'), {
    loading: () => <TabLoader />
})
const Chat = dynamic(() => import('@/components/features/chat/Chat'), {
    loading: () => <TabLoader />
})
const Settings = dynamic(() => import('@/components/features/settings/Settings'), {
    loading: () => <TabLoader />
})

function TabLoader() {
    return (
        <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
        </div>
    )
}

interface PremiumDashboardProps {
    githubUsername: string
}

type TabType = 'today' | 'goals' | 'learning' | 'dojo' | 'insights' | 'chat' | 'settings'

/**
 * Premium Dashboard Orchestrator
 * 
 * This is the main entry point that ties together:
 * - Premium Shell (layout)
 * - All feature tabs
 * - Command palette
 * - Check-in modal
 * 
 * Design Philosophy:
 * - Each tab is lazy-loaded for fast initial load
 * - Smooth transitions between tabs
 * - Global keyboard shortcuts
 * - Context-aware suggestions
 */
function PremiumDashboardContent({ githubUsername }: PremiumDashboardProps) {
    const {
        dashboardData,
        todayCommitment,
        loading,
        refreshDashboard,
        fetchActionPlans,
        fetchGoals,
        fetchDecisions,
        fetchAnalytics,
    } = useDashboard()

    const [activeTab, setActiveTab] = useState<TabType>('today')
    const [showCheckin, setShowCheckin] = useState(false)
    const [showCommandPalette, setShowCommandPalette] = useState(false)

    // Track which tabs have been visited (for lazy loading)
    const [visitedTabs, setVisitedTabs] = useState<Set<TabType>>(new Set(['today']))

    // User stats for sidebar
    const userStats = dashboardData?.user ? {
        level: Math.floor((dashboardData.user.total_xp || 0) / 1000) + 1,
        xp: dashboardData.user.total_xp || 0,
        streak: dashboardData.user.streak || 0,
        fullName: dashboardData.user.full_name
    } : undefined

    // Lazy load data when tab is first opened
    useEffect(() => {
        if (visitedTabs.has(activeTab)) return

        // Mark tab as visited
        setVisitedTabs(prev => new Set([...prev, activeTab]))

        // Fetch data for this tab
        switch (activeTab) {
            case 'goals':
                fetchGoals?.()
                break
            case 'learning':
                fetchActionPlans?.()
                break
            case 'insights':
                fetchAnalytics?.()
                fetchDecisions?.()
                break
        }
    }, [activeTab, visitedTabs, fetchGoals, fetchActionPlans, fetchAnalytics, fetchDecisions])

    // Handle command palette actions
    const handleCommandAction = useCallback((action: string) => {
        switch (action) {
            case 'checkin':
                setShowCheckin(true)
                break
            case 'chat':
                setActiveTab('chat')
                break
            case 'goals':
                setActiveTab('goals')
                break
            case 'learning':
                setActiveTab('learning')
                break
            case 'dojo':
                setActiveTab('dojo')
                break
            case 'insights':
                setActiveTab('insights')
                break
            case 'settings':
                setActiveTab('settings')
                break
        }
        setShowCommandPalette(false)
    }, [])

    // Handle check-in completion
    const handleCheckinComplete = useCallback(() => {
        setShowCheckin(false)
        refreshDashboard()
    }, [refreshDashboard])

    return (
        <>
            <PremiumShell
                activeTab={activeTab}
                onTabChange={(tab) => setActiveTab(tab as TabType)}
                githubUsername={githubUsername}
                userStats={userStats}
                onCommandPalette={() => setShowCommandPalette(true)}
            >
                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'today' && (
                        <motion.div
                            key="today"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full"
                        >
                            <TodayView
                                githubUsername={githubUsername}
                                onCheckIn={() => setShowCheckin(true)}
                                userData={{
                                    streak: userStats?.streak || 0,
                                    bestStreak: dashboardData?.user?.best_streak || 0,
                                    todayCommitment: todayCommitment?.commitment
                                }}
                            />
                        </motion.div>
                    )}

                    {activeTab === 'goals' && (
                        <motion.div
                            key="goals"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full p-6 md:p-8"
                        >
                            <Goals githubUsername={githubUsername} />
                        </motion.div>
                    )}

                    {activeTab === 'learning' && (
                        <motion.div
                            key="learning"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full p-6 md:p-8"
                        >
                            <LearningHub githubUsername={githubUsername} />
                        </motion.div>
                    )}


                    {activeTab === 'insights' && (
                        <motion.div
                            key="insights"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full p-6 md:p-8 space-y-8"
                        >
                            <Analytics />
                            <LifeDecisions githubUsername={githubUsername} />
                        </motion.div>
                    )}

                    {activeTab === 'chat' && (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full"
                        >
                            <Chat githubUsername={githubUsername} />
                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full p-6 md:p-8"
                        >
                            <Settings githubUsername={githubUsername} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </PremiumShell>

            {/* Modals */}
            <AnimatePresence>
                {showCheckin && (
                    <CheckInModal
                        githubUsername={githubUsername}
                        onClose={() => setShowCheckin(false)}
                        onComplete={handleCheckinComplete}
                    />
                )}
            </AnimatePresence>

            <CommandPalette
                open={showCommandPalette}
                onOpenChange={setShowCommandPalette}
                onNavigate={(tab) => setActiveTab(tab as TabType)}
                onAction={handleCommandAction}
            />
        </>
    )
}

/**
 * Main Export - Wrapped with DashboardProvider
 */
export default function PremiumDashboard({ githubUsername }: PremiumDashboardProps) {
    return (
        <DashboardProvider githubUsername={githubUsername}>
            <PremiumDashboardContent githubUsername={githubUsername} />
        </DashboardProvider>
    )
}
