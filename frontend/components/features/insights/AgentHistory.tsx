'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import {
    MessageCircle,
    Clock,
    Sparkles,
    ChevronRight,
    Bot,
    Lightbulb
} from 'lucide-react'
import GlassCard from '@/components/ui/premium/GlassCard'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface AdviceEntry {
    id: number
    agent_name: string
    advice: string
    evidence?: {
        user_message?: string
        key_insights?: string[]
        actions?: string[]
    }
    created_at: string
    interaction_type: string
}

interface AgentHistoryProps {
    githubUsername: string
    limit?: number
    compact?: boolean // For sidebar display
}

/**
 * Agent Interaction History
 * 
 * Shows past AI coach conversations and advice.
 * Can be compact (sidebar) or full (modal/page).
 */
export default function AgentHistory({ githubUsername, limit = 10, compact = false }: AgentHistoryProps) {
    const [history, setHistory] = useState<AdviceEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState<number | null>(null)

    useEffect(() => {
        if (githubUsername) {
            fetchHistory()
        }
    }, [githubUsername])

    const fetchHistory = async () => {
        try {
            const response = await axios.get(`${API_URL}/advice/${githubUsername}?limit=${limit}`)
            setHistory(response.data)
        } catch (error) {
            console.error('Failed to fetch advice history:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

        if (diffHours < 1) return 'Just now'
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffHours < 48) return 'Yesterday'
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse bg-white/[0.03] h-16 rounded-xl" />
                ))}
            </div>
        )
    }

    if (history.length === 0) {
        return (
            <div className="text-center py-8">
                <Bot className="w-12 h-12 mx-auto mb-3 text-white/20" />
                <p className="text-white/50 text-sm">No conversations yet</p>
                <p className="text-white/30 text-xs mt-1">Chat with your AI coach to get started</p>
            </div>
        )
    }

    if (compact) {
        return (
            <div className="space-y-2">
                <h4 className="text-xs font-medium text-white/50 uppercase tracking-wider px-2">
                    Recent Conversations
                </h4>
                {history.slice(0, 5).map((entry) => (
                    <motion.button
                        key={entry.id}
                        whileHover={{ x: 2 }}
                        className="w-full text-left p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition"
                    >
                        <div className="flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-white/80 line-clamp-1">
                                    {entry.evidence?.user_message || 'AI Analysis'}
                                </p>
                                <p className="text-xs text-white/40 mt-0.5">
                                    {formatDate(entry.created_at)}
                                </p>
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>
        )
    }

    // Full view
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Conversation History</h3>
            </div>

            <div className="space-y-3">
                {history.map((entry) => (
                    <motion.div
                        key={entry.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <GlassCard
                            className="p-4 cursor-pointer"
                            hover
                            onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600/30 to-indigo-600/30 flex items-center justify-center flex-shrink-0">
                                        <Bot className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {entry.evidence?.user_message && (
                                            <p className="text-sm text-white/60 mb-1">
                                                You: "{entry.evidence.user_message.slice(0, 60)}..."
                                            </p>
                                        )}
                                        <p className={`text-sm text-white ${expanded !== entry.id ? 'line-clamp-2' : ''}`}>
                                            {entry.advice}
                                        </p>

                                        <AnimatePresence>
                                            {expanded === entry.id && entry.evidence?.key_insights && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="mt-3 pt-3 border-t border-white/10"
                                                >
                                                    <p className="text-xs text-white/50 mb-2 flex items-center gap-1">
                                                        <Lightbulb className="w-3 h-3" />
                                                        Key Insights
                                                    </p>
                                                    <ul className="space-y-1">
                                                        {entry.evidence.key_insights.slice(0, 3).map((insight, idx) => (
                                                            <li key={idx} className="text-xs text-white/70 flex items-start gap-2">
                                                                <span className="text-purple-400">•</span>
                                                                {insight}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-white/40">
                                    <Clock className="w-3 h-3" />
                                    <span className="text-xs">{formatDate(entry.created_at)}</span>
                                    <ChevronRight className={`w-4 h-4 transition ${expanded === entry.id ? 'rotate-90' : ''}`} />
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
