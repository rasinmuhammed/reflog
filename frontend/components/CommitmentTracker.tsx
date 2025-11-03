'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Target, CheckCircle, XCircle, AlertCircle, Flame, Award, X, Loader2,
  Plus, AlertTriangle, TrendingUp, Clock, Zap, Calendar
} from 'lucide-react'
import MarkdownRenderer from './MarkdownRenderer'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface TodayCommitment {
  has_commitment: boolean
  checkin_id?: number
  commitment?: string
  energy_level?: number
  avoiding_what?: string
  created_at?: string
  hours_since?: number
  shipped?: boolean | null
  excuse?: string
  needs_review?: boolean
  can_review?: boolean
}

interface CommitmentStats {
  period_days: number
  total_commitments: number
  shipped: number
  failed: number
  success_rate: number
  current_streak: number
  best_streak: number
  common_excuses: Array<{ excuse: string; count: number }>
  weekly_breakdown?: Array<{ week_start: string; shipped: number; failed: number; rate: number }>
}

interface CommitmentTrackerProps {
  githubUsername: string
  onReviewComplete?: () => void
}

export default function CommitmentTracker({
  githubUsername,
  onReviewComplete
}: CommitmentTrackerProps) {
  const [todayCommitment, setTodayCommitment] = useState<TodayCommitment | null>(null)
  const [stats, setStats] = useState<CommitmentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [shipped, setShipped] = useState<boolean | null>(null)
  const [excuse, setExcuse] = useState('')
  const [feedback, setFeedback] = useState('')
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickCommitment, setQuickCommitment] = useState('')

  useEffect(() => {
    loadCommitmentData()
    const interval = setInterval(loadCommitmentData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [githubUsername])

  const loadCommitmentData = async () => {
    try {
      const [commitmentRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/commitments/${githubUsername}/today`),
        axios.get(`${API_URL}/commitments/${githubUsername}/stats?days=30`)
      ])

      setTodayCommitment(commitmentRes.data)
      setStats(statsRes.data)

      if (commitmentRes.data.needs_review && !showReviewModal && !feedback) {
        setShowReviewModal(true)
      }
    } catch (error) {
      console.error('Failed to load commitment data:', error)
    } finally {
      if (loading) setLoading(false)
    }
  }

  const handleQuickCommit = async () => {
    if (!quickCommitment.trim()) return

    setReviewing(true)
    try {
      await axios.post(`${API_URL}/checkins/${githubUsername}`, {
        energy_level: 7,
        avoiding_what: "Quick commitment - no details",
        commitment: quickCommitment,
        mood: "focused"
      })

      setQuickCommitment('')
      setShowQuickAdd(false)
      await loadCommitmentData()
    } catch (error) {
      console.error('Failed to create quick commitment:', error)
      alert('Failed to add commitment. Please try again.')
    } finally {
      setReviewing(false)
    }
  }

  const handleReview = async () => {
    if (shipped === null || !todayCommitment?.checkin_id) return

    setReviewing(true)
    setFeedback('')
    try {
      const response = await axios.post(
        `${API_URL}/commitments/${todayCommitment.checkin_id}/review`,
        {
          shipped: shipped,
          excuse: shipped ? null : excuse
        }
      )

      setFeedback(response.data.feedback)
      await loadCommitmentData()

      if (onReviewComplete) {
        onReviewComplete()
      }

      if (shipped) {
        setTimeout(() => {
          setShowReviewModal(false)
          resetReviewForm()
        }, 5000)
      }
    } catch (error) {
      console.error('Failed to review commitment:', error)
      alert('Failed to submit review. Please try again.')
      setReviewing(false)
    }
  }

  const resetReviewForm = () => {
    setShipped(null)
    setExcuse('')
    setFeedback('')
    setReviewing(false)
  }

  if (loading && !stats) {
    return (
      <div className="bg-[#242424] border border-[#242424]/50 rounded-2xl p-6 animate-pulse space-y-4">
        <div className="h-8 bg-[#000000]/30 rounded w-1/3 mb-4"></div>
        <div className="h-24 bg-[#000000]/30 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-28 bg-[#000000]/30 rounded-2xl"></div>
          <div className="h-28 bg-[#000000]/30 rounded-2xl"></div>
          <div className="h-28 bg-[#000000]/30 rounded-2xl"></div>
          <div className="h-28 bg-[#000000]/30 rounded-2xl"></div>
        </div>
      </div>
    )
  }

  const getStreakColorClass = (streak: number) => {
    if (streak >= 7) return 'text-orange-400'
    if (streak >= 3) return 'text-[#C488F8]'
    return 'text-[#FBFAEE]/50'
  }

  return (
    <>
      <div className="space-y-6 text-[#FBFAEE]">
        {/* Quick Add Commitment */}
        {!todayCommitment?.has_commitment && (
          <div className="relative overflow-hidden bg-gradient-to-br from-[#933DC9]/30 via-[#53118F]/20 to-[#933DC9]/30 border-2 border-[#933DC9]/50 rounded-2xl p-8 shadow-xl">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            <div className="relative">
              {!showQuickAdd ? (
                <button
                  onClick={() => setShowQuickAdd(true)}
                  className="w-full flex items-center justify-center space-x-3 text-[#FBFAEE] hover:scale-[1.02] transition-transform duration-200 group"
                >
                  <div className="p-3 bg-gradient-to-br from-[#933DC9] to-[#53118F] rounded-xl shadow-lg group-hover:shadow-[#933DC9]/50 transition">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold">Set Today's Commitment</div>
                    <div className="text-sm text-[#FBFAEE]/70">What will you ship today?</div>
                  </div>
                </button>
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={quickCommitment}
                    onChange={(e) => setQuickCommitment(e.target.value)}
                    placeholder="I will ship..."
                    className="w-full px-5 py-4 bg-[#000000]/50 border border-[#933DC9]/40 text-[#FBFAEE] placeholder-[#FBFAEE]/50 rounded-xl focus:ring-2 focus:ring-[#933DC9] focus:border-transparent transition text-lg"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleQuickCommit()}
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleQuickCommit}
                      disabled={!quickCommitment.trim() || reviewing}
                      className="flex-1 bg-gradient-to-r from-[#933DC9] to-[#53118F] text-[#FBFAEE] py-3 rounded-xl font-bold hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:scale-[1.02]"
                    >
                      {reviewing ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                          <Zap className="w-5 h-5 mr-2" />
                          Commit
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowQuickAdd(false)
                        setQuickCommitment('')
                      }}
                      className="px-6 py-3 bg-[#242424]/60 text-[#FBFAEE]/80 rounded-xl hover:bg-[#242424]/80 transition border border-[#242424]/50 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Today's Commitment Card - Enhanced */}
        {todayCommitment?.has_commitment && (
          <div className={`relative border-2 rounded-2xl p-6 shadow-xl overflow-hidden transition-all duration-300 ${
            todayCommitment.shipped === true
              ? 'bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500/50 shadow-green-500/20'
              : todayCommitment.shipped === false
              ? 'bg-gradient-to-br from-red-900/40 to-orange-900/40 border-red-500/50 shadow-red-500/20'
              : todayCommitment.needs_review
              ? 'bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-yellow-500/50 animate-pulse ring-2 ring-yellow-500/50 ring-offset-2 ring-offset-[#000000]'
              : 'bg-gradient-to-br from-[#933DC9]/30 to-[#53118F]/30 border-[#933DC9]/50'
          }`}>
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
            
            <div className="relative flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className={`p-4 rounded-xl shadow-lg ${
                  todayCommitment.shipped === true
                    ? 'bg-gradient-to-r from-green-600 to-emerald-500'
                    : todayCommitment.shipped === false
                    ? 'bg-gradient-to-r from-red-600 to-orange-500'
                    : 'bg-gradient-to-r from-[#933DC9] to-[#53118F]'
                }`}>
                  {todayCommitment.shipped === true ? (
                    <CheckCircle className="w-7 h-7 text-[#FBFAEE]" />
                  ) : todayCommitment.shipped === false ? (
                    <XCircle className="w-7 h-7 text-[#FBFAEE]" />
                  ) : (
                    <Target className="w-7 h-7 text-[#FBFAEE]" />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#FBFAEE]">
                    {todayCommitment.shipped === true
                      ? '✅ Shipped!'
                      : todayCommitment.shipped === false
                      ? '❌ Not Shipped'
                      : "Today's Commitment"}
                  </h3>
                  <p className="text-sm text-[#FBFAEE]/70">
                    {todayCommitment.created_at
                      ? `${Math.floor(todayCommitment.hours_since ?? 0)} hours ago`
                      : 'Made today'}
                  </p>
                </div>
              </div>

              {todayCommitment.can_review && todayCommitment.shipped === null && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-[#FBFAEE] px-5 py-3 rounded-xl font-bold hover:from-yellow-600 hover:to-orange-600 transition shadow-xl flex items-center animate-bounce ring-2 ring-yellow-300/50 hover:scale-105"
                >
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Review Now
                </button>
              )}
            </div>

            <div className="relative bg-[#000000]/40 rounded-xl p-5 mb-4 border border-[#242424]/40">
              <p className="text-[#FBFAEE] text-xl italic font-medium">"{todayCommitment.commitment}"</p>
            </div>

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm gap-2">
              <div className="flex items-center space-x-4 text-[#FBFAEE]/70">
                <span className="flex items-center">
                  <Zap className="w-4 h-4 mr-1" />
                  Energy: {todayCommitment.energy_level}/10
                </span>
                {todayCommitment.excuse && (
                  <span className="text-red-400 italic flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {todayCommitment.excuse}
                  </span>
                )}
              </div>
              {todayCommitment.needs_review && todayCommitment.shipped === null && (
                <span className="text-yellow-400 font-bold animate-pulse flex items-center text-base">
                  <AlertTriangle className="w-5 h-5 mr-1" /> Needs Review
                </span>
              )}
            </div>
          </div>
        )}

        {/* Stats Grid - Enhanced */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#242424] border border-[#242424]/50 rounded-2xl p-6 text-center transition hover:shadow-xl hover:border-[#933DC9]/50 hover:scale-105">
              <div className={`text-6xl font-bold mb-2 ${
                stats.success_rate >= 70 ? 'text-green-400' :
                stats.success_rate >= 50 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {stats.success_rate.toFixed(0)}%
              </div>
              <div className="text-sm text-[#FBFAEE]/80 font-semibold">Success Rate</div>
              <div className="text-xs text-[#FBFAEE]/50 mt-1">
                ({stats.shipped}/{stats.total_commitments} shipped)
              </div>
            </div>

            <div className="bg-[#242424] border border-[#242424]/50 rounded-2xl p-6 text-center transition hover:shadow-xl hover:border-orange-500/50 hover:scale-105">
              <div className="flex items-center justify-center mb-2">
                <Flame className={`w-10 h-10 ${getStreakColorClass(stats.current_streak)}`} />
                <span className="text-6xl font-bold text-[#FBFAEE] ml-2">
                  {stats.current_streak}
                </span>
              </div>
              <div className="text-sm text-[#FBFAEE]/80 font-semibold">Current Streak</div>
              {stats.current_streak > 0 && (
                <div className="text-xs text-[#FBFAEE]/50 mt-1">Keep it burning! 🔥</div>
              )}
            </div>

            <div className="bg-[#242424] border border-[#242424]/50 rounded-2xl p-6 text-center transition hover:shadow-xl hover:border-yellow-500/50 hover:scale-105">
              <div className="flex items-center justify-center mb-2">
                <Award className="w-10 h-10 text-yellow-400" />
                <span className="text-6xl font-bold text-[#FBFAEE] ml-2">
                  {stats.best_streak}
                </span>
              </div>
              <div className="text-sm text-[#FBFAEE]/80 font-semibold">Best Streak</div>
              {stats.best_streak > 0 && stats.best_streak >= stats.current_streak && (
                <div className="text-xs text-[#FBFAEE]/50 mt-1">Your record</div>
              )}
            </div>

            <div className="bg-[#242424] border border-[#242424]/50 rounded-2xl p-6 text-center transition hover:shadow-xl hover:border-[#933DC9]/50 hover:scale-105">
              <div className="text-6xl font-bold text-[#C488F8] mb-2">
                {stats.total_commitments}
              </div>
              <div className="text-sm text-[#FBFAEE]/80 font-semibold">Commitments</div>
              <div className="text-xs text-[#FBFAEE]/50 mt-1">Last {stats.period_days} days</div>
            </div>
          </div>
        )}

        {/* Common Excuses Warning */}
        {stats && stats.common_excuses.length > 0 && (
          <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-500/40 rounded-2xl p-6">
            <h4 className="text-lg font-bold text-red-400 mb-4 flex items-center">
              <AlertCircle className="w-6 h-6 mr-2" />
              Your Most Common Excuses
            </h4>
            <div className="space-y-3">
              {stats.common_excuses.map((excuse, idx) => (
                <div key={idx} className="flex items-center justify-between bg-[#000000]/40 rounded-lg p-4 border border-[#242424]/30">
                  <span className="text-[#FBFAEE]/90 capitalize font-medium">{excuse.excuse}</span>
                  <span className="text-red-400 font-bold text-lg">{excuse.count}x</span>
                </div>
              ))}
            </div>
            <p className="text-[#FBFAEE]/70 text-sm mt-4 flex items-start">
              <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-yellow-400" />
              Pattern detected: Using the same excuses? Time to address the root cause.
            </p>
          </div>
        )}
      </div>

      {/* Review Modal - Enhanced */}
      {showReviewModal && todayCommitment?.has_commitment && (
        <div className="fixed inset-0 bg-[#000000]/95 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-[#242424] via-[#1a1a1a] to-[#242424] border border-[#933DC9]/30 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-[#242424]/60 sticky top-0 bg-[#242424]/95 backdrop-blur-md z-10 rounded-t-3xl">
              <h2 className="text-2xl font-bold text-[#FBFAEE]">Did You Ship It?</h2>
              <button
                onClick={() => {
                  setShowReviewModal(false)
                  resetReviewForm()
                }}
                className="text-[#FBFAEE]/60 hover:text-[#FBFAEE] transition-colors p-2 hover:bg-[#000000]/30 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              <div className="bg-[#933DC9]/10 border border-[#933DC9]/30 rounded-xl p-5">
                <p className="text-sm text-[#FBFAEE]/70 mb-2">Your commitment:</p>
                <p className="text-xl text-[#FBFAEE] font-bold italic">"{todayCommitment.commitment}"</p>
              </div>

              {!feedback ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setShipped(true)}
                      className={`p-8 rounded-2xl transition-all border-2 ${
                        shipped === true
                          ? 'bg-gradient-to-r from-green-600 to-emerald-500 border-green-400 shadow-xl scale-105 ring-4 ring-green-400/50 ring-offset-4 ring-offset-[#242424]'
                          : 'bg-[#000000]/40 hover:bg-[#000000]/60 border-[#242424]/50 hover:border-green-500/50 hover:scale-105'
                      }`}
                    >
                      <CheckCircle className={`w-12 h-12 mx-auto mb-3 ${
                        shipped === true ? 'text-[#FBFAEE]' : 'text-[#FBFAEE]/50'
                      }`} />
                      <p className={`font-bold text-xl ${
                        shipped === true ? 'text-[#FBFAEE]' : 'text-[#FBFAEE]/70'
                      }`}>
                        Yes, I Shipped! ✅
                      </p>
                    </button>

                    <button
                      onClick={() => setShipped(false)}
                      className={`p-8 rounded-2xl transition-all border-2 ${
                        shipped === false
                          ? 'bg-gradient-to-r from-red-600 to-orange-500 border-red-400 shadow-xl scale-105 ring-4 ring-red-400/50 ring-offset-4 ring-offset-[#242424]'
                          : 'bg-[#000000]/40 hover:bg-[#000000]/60 border-[#242424]/50 hover:border-red-500/50 hover:scale-105'
                      }`}
                    >
                      <XCircle className={`w-12 h-12 mx-auto mb-3 ${
                        shipped === false ? 'text-[#FBFAEE]' : 'text-[#FBFAEE]/50'
                      }`} />
                      <p className={`font-bold text-xl ${
                        shipped === false ? 'text-[#FBFAEE]' : 'text-[#FBFAEE]/70'
                      }`}>
                        No, I Didn't ❌
                      </p>
                    </button>
                  </div>

                  {shipped === false && (
                    <div className="animate-in slide-in-from-top-4 duration-300">
                      <label className="block text-sm font-bold text-[#FBFAEE]/90 mb-2">
                        What stopped you? <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        value={excuse}
                        onChange={(e) => setExcuse(e.target.value)}
                        placeholder="Be honest. The AI will analyze your excuse patterns..."
                        className="w-full px-4 py-3 bg-[#000000]/50 border border-[#242424]/60 text-[#FBFAEE] placeholder-[#FBFAEE]/50 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none transition"
                        rows={3}
                        required
                      />
                      <p className="text-xs text-[#FBFAEE]/60 mt-2">
                        💡 Honesty helps the AI identify and break your patterns.
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleReview}
                    disabled={reviewing || shipped === null || (shipped === false && !excuse.trim())}
                    className="w-full bg-gradient-to-r from-[#933DC9] to-[#53118F] text-[#FBFAEE] py-4 rounded-xl font-bold hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center shadow-xl text-lg hover:scale-[1.02]"
                  >
                    {reviewing ? (
                      <>
                        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Target className="w-5 h-5 mr-2" />
                        Submit Review
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className={`border-2 rounded-2xl p-6 ${
                    shipped
                      ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/40'
                      : 'bg-gradient-to-br from-red-900/30 to-orange-900/30 border-red-500/40'
                  }`}>
                    <h3 className={`text-2xl font-bold mb-4 ${
                      shipped ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {shipped ? '🎉 Nice Work!' : '🤔 AI Analysis'}
                    </h3>
                    <MarkdownRenderer
                      content={feedback}
                      className="text-[#FBFAEE]/90"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setShowReviewModal(false)
                      resetReviewForm()
                    }}
                    className="w-full bg-[#000000]/40 text-[#FBFAEE]/80 py-4 rounded-xl font-bold hover:bg-[#000000]/60 transition border-2 border-[#242424]/50 text-lg"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}