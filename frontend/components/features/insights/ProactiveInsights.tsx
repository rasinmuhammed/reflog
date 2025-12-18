'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import {
    Sparkles,
    TrendingUp,
    AlertTriangle,
    Flame,
    Target,
    RefreshCw,
    ChevronRight
} from 'lucide-react'
import GlassCard from '@/components/ui/premium/GlassCard'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ProactiveInsight {
    type: 'streak' | 'productivity' | 'goal' | 'warning' | 'tip'
    title: string
    message: string
    action?: string
    actionTarget?: string
    priority: 'high' | 'medium' | 'low'
}

interface ProactiveInsightsProps {
    githubUsername: string
    streak?: number
    completionRate?: number
    pendingTasks?: number
}

const insightIcons = {
    streak: Flame,
    productivity: TrendingUp,
    goal: Target,
    warning: AlertTriangle,
    tip: Sparkles
}

const insightColors = {
    streak: 'from-orange-500/20 to-red-500/10 border-orange-500/20',
    productivity: 'from-green-500/20 to-emerald-500/10 border-green-500/20',
    goal: 'from-purple-500/20 to-indigo-500/10 border-purple-500/20',
    warning: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/20',
    tip: 'from-blue-500/20 to-cyan-500/10 border-blue-500/20'
}

/**
 * Proactive AI Insights
 * 
 * Surfaces smart, contextual tips based on user behavior.
 * Shows on the Today view to keep users engaged.
 */
export default function ProactiveInsights({
    githubUsername,
    streak = 0,
    completionRate = 0,
    pendingTasks = 0
}: ProactiveInsightsProps) {
    const [insights, setInsights] = useState<ProactiveInsight[]>([])
    const [loading, setLoading] = useState(true)
    const [dismissed, setDismissed] = useState<Set<number>>(new Set())

    useEffect(() => {
        generateInsights()
    }, [streak, completionRate, pendingTasks])

    const generateInsights = () => {
        const newInsights: ProactiveInsight[] = []

        // Streak-based insights
        if (streak === 0) {
            newInsights.push({
                type: 'warning',
                title: 'Start Your Streak',
                message: 'Complete a task today to begin building momentum!',
                action: 'Add a task',
                priority: 'high'
            })
        } else if (streak >= 7) {
            newInsights.push({
                type: 'streak',
                title: `🔥 ${streak} Day Streak!`,
                message: "You're on fire! Keep the momentum going.",
                priority: 'low'
            })
        } else if (streak >= 3) {
            newInsights.push({
                type: 'streak',
                title: 'Building Momentum',
                message: `${streak} days strong. A few more days and you'll hit a week!`,
                priority: 'medium'
            })
        }

        // Productivity insights
        if (completionRate >= 80) {
            newInsights.push({
                type: 'productivity',
                title: 'High Performer',
                message: `${completionRate}% completion rate - you're crushing it!`,
                priority: 'low'
            })
        } else if (completionRate < 50 && completionRate > 0) {
            newInsights.push({
                type: 'tip',
                title: 'Pro Tip',
                message: 'Try breaking tasks into smaller pieces for easier wins.',
                priority: 'medium'
            })
        }

        // Pending tasks
        if (pendingTasks > 5) {
            newInsights.push({
                type: 'warning',
                title: 'Task Overload',
                message: `${pendingTasks} pending tasks. Focus on your top 3 priorities.`,
                action: 'Review tasks',
                priority: 'high'
            })
        } else if (pendingTasks === 0) {
            newInsights.push({
                type: 'goal',
                title: 'All Clear!',
                message: 'No pending tasks. Time to plan your next goals.',
                action: 'Set a goal',
                priority: 'medium'
            })
        }

        // Random motivational tip
        const tips = [
            { title: 'Deep Work', message: 'Schedule a 90-min focus block for your most important task.' },
            { title: 'Review Time', message: 'Spend 5 mins reviewing yesterday\'s progress.' },
            { title: 'Energy Check', message: 'Work on hard tasks when your energy is highest.' },
        ]
        const randomTip = tips[Math.floor(Math.random() * tips.length)]
        if (newInsights.length < 3) {
            newInsights.push({
                type: 'tip',
                ...randomTip,
                priority: 'low'
            })
        }

        setInsights(newInsights.filter((_, i) => !dismissed.has(i)).slice(0, 3))
        setLoading(false)
    }

    const dismissInsight = (index: number) => {
        setDismissed(prev => new Set([...prev, index]))
        setInsights(prev => prev.filter((_, i) => i !== index))
    }

    if (loading || insights.length === 0) return null

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white/60 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    AI Insights
                </h3>
            </div>

            <AnimatePresence mode="popLayout">
                {insights.map((insight, idx) => {
                    const Icon = insightIcons[insight.type]
                    const colorClass = insightColors[insight.type]

                    return (
                        <motion.div
                            key={`${insight.type}-${idx}`}
                            layout
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, x: 100 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                            <div className={`p-4 rounded-xl bg-gradient-to-r ${colorClass} border backdrop-blur-sm`}>
                                <div className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${insight.type === 'warning' ? 'bg-yellow-500/20' :
                                            insight.type === 'streak' ? 'bg-orange-500/20' :
                                                'bg-white/10'
                                        }`}>
                                        <Icon className={`w-4 h-4 ${insight.type === 'warning' ? 'text-yellow-400' :
                                                insight.type === 'streak' ? 'text-orange-400' :
                                                    insight.type === 'productivity' ? 'text-green-400' :
                                                        'text-purple-400'
                                            }`} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-white text-sm">{insight.title}</p>
                                        <p className="text-xs text-white/60 mt-0.5">{insight.message}</p>

                                        {insight.action && (
                                            <button className="mt-2 text-xs text-purple-300 hover:text-purple-200 flex items-center gap-1">
                                                {insight.action}
                                                <ChevronRight className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => dismissInsight(idx)}
                                        className="text-white/30 hover:text-white/60 p-1"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </AnimatePresence>
        </div>
    )
}
