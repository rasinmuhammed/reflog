'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import {
    Github,
    GitBranch,
    Star,
    Clock,
    TrendingUp,
    Lightbulb,
    ExternalLink,
    RefreshCw
} from 'lucide-react'
import GlassCard from '@/components/ui/premium/GlassCard'
import AnimatedCounter from '@/components/ui/premium/AnimatedCounter'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface RepoSummary {
    name: string
    description: string | null
    language: string | null
    stars: number
    last_push: string
}

interface GitHubAnalysisData {
    top_repos: RepoSummary[]
    activity_score: number
    primary_languages: string[]
    ai_insights: string[]
    productivity_tips: string[]
}

interface GitHubAnalysisProps {
    githubUsername: string
}

const languageColors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f7df1e',
    Python: '#3776ab',
    Rust: '#dea584',
    Go: '#00add8',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    Ruby: '#701516',
    Swift: '#ffac45',
    Kotlin: '#A97BFF',
}

/**
 * GitHub Analysis Component
 * 
 * Shows developer productivity insights:
 * - Top 5 recent repositories
 * - Activity score
 * - AI-powered insights and tips
 */
export default function GitHubAnalysis({ githubUsername }: GitHubAnalysisProps) {
    const [data, setData] = useState<GitHubAnalysisData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchAnalysis = async () => {
        try {
            setLoading(true)
            setError(null)

            const groqKey = localStorage.getItem('groq_api_key')
            const response = await axios.get(`${API_URL}/github/${githubUsername}/analysis`, {
                headers: groqKey ? { 'X-Groq-Key': groqKey } : {}
            })

            setData(response.data)
        } catch (err) {
            console.error('Failed to fetch GitHub analysis:', err)
            setError('Failed to load GitHub data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (githubUsername) {
            fetchAnalysis()
        }
    }, [githubUsername])

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="animate-pulse bg-white/[0.05] h-6 w-40 rounded" />
                    <div className="animate-pulse bg-white/[0.05] h-8 w-8 rounded-lg" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="animate-pulse bg-white/[0.03] h-24 rounded-xl" />
                    ))}
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <GlassCard className="p-6 text-center">
                <Github className="w-10 h-10 mx-auto mb-3 text-white/30" />
                <p className="text-white/50">{error || 'No data available'}</p>
                <button
                    onClick={fetchAnalysis}
                    className="mt-3 text-sm text-purple-400 hover:text-purple-300"
                >
                    Try again
                </button>
            </GlassCard>
        )
    }

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr)
            const now = new Date()
            const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

            if (diffDays === 0) return 'Today'
            if (diffDays === 1) return 'Yesterday'
            if (diffDays < 7) return `${diffDays} days ago`
            if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
            return `${Math.floor(diffDays / 30)} months ago`
        } catch {
            return 'Unknown'
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                        <Github className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">GitHub Activity</h3>
                        <p className="text-xs text-white/50">@{githubUsername}</p>
                    </div>
                </div>

                {/* Activity Score */}
                <div className="flex items-center gap-2">
                    <TrendingUp className={`w-5 h-5 ${data.activity_score > 50 ? 'text-green-400' : 'text-yellow-400'}`} />
                    <div className="text-right">
                        <AnimatedCounter
                            value={data.activity_score}
                            suffix="/100"
                            className="text-xl font-bold text-white"
                        />
                        <p className="text-xs text-white/50">Activity Score</p>
                    </div>
                </div>
            </div>

            {/* Top Repos */}
            {data.top_repos.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-white/70 flex items-center gap-2">
                        <GitBranch className="w-4 h-4" />
                        Recent Repositories
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {data.top_repos.slice(0, 4).map((repo, idx) => (
                            <motion.div
                                key={repo.name}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <GlassCard className="p-4" hover>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-white truncate">
                                                    {repo.name}
                                                </span>
                                                {repo.stars > 0 && (
                                                    <span className="flex items-center gap-1 text-xs text-yellow-400">
                                                        <Star className="w-3 h-3" />
                                                        {repo.stars}
                                                    </span>
                                                )}
                                            </div>

                                            {repo.description && (
                                                <p className="text-xs text-white/50 mt-1 line-clamp-1">
                                                    {repo.description}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-3 mt-2">
                                                {repo.language && (
                                                    <span className="flex items-center gap-1 text-xs text-white/60">
                                                        <span
                                                            className="w-2 h-2 rounded-full"
                                                            style={{ backgroundColor: languageColors[repo.language] || '#888' }}
                                                        />
                                                        {repo.language}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1 text-xs text-white/40">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDate(repo.last_push)}
                                                </span>
                                            </div>
                                        </div>

                                        <a
                                            href={`https://github.com/${githubUsername}/${repo.name}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Insights */}
            {data.ai_insights.length > 0 && (
                <GlassCard className="p-4" glow>
                    <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-4 h-4 text-yellow-400" />
                        <h4 className="text-sm font-medium text-white">AI Insights</h4>
                    </div>
                    <ul className="space-y-2">
                        {data.ai_insights.slice(0, 3).map((insight, idx) => (
                            <li key={idx} className="text-sm text-white/70 flex items-start gap-2">
                                <span className="text-purple-400 mt-0.5">•</span>
                                {insight}
                            </li>
                        ))}
                    </ul>
                </GlassCard>
            )}

            {/* Productivity Tips */}
            {data.productivity_tips.length > 0 && (
                <div className="bg-gradient-to-r from-purple-500/10 to-transparent p-4 rounded-xl border border-purple-500/20">
                    <h4 className="text-sm font-medium text-purple-300 mb-2">Quick Tips</h4>
                    <div className="flex flex-wrap gap-2">
                        {data.productivity_tips.slice(0, 3).map((tip, idx) => (
                            <span
                                key={idx}
                                className="text-xs px-3 py-1.5 bg-white/[0.05] rounded-full text-white/70"
                            >
                                {tip}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
