'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Target,
  CheckCircle,
  XCircle,
  Clock, // Keep Clock icon if used
  TrendingUp, // Keep TrendingUp icon if used
  AlertCircle,
  Flame,
  Award,
  X,
  Loader2,
  Plus // Import Plus if not already imported
} from 'lucide-react'
import MarkdownRenderer from './MarkdownRenderer' // Ensure MarkdownRenderer uses #FBFAEE text

// Assuming API_URL is defined elsewhere or replace with actual URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface TodayCommitment {
  has_commitment: boolean
  checkin_id?: number
  commitment?: string
  energy_level?: number
  avoiding_what?: string
  created_at?: string
  hours_since?: number
  shipped?: boolean | null // Allow null for pending
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
  // Add weekly_breakdown if you use it from the API
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

    // Poll every 5 minutes
    const interval = setInterval(loadCommitmentData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [githubUsername]) // Removed showReviewModal from dependency array

  const loadCommitmentData = async () => {
    // Keep setLoading true only at the beginning
    // setLoading(true); // Maybe remove this if polling causes flashes
    try {
      const [commitmentRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/commitments/${githubUsername}/today`),
        axios.get(`${API_URL}/commitments/${githubUsername}/stats?days=30`) // Ensure backend provides stats
      ])

      setTodayCommitment(commitmentRes.data)
      setStats(statsRes.data)


      // Auto-show review modal only if it's needed and not already open or recently closed
      if (commitmentRes.data.needs_review && !showReviewModal && !feedback) { // Added !feedback check
        setShowReviewModal(true)
      }
    } catch (error) {
      console.error('Failed to load commitment data:', error)
      // setError('Failed to load data.'); // Consider adding an error state
    } finally {
       if (loading) setLoading(false); // Only set loading false on initial load
    }
  }

  const handleQuickCommit = async () => {
    if (!quickCommitment.trim()) return

    // Add loading state for quick commit
    setReviewing(true); // Re-use reviewing state for temporary loading
    try {
      await axios.post(`${API_URL}/checkins/${githubUsername}`, {
        energy_level: 7, // Default energy or make it configurable
        avoiding_what: "Quick commitment - no details",
        commitment: quickCommitment,
        mood: "focused" // Default mood
      })

      setQuickCommitment('')
      setShowQuickAdd(false)
      await loadCommitmentData() // Refresh data
    } catch (error) {
      console.error('Failed to create quick commitment:', error)
      alert('Failed to add commitment. Please try again.'); // User feedback
    } finally {
        setReviewing(false);
    }
  }


  const handleReview = async () => {
    if (shipped === null || !todayCommitment?.checkin_id) return

    setReviewing(true)
    setFeedback('') // Clear previous feedback
    try {
      const response = await axios.post(
        `${API_URL}/commitments/${todayCommitment.checkin_id}/review`,
        {
          shipped: shipped,
          excuse: shipped ? null : excuse
        }
      )

      setFeedback(response.data.feedback)

      // Refresh data *after* getting feedback
      await loadCommitmentData()

      if (onReviewComplete) {
        onReviewComplete() // Callback for parent component
      }

      // Keep modal open to show feedback, auto-close only on success
       if (shipped) {
         setTimeout(() => {
           setShowReviewModal(false);
           resetReviewForm();
         }, 5000); // 5 seconds
       }

    } catch (error) {
      console.error('Failed to review commitment:', error)
      alert('Failed to submit review. Please try again.')
       setReviewing(false); // Ensure reviewing state is reset on error
    } // No finally block needed here, reviewing is set within try or handled by feedback display
  }


  const resetReviewForm = () => {
    setShipped(null)
    setExcuse('')
    setFeedback('')
    setReviewing(false) // Explicitly reset reviewing state here
  }

  // --- Loading Skeleton ---
  if (loading && !stats) { // Show skeleton only on initial load
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

  // Function to determine streak color based on count
  const getStreakColorClass = (streak: number) => {
    if (streak >= 7) return 'text-orange-400'; // Keep orange for high streak
    if (streak >= 3) return 'text-[#C488F8]'; // Lighter purple for medium streak
    return 'text-[#FBFAEE]/50'; // Dimmed white for low streak
  };


  return (
    <>
      <div className="space-y-6 text-[#FBFAEE]">
        {/* --- Quick Add Commitment --- */}
        {!todayCommitment?.has_commitment && (
           <div className="bg-gradient-to-br from-[#933DC9]/30 to-[#53118F]/30 border-2 border-[#933DC9]/50 rounded-2xl p-6 shadow-xl">
            {!showQuickAdd ? (
              <button
                onClick={() => setShowQuickAdd(true)}
                className="w-full flex items-center justify-center space-x-3 text-[#FBFAEE] hover:scale-[1.02] transition-transform duration-200"
              >
                <Plus className="w-5 h-5" />
                <span className="text-lg font-semibold">Set Today's Commitment</span>
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={quickCommitment}
                  onChange={(e) => setQuickCommitment(e.target.value)}
                  placeholder="What will you ship today?"
                   className="w-full px-4 py-3 bg-[#000000]/50 border border-[#242424]/60 text-[#FBFAEE] placeholder-[#FBFAEE]/50 rounded-xl focus:ring-2 focus:ring-[#933DC9] focus:border-transparent transition"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleQuickCommit()} // Prevent Shift+Enter submission
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleQuickCommit}
                    disabled={!quickCommitment.trim() || reviewing} // Disable while submitting
                     className="flex-1 bg-gradient-to-r from-[#933DC9] to-[#53118F] text-[#FBFAEE] py-2 rounded-xl font-semibold hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {reviewing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Commit'}
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickAdd(false)
                      setQuickCommitment('')
                    }}
                     className="px-4 py-2 bg-[#242424]/60 text-[#FBFAEE]/80 rounded-xl hover:bg-[#242424]/80 transition border border-[#242424]/50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- Today's Commitment Card --- */}
        {todayCommitment?.has_commitment && (
           <div className={`border-2 rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all duration-300 ${
            todayCommitment.shipped === true
              ? 'bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500/50'
              : todayCommitment.shipped === false
              ? 'bg-gradient-to-br from-red-900/40 to-orange-900/40 border-red-500/50'
              : todayCommitment.needs_review
              ? 'bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-yellow-500/50 animate-pulse ring-2 ring-yellow-500/50 ring-offset-2 ring-offset-[#000000]'
              : 'bg-gradient-to-br from-[#933DC9]/30 to-[#53118F]/30 border-[#933DC9]/50' // Default Purple
          }`}>
             {/* Optional subtle background pattern */}
             {/* <div className="absolute inset-0 opacity-5 bg-[url('/path/to/pattern.svg')]"></div> */}

            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="flex items-center space-x-3">
                 {/* Icon Background */}
                 <div className={`p-3 rounded-xl shadow-lg ${
                    todayCommitment.shipped === true
                      ? 'bg-gradient-to-r from-green-600 to-emerald-500'
                      : todayCommitment.shipped === false
                      ? 'bg-gradient-to-r from-red-600 to-orange-500'
                      : 'bg-gradient-to-r from-[#933DC9] to-[#53118F]' // Default Purple
                  }`}>
                  {todayCommitment.shipped === true ? (
                    <CheckCircle className="w-6 h-6 text-[#FBFAEE]" />
                  ) : todayCommitment.shipped === false ? (
                    <XCircle className="w-6 h-6 text-[#FBFAEE]" />
                  ) : (
                    <Target className="w-6 h-6 text-[#FBFAEE]" />
                  )}
                </div>
                {/* Title and Time */}
                <div>
                   <h3 className="text-xl font-bold text-[#FBFAEE]">
                    {todayCommitment.shipped === true
                      ? '✅ Shipped!'
                      : todayCommitment.shipped === false
                      ? '❌ Not Shipped'
                      : "Today's Commitment"}
                  </h3>
                   <p className="text-sm text-[#FBFAEE]/70">
                    {todayCommitment.created_at
                       ? `${Math.floor(todayCommitment.hours_since ?? 0)} hours ago` // Simplified time display
                       : 'Made today'}
                  </p>
                </div>
              </div>

              {/* Review Button */}
              {todayCommitment.can_review && todayCommitment.shipped === null && (
                <button
                  onClick={() => setShowReviewModal(true)}
                   className="bg-gradient-to-r from-yellow-500 to-orange-500 text-[#FBFAEE] px-4 py-2 rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition shadow-lg flex items-center animate-bounce ring-1 ring-yellow-300/50"
                >
                  <AlertCircle className="w-5 h-5 mr-1.5" />
                  Review Now
                </button>
              )}
            </div>

            {/* Commitment Text */}
             <div className="bg-[#000000]/40 rounded-xl p-4 mb-4 border border-[#242424]/40 relative z-10">
               <p className="text-[#FBFAEE] text-lg italic">"{todayCommitment.commitment}"</p>
            </div>

            {/* Footer Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm gap-2 relative z-10">
               <div className="flex items-center space-x-4 text-[#FBFAEE]/70">
                <span>Energy: {todayCommitment.energy_level}/10</span>
                {todayCommitment.excuse && (
                  <span className="text-red-400 italic">Excuse: {todayCommitment.excuse}</span> // Kept red
                )}
              </div>
              {todayCommitment.needs_review && todayCommitment.shipped === null && (
                 <span className="text-yellow-400 font-semibold animate-pulse flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1"/> Needs Review
                </span> // Kept yellow
              )}
            </div>
          </div>
        )}

        {/* --- Stats Grid --- */}
        {stats && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Success Rate */}
             <div className="bg-[#242424] border border-[#242424]/50 rounded-2xl p-6 text-center transition hover:shadow-xl hover:border-[#933DC9]/50">
               <div className={`text-5xl font-bold mb-2 ${
                stats.success_rate >= 70 ? 'text-green-400' :
                stats.success_rate >= 50 ? 'text-yellow-400' :
                'text-red-400' // Kept functional colors
              }`}>
                {stats.success_rate.toFixed(0)}% {/* Removed decimal */}
              </div>
               <div className="text-sm text-[#FBFAEE]/80">Success Rate</div>
               <div className="text-xs text-[#FBFAEE]/50 mt-1">
                 ({stats.shipped}/{stats.total_commitments} shipped)
              </div>
            </div>

            {/* Current Streak */}
             <div className="bg-[#242424] border border-[#242424]/50 rounded-2xl p-6 text-center transition hover:shadow-xl hover:border-[#933DC9]/50">
              <div className="flex items-center justify-center mb-2">
                 <Flame className={`w-8 h-8 ${getStreakColorClass(stats.current_streak)}`} />
                 <span className="text-5xl font-bold text-[#FBFAEE] ml-2">
                  {stats.current_streak}
                </span>
              </div>
               <div className="text-sm text-[#FBFAEE]/80">Current Streak</div>
              {stats.current_streak > 0 && (
                 <div className="text-xs text-[#FBFAEE]/50 mt-1">Keep it burning! 🔥</div>
              )}
            </div>

            {/* Best Streak */}
             <div className="bg-[#242424] border border-[#242424]/50 rounded-2xl p-6 text-center transition hover:shadow-xl hover:border-[#933DC9]/50">
              <div className="flex items-center justify-center mb-2">
                 <Award className="w-8 h-8 text-yellow-400" /> {/* Kept yellow */}
                 <span className="text-5xl font-bold text-[#FBFAEE] ml-2">
                  {stats.best_streak}
                </span>
              </div>
               <div className="text-sm text-[#FBFAEE]/80">Best Streak</div>
              {stats.best_streak > 0 && stats.best_streak >= stats.current_streak && (
                 <div className="text-xs text-[#FBFAEE]/50 mt-1">Your record</div>
              )}
            </div>

            {/* Total Commitments */}
             <div className="bg-[#242424] border border-[#242424]/50 rounded-2xl p-6 text-center transition hover:shadow-xl hover:border-[#933DC9]/50">
               <div className="text-5xl font-bold text-[#C488F8] mb-2"> {/* Lighter Purple */}
                {stats.total_commitments}
              </div>
               <div className="text-sm text-[#FBFAEE]/80">Commitments</div>
               <div className="text-xs text-[#FBFAEE]/50 mt-1">Last {stats.period_days} days</div>
            </div>
          </div>
        )}

        {/* --- Common Excuses Warning --- */}
        {stats && stats.common_excuses.length > 0 && (
           <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-500/40 rounded-2xl p-6">
             <h4 className="text-lg font-semibold text-red-400 mb-3 flex items-center"> {/* Kept red */}
              <AlertCircle className="w-5 h-5 mr-2" />
              Your Most Common Excuses
            </h4>
            <div className="space-y-2">
              {stats.common_excuses.map((excuse, idx) => (
                 <div key={idx} className="flex items-center justify-between bg-[#000000]/40 rounded-lg p-3 border border-[#242424]/30">
                   <span className="text-[#FBFAEE]/90 capitalize">{excuse.excuse}</span>
                   <span className="text-red-400 font-semibold">{excuse.count}x</span> {/* Kept red */}
                </div>
              ))}
            </div>
             <p className="text-[#FBFAEE]/70 text-sm mt-4">
              💡 Pattern detected: Using the same excuses? Time to address the root cause.
            </p>
          </div>
        )}
      </div>

      {/* --- Review Modal --- */}
      {showReviewModal && todayCommitment?.has_commitment && (
         <div className="fixed inset-0 bg-[#000000]/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
           {/* Modal Content Box */}
           <div className="bg-[#242424] border border-[#242424]/60 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
             {/* Modal Header */}
             <div className="flex items-center justify-between p-6 border-b border-[#242424]/60 sticky top-0 bg-[#242424]/95 backdrop-blur-md z-10 rounded-t-3xl">
               <h2 className="text-2xl font-bold text-[#FBFAEE]">Did You Ship It?</h2>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  resetReviewForm(); // Reset form when closing manually
                }}
                 className="text-[#FBFAEE]/60 hover:text-[#FBFAEE] transition-colors p-2 hover:bg-[#000000]/30 rounded-lg"
                 aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* Commitment Reminder */}
               <div className="bg-[#933DC9]/10 border border-[#933DC9]/30 rounded-xl p-4">
                 <p className="text-sm text-[#FBFAEE]/70 mb-1">Your commitment:</p>
                 <p className="text-lg text-[#FBFAEE] font-semibold italic">"{todayCommitment.commitment}"</p>
              </div>

              {/* Conditional Rendering: Form or Feedback */}
              {!feedback ? (
                // --- Review Form ---
                <>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Yes Button */}
                    <button
                      onClick={() => setShipped(true)}
                      className={`p-6 rounded-2xl transition-all border ${
                        shipped === true
                           ? 'bg-gradient-to-r from-green-600 to-emerald-500 border-green-400 shadow-lg scale-105 ring-2 ring-green-400/50 ring-offset-2 ring-offset-[#242424]'
                           : 'bg-[#000000]/40 hover:bg-[#000000]/60 border-[#242424]/50 hover:border-[#242424]/80'
                      }`}
                    >
                       <CheckCircle className={`w-10 h-10 mx-auto mb-2 ${
                        shipped === true ? 'text-[#FBFAEE]' : 'text-[#FBFAEE]/50'
                      }`} />
                       <p className={`font-semibold text-lg ${
                        shipped === true ? 'text-[#FBFAEE]' : 'text-[#FBFAEE]/70'
                      }`}>
                        Yes, I Shipped! ✅
                      </p>
                    </button>

                    {/* No Button */}
                    <button
                      onClick={() => setShipped(false)}
                      className={`p-6 rounded-2xl transition-all border ${
                        shipped === false
                           ? 'bg-gradient-to-r from-red-600 to-orange-500 border-red-400 shadow-lg scale-105 ring-2 ring-red-400/50 ring-offset-2 ring-offset-[#242424]'
                           : 'bg-[#000000]/40 hover:bg-[#000000]/60 border-[#242424]/50 hover:border-[#242424]/80'
                      }`}
                    >
                       <XCircle className={`w-10 h-10 mx-auto mb-2 ${
                        shipped === false ? 'text-[#FBFAEE]' : 'text-[#FBFAEE]/50'
                      }`} />
                       <p className={`font-semibold text-lg ${
                        shipped === false ? 'text-[#FBFAEE]' : 'text-[#FBFAEE]/70'
                      }`}>
                        No, I Didn't ❌
                      </p>
                    </button>
                  </div>

                  {/* Excuse Input (Conditional) */}
                  {shipped === false && (
                    <div className="animate-in slide-in-from-top-4 duration-300">
                       <label className="block text-sm font-medium text-[#FBFAEE]/80 mb-2">
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
                       <p className="text-xs text-[#FBFAEE]/60 mt-1.5">
                        💡 Honesty helps the AI identify and break your patterns.
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={handleReview}
                    disabled={reviewing || shipped === null || (shipped === false && !excuse.trim())}
                     className="w-full bg-gradient-to-r from-[#933DC9] to-[#53118F] text-[#FBFAEE] py-3 rounded-xl font-semibold hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center shadow-lg text-lg"
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
                // --- AI Feedback Display ---
                <div className="space-y-6 animate-in fade-in duration-500">
                   {/* Feedback Box */}
                   <div className={`border rounded-2xl p-6 ${
                    shipped
                      ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/40'
                      : 'bg-gradient-to-br from-red-900/30 to-orange-900/30 border-red-500/40'
                  }`}>
                     <h3 className={`text-xl font-bold mb-3 ${
                      shipped ? 'text-green-400' : 'text-red-400' // Kept functional colors
                    }`}>
                      {shipped ? '🎉 Nice Work!' : '🤔 AI Analysis'}
                    </h3>
                    <MarkdownRenderer
                      content={feedback}
                       className="text-[#FBFAEE]/90" // Ensure MarkdownRenderer uses this color
                    />
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={() => {
                      setShowReviewModal(false);
                      resetReviewForm();
                    }}
                     className="w-full bg-[#000000]/40 text-[#FBFAEE]/80 py-3 rounded-xl font-semibold hover:bg-[#000000]/60 transition border border-[#242424]/50"
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