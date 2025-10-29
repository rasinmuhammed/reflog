'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Target, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  Flame,
  Award,
  X,
  Loader2
} from 'lucide-react'
import MarkdownRenderer from './MarkdownRenderer'

const API_URL = 'http://localhost:8000'

interface TodayCommitment {
  has_commitment: boolean
  checkin_id?: number
  commitment?: string
  energy_level?: number
  avoiding_what?: string
  created_at?: string
  hours_since?: number
  shipped?: boolean
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
    
    // Poll every 5 minutes to check for reminders
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
      setLoading(false)

      // Auto-show review modal if needed
      if (commitmentRes.data.needs_review && !showReviewModal) {
        setShowReviewModal(true)
      }
    } catch (error) {
      console.error('Failed to load commitment data:', error)
      setLoading(false)
    }
  }

  const handleQuickCommit = async () => {
  if (!quickCommitment.trim()) return
  
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
  }
}

  const handleReview = async () => {
    if (shipped === null || !todayCommitment?.checkin_id) return

    setReviewing(true)
    try {
      const response = await axios.post(
        `${API_URL}/commitments/${todayCommitment.checkin_id}/review`,
        {
          shipped: shipped,
          excuse: shipped ? null : excuse
        }
      )

      setFeedback(response.data.feedback)
      
      // Refresh data
      await loadCommitmentData()
      
      if (onReviewComplete) {
        onReviewComplete()
      }

      // Auto-close modal after 5 seconds if shipped
      if (shipped) {
        setTimeout(() => {
          setShowReviewModal(false)
          resetReviewForm()
        }, 5000)
      }
    } catch (error) {
      console.error('Failed to review commitment:', error)
      alert('Failed to submit review. Please try again.')
    } finally {
      setReviewing(false)
    }
  }

  const resetReviewForm = () => {
    setShipped(null)
    setExcuse('')
    setFeedback('')
  }

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-1/3 mb-4"></div>
        <div className="h-20 bg-gray-800 rounded"></div>
      </div>
    )
  }

  const getStreakColor = (streak: number) => {
    if (streak >= 7) return 'from-green-500 to-emerald-500'
    if (streak >= 3) return 'from-blue-500 to-cyan-500'
    return 'from-gray-500 to-gray-600'
  }

  return (
    <>
      <div className="space-y-6">
        {/* Quick Add Commitment */}
        {!todayCommitment?.has_commitment && (
        <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-2 border-blue-500/50 rounded-2xl p-6 shadow-2xl">
            {!showQuickAdd ? (
            <button
                onClick={() => setShowQuickAdd(true)}
                className="w-full flex items-center justify-center space-x-3 text-white hover:scale-105 transition-transform"
            >
                <Plus className="w-6 h-6" />
                <span className="text-lg font-semibold">Set Today's Commitment</span>
            </button>
            ) : (
            <div className="space-y-3">
                <input
                type="text"
                value={quickCommitment}
                onChange={(e) => setQuickCommitment(e.target.value)}
                placeholder="What will you ship today?"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-blue-500"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleQuickCommit()}
                />
                <div className="flex space-x-2">
                <button
                    onClick={handleQuickCommit}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition"
                >
                    Commit
                </button>
                <button
                    onClick={() => {
                    setShowQuickAdd(false)
                    setQuickCommitment('')
                    }}
                    className="px-4 py-2 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition"
                >
                    Cancel
                </button>
                </div>
            </div>
            )}
        </div>
        )}
        {/* Today's Commitment Card */}
        {todayCommitment?.has_commitment && (
          <div className={`bg-gradient-to-br ${
            todayCommitment.shipped === true 
              ? 'from-green-900/50 to-emerald-900/50 border-green-500/50' 
              : todayCommitment.shipped === false
              ? 'from-red-900/50 to-orange-900/50 border-red-500/50'
              : todayCommitment.needs_review
              ? 'from-yellow-900/50 to-orange-900/50 border-yellow-500/50 animate-pulse'
              : 'from-blue-900/50 to-purple-900/50 border-blue-500/50'
          } border-2 rounded-2xl p-6 shadow-2xl`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`bg-gradient-to-r ${
                  todayCommitment.shipped === true 
                    ? 'from-green-500 to-emerald-500' 
                    : todayCommitment.shipped === false
                    ? 'from-red-500 to-orange-500'
                    : 'from-blue-500 to-purple-500'
                } p-3 rounded-xl shadow-lg`}>
                  {todayCommitment.shipped === true ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : todayCommitment.shipped === false ? (
                    <XCircle className="w-6 h-6 text-white" />
                  ) : (
                    <Target className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {todayCommitment.shipped === true 
                      ? '✅ Shipped!' 
                      : todayCommitment.shipped === false
                      ? '❌ Not Shipped'
                      : "Today's Commitment"}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {todayCommitment.hours_since && todayCommitment.hours_since < 24 
                      ? `${Math.floor(todayCommitment.hours_since)} hours ago`
                      : 'Made today'}
                  </p>
                </div>
              </div>

              {todayCommitment.can_review && todayCommitment.shipped === null && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-yellow-700 hover:to-orange-700 transition shadow-lg flex items-center animate-bounce"
                >
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Review Now
                </button>
              )}
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
              <p className="text-gray-200 text-lg">"{todayCommitment.commitment}"</p>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4 text-gray-400">
                <span>Energy: {todayCommitment.energy_level}/10</span>
                {todayCommitment.excuse && (
                  <span className="text-red-400">Excuse: {todayCommitment.excuse}</span>
                )}
              </div>
              {todayCommitment.needs_review && (
                <span className="text-yellow-400 font-semibold animate-pulse">
                  ⚠️ Needs Review
                </span>
              )}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Success Rate */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 text-center">
              <div className={`text-4xl font-bold mb-2 ${
                stats.success_rate >= 70 ? 'text-green-400' :
                stats.success_rate >= 50 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {stats.success_rate}%
              </div>
              <div className="text-sm text-gray-400">Success Rate</div>
              <div className="text-xs text-gray-600 mt-1">
                {stats.shipped}/{stats.total_commitments} shipped
              </div>
            </div>

            {/* Current Streak */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Flame className={`w-8 h-8 ${
                  stats.current_streak >= 7 ? 'text-orange-400' :
                  stats.current_streak >= 3 ? 'text-blue-400' :
                  'text-gray-600'
                }`} />
                <span className="text-4xl font-bold text-white ml-2">
                  {stats.current_streak}
                </span>
              </div>
              <div className="text-sm text-gray-400">Current Streak</div>
              {stats.current_streak > 0 && (
                <div className="text-xs text-gray-600 mt-1">Keep it up! 🔥</div>
              )}
            </div>

            {/* Best Streak */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Award className="w-8 h-8 text-yellow-400" />
                <span className="text-4xl font-bold text-white ml-2">
                  {stats.best_streak}
                </span>
              </div>
              <div className="text-sm text-gray-400">Best Streak</div>
              {stats.best_streak > stats.current_streak && (
                <div className="text-xs text-gray-600 mt-1">Your record</div>
              )}
            </div>

            {/* Total Commitments */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {stats.total_commitments}
              </div>
              <div className="text-sm text-gray-400">Commitments</div>
              <div className="text-xs text-gray-600 mt-1">Last 30 days</div>
            </div>
          </div>
        )}

        {/* Common Excuses Warning */}
        {stats && stats.common_excuses.length > 0 && (
          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-red-400 mb-3 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Your Most Common Excuses
            </h4>
            <div className="space-y-2">
              {stats.common_excuses.map((excuse, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                  <span className="text-gray-300 capitalize">{excuse.excuse}</span>
                  <span className="text-red-400 font-semibold">{excuse.count}x</span>
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-sm mt-4">
              💡 Pattern detected: You're using the same excuses. Time to address the root cause.
            </p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && todayCommitment?.has_commitment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-900/95 backdrop-blur-lg z-10 rounded-t-3xl">
              <h2 className="text-2xl font-bold text-white">Did You Ship It?</h2>
              <button
                onClick={() => {
                  setShowReviewModal(false)
                  resetReviewForm()
                }}
                className="text-gray-400 hover:text-gray-300 transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Commitment Reminder */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-2">Your commitment:</p>
                <p className="text-lg text-white font-semibold">"{todayCommitment.commitment}"</p>
              </div>

              {!feedback ? (
                <>
                  {/* Ship or Fail Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setShipped(true)}
                      className={`p-6 rounded-2xl transition-all ${
                        shipped === true
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg scale-105'
                          : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                      }`}
                    >
                      <CheckCircle className={`w-12 h-12 mx-auto mb-3 ${
                        shipped === true ? 'text-white' : 'text-gray-500'
                      }`} />
                      <p className={`font-semibold text-lg ${
                        shipped === true ? 'text-white' : 'text-gray-400'
                      }`}>
                        Yes, I Shipped! ✅
                      </p>
                    </button>

                    <button
                      onClick={() => setShipped(false)}
                      className={`p-6 rounded-2xl transition-all ${
                        shipped === false
                          ? 'bg-gradient-to-r from-red-600 to-orange-600 shadow-lg scale-105'
                          : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                      }`}
                    >
                      <XCircle className={`w-12 h-12 mx-auto mb-3 ${
                        shipped === false ? 'text-white' : 'text-gray-500'
                      }`} />
                      <p className={`font-semibold text-lg ${
                        shipped === false ? 'text-white' : 'text-gray-400'
                      }`}>
                        No, I Didn't ❌
                      </p>
                    </button>
                  </div>

                  {/* Excuse Input (only if failed) */}
                  {shipped === false && (
                    <div className="animate-in slide-in-from-top duration-300">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        What stopped you? <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        value={excuse}
                        onChange={(e) => setExcuse(e.target.value)}
                        placeholder="Be honest. The AI will analyze your excuse patterns..."
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        rows={4}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        💡 The more honest you are, the better the AI can help you break patterns.
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={handleReview}
                    disabled={reviewing || shipped === null || (shipped === false && !excuse.trim())}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                  >
                    {reviewing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Submit Review'
                    )}
                  </button>
                </>
              ) : (
                /* AI Feedback */
                <div className="space-y-6 animate-in slide-in-from-top duration-500">
                  <div className={`bg-gradient-to-br ${
                    shipped 
                      ? 'from-green-500/20 to-emerald-500/20 border-green-500/40'
                      : 'from-red-500/20 to-orange-500/20 border-red-500/40'
                  } border rounded-2xl p-6`}>
                    <h3 className={`text-xl font-bold mb-4 ${
                      shipped ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {shipped ? '🎉 Nice Work!' : '🤔 AI Analysis'}
                    </h3>
                    <MarkdownRenderer 
                      content={feedback} 
                      className="text-gray-200"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setShowReviewModal(false)
                      resetReviewForm()
                    }}
                    className="w-full bg-gray-800 text-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-700 transition"
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