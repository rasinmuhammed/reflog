// frontend/components/DashboardOverview.tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, Target, MessageCircle, TrendingUp, TrendingDown, 
  Zap, CheckCircle, ArrowRight, Activity, Github, Brain,
  Minus
} from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface DashboardOverviewProps {
  githubUsername: string
  data: any
  onCheckIn: () => void
  onReviewCommitment: () => void
  onViewGoals: () => void
  onChat: () => void
}

export default function DashboardOverview({
  githubUsername,
  data,
  onCheckIn,
  onReviewCommitment,
  onViewGoals,
  onChat
}: DashboardOverviewProps) {
  const [todayCommitment, setTodayCommitment] = useState<any>(null)
  const [activeGoalsCount, setActiveGoalsCount] = useState(0)
  const [goalsProgress, setGoalsProgress] = useState(0)
  const [previousStats, setPreviousStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQuickData()
  }, [githubUsername])

  const loadQuickData = async () => {
    try {
      const [commitmentRes, goalsRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/commitments/${githubUsername}/today`),
        axios.get(`${API_URL}/goals/${githubUsername}/dashboard`),
        axios.get(`${API_URL}/commitments/${githubUsername}/stats?days=14`)
      ])

      setTodayCommitment(commitmentRes.data)
      setActiveGoalsCount(goalsRes.data.active_goals_count)
      setGoalsProgress(goalsRes.data.average_progress)

      // Calculate previous week stats for comparison
      const twoWeeksAgo = statsRes.data
      setPreviousStats(twoWeeksAgo)
    } catch (error) {
      console.error('Failed to load quick data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTrendIndicator = (current: number, previous: number) => {
    if (!previous || current === previous) {
      return { icon: Minus, color: 'text-[#FBFAEE]/40', text: 'No change' }
    }
    const change = ((current - previous) / previous * 100).toFixed(0)
    if (current > previous) {
      return { icon: TrendingUp, color: 'text-green-400', text: `+${change}%` }
    }
    return { icon: TrendingDown, color: 'text-red-400', text: `${change}%` }
  }

  const needsCheckIn = !todayCommitment?.has_commitment
  const needsReview = todayCommitment?.needs_review

  return (
    <div className="space-y-6">
      {/* Quick Actions Section */}
      <div className="bg-gradient-to-br from-[#933DC9]/10 via-[#53118F]/10 to-[#933DC9]/10 border border-[#933DC9]/30 rounded-3xl p-6 shadow-xl">
        <h3 className="text-2xl font-bold text-[#FBFAEE] mb-4 flex items-center">
          <Zap className="w-6 h-6 mr-2 text-[#C488F8]" />
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Daily Check-in */}
          {needsCheckIn ? (
            <button
              onClick={onCheckIn}
              className="group relative overflow-hidden bg-gradient-to-r from-[#933DC9] to-[#53118F] text-[#FBFAEE] p-6 rounded-2xl hover:brightness-110 transition-all shadow-lg hover:shadow-[#933DC9]/50 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-white/10 transform -skew-y-6 group-hover:skew-y-0 transition-transform duration-300"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-bold">Daily Check-in</div>
                    <div className="text-sm text-[#FBFAEE]/80">Set today's commitment</div>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="absolute top-2 right-2">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
              </div>
            </button>
          ) : needsReview ? (
            <button
              onClick={onReviewCommitment}
              className="group relative overflow-hidden bg-gradient-to-r from-orange-600 to-red-600 text-[#FBFAEE] p-6 rounded-2xl hover:brightness-110 transition-all shadow-lg hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-white/10 transform -skew-y-6 group-hover:skew-y-0 transition-transform duration-300"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-bold">Review Commitment</div>
                    <div className="text-sm text-[#FBFAEE]/80">Did you ship it?</div>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="absolute top-2 right-2">
                <span className="animate-pulse text-2xl">⚠️</span>
              </div>
            </button>
          ) : (
            <div className="bg-[#000000]/40 border border-[#242424]/50 p-6 rounded-2xl">
              <div className="flex items-center space-x-3 mb-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div className="text-lg font-bold text-[#FBFAEE]">Today's Check-in</div>
              </div>
              <p className="text-sm text-[#FBFAEE]/70 mb-3">✅ Commitment set</p>
              <p className="text-xs text-[#FBFAEE]/60 italic line-clamp-2">
                "{todayCommitment?.commitment}"
              </p>
            </div>
          )}

          {/* Goals Quick Access */}
          <button
            onClick={onViewGoals}
            className="group bg-[#242424] border border-[#242424]/60 hover:border-[#933DC9]/50 p-6 rounded-2xl hover:bg-[#000000]/40 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-[#933DC9] to-[#53118F] p-3 rounded-xl">
                  <Target className="w-6 h-6 text-[#FBFAEE]" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-[#FBFAEE]">Your Goals</div>
                  <div className="text-sm text-[#FBFAEE]/60">
                    {activeGoalsCount} active
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#FBFAEE]/60 group-hover:translate-x-1 transition-transform" />
            </div>
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-[#FBFAEE]/70">
                <span>Average Progress</span>
                <span className="font-bold text-[#C488F8]">{goalsProgress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-[#000000]/50 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#933DC9] to-[#53118F] transition-all duration-1000 rounded-full"
                  style={{ width: `${goalsProgress}%` }}
                ></div>
              </div>
            </div>
          </button>

          {/* Chat Quick Access */}
          <button
            onClick={onChat}
            className="group bg-[#242424] border border-[#242424]/60 hover:border-[#933DC9]/50 p-6 rounded-2xl hover:bg-[#000000]/40 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-[#933DC9] to-[#53118F] p-3 rounded-xl">
                  <MessageCircle className="w-6 h-6 text-[#FBFAEE]" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-[#FBFAEE]">Chat with AI</div>
                  <div className="text-sm text-[#FBFAEE]/60">Get instant advice</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#FBFAEE]/60 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Activity Overview */}
          <div className="bg-[#242424] border border-[#242424]/60 p-6 rounded-2xl">
            <div className="flex items-center space-x-3 mb-3">
              <Activity className="w-6 h-6 text-[#C488F8]" />
              <div className="text-lg font-bold text-[#FBFAEE]">Recent Activity</div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-[#FBFAEE]/70">Check-ins this week</span>
                <span className="font-bold text-[#FBFAEE]">{data.stats.total_checkins}/7</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#FBFAEE]/70">Success rate</span>
                <span className="font-bold text-green-400">{data.stats.success_rate.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats with Trends */}
      <div className="bg-[#242424] border border-[#242424]/50 rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-bold text-[#FBFAEE] mb-4">Performance Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Success Rate */}
          <div className="bg-[#000000]/40 rounded-xl p-4 border border-[#242424]/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#FBFAEE]/70">Success Rate</span>
              {previousStats && (() => {
                const trend = getTrendIndicator(
                  data.stats.success_rate,
                  previousStats.success_rate
                )
                const Icon = trend.icon
                return (
                  <div className={`flex items-center space-x-1 text-xs ${trend.color}`}>
                    <Icon className="w-3 h-3" />
                    <span>{trend.text}</span>
                  </div>
                )
              })()}
            </div>
            <div className="text-3xl font-bold text-[#FBFAEE] mb-2">
              {data.stats.success_rate.toFixed(0)}%
            </div>
            <div className="w-full bg-[#000000]/50 rounded-full h-2">
              <div
                className="h-full bg-gradient-to-r from-green-600 to-emerald-500 rounded-full transition-all duration-1000"
                style={{ width: `${data.stats.success_rate}%` }}
              ></div>
            </div>
          </div>

          {/* Average Energy */}
          <div className="bg-[#000000]/40 rounded-xl p-4 border border-[#242424]/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#FBFAEE]/70">Avg Energy</span>
              {previousStats && (() => {
                const trend = getTrendIndicator(
                  data.stats.avg_energy,
                  previousStats.avg_energy
                )
                const Icon = trend.icon
                return (
                  <div className={`flex items-center space-x-1 text-xs ${trend.color}`}>
                    <Icon className="w-3 h-3" />
                    <span>{trend.text}</span>
                  </div>
                )
              })()}
            </div>
            <div className="flex items-baseline space-x-1 mb-2">
              <span className="text-3xl font-bold text-[#FBFAEE]">
                {data.stats.avg_energy.toFixed(1)}
              </span>
              <span className="text-[#FBFAEE]/60">/10</span>
            </div>
            <div className="w-full bg-[#000000]/50 rounded-full h-2">
              <div
                className="h-full bg-gradient-to-r from-[#933DC9] to-[#53118F] rounded-full transition-all duration-1000"
                style={{ width: `${data.stats.avg_energy * 10}%` }}
              ></div>
            </div>
          </div>

          {/* GitHub Activity */}
          <div className="bg-[#000000]/40 rounded-xl p-4 border border-[#242424]/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#FBFAEE]/70">Active Repos</span>
              <Github className="w-4 h-4 text-[#FBFAEE]/60" />
            </div>
            <div className="flex items-baseline space-x-1 mb-2">
              <span className="text-3xl font-bold text-[#FBFAEE]">
                {data.github.active_repos}
              </span>
              <span className="text-[#FBFAEE]/60">/{data.github.total_repos}</span>
            </div>
            <div className="w-full bg-[#000000]/50 rounded-full h-2">
              <div
                className="h-full bg-gradient-to-r from-green-600 to-emerald-500 rounded-full transition-all duration-1000"
                style={{ 
                  width: `${data.github.total_repos > 0 ? (data.github.active_repos / data.github.total_repos * 100) : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Since Last Week Note */}
        {previousStats && (
          <div className="mt-4 text-xs text-[#FBFAEE]/60 text-center">
            Compared to previous 7 days
          </div>
        )}
      </div>
    </div>
  )
}