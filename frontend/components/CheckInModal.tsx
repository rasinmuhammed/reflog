'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { X, Loader2, Calendar, TrendingUp, Brain, CheckCircle, XCircle, History, AlertCircle } from 'lucide-react' // Added History, AlertCircle
import MarkdownRenderer from './MarkdownRenderer' // Ensure this uses #FBFAEE text color

// Assuming API_URL is defined elsewhere or replace with actual URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface CheckInModalProps {
  githubUsername: string
  onClose: () => void
  onComplete: () => void // Called after successful submission and closing
}

interface CheckIn {
  id: number
  timestamp: string
  energy_level: number
  avoiding_what: string
  commitment: string
  shipped: boolean | null // null means pending/not reviewed
  excuse: string | null
  mood: string | null
  ai_analysis: string | null
}

export default function CheckInModal({ githubUsername, onClose, onComplete }: CheckInModalProps) {
  const [energyLevel, setEnergyLevel] = useState(5)
  const [avoiding, setAvoiding] = useState('')
  const [commitment, setCommitment] = useState('')
  const [mood, setMood] = useState('')
  const [loading, setLoading] = useState(false) // Loading state for API calls
  const [aiResponse, setAiResponse] = useState('')
  const [step, setStep] = useState(1) // 1: Form, 2: AI Response
  const [recentCheckins, setRecentCheckins] = useState<CheckIn[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false); // Separate loading for history
  const [error, setError] = useState<string | null>(null); // Error state

  useEffect(() => {
    // Optionally load history immediately if needed, or lazy load on button click
    // loadRecentCheckins();
  }, [githubUsername])

  const commitmentTemplates = [
    "Complete [feature] by [time]",
    "Ship [project milestone] today",
    "Write [number] lines of production code",
    "Deploy [specific component] to production",
    "Finish [specific task] without refactoring"
  ]

  const loadRecentCheckins = async () => {
    if (recentCheckins.length > 0 && !showHistory) { // Avoid refetching if already loaded
        setShowHistory(true);
        return;
    }
    setHistoryLoading(true);
    setError(null);
    try {
      // Fetch last 7 checkins
      const response = await axios.get(`${API_URL}/checkins/${githubUsername}?limit=7`)
      // Sort descending (newest first)
      const sorted = response.data.sort((a: CheckIn, b: CheckIn) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setRecentCheckins(sorted);
      setShowHistory(true); // Show history after loading
    } catch (error) {
      console.error('Failed to load recent check-ins:', error)
      setError("Could not load check-in history.");
    } finally {
        setHistoryLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
     if (!avoiding.trim() || !commitment.trim()) {
        setError("Please fill in what you're avoiding and your commitment.");
        return;
    }
    setLoading(true)
    setError(null); // Clear previous errors

    try {
      const response = await axios.post(`${API_URL}/checkins/${githubUsername}`, {
        energy_level: energyLevel,
        avoiding_what: avoiding,
        commitment: commitment,
        mood: mood || null // Send null if empty
      })

      setAiResponse(response.data.ai_response || "Check-in submitted successfully.") // Fallback message
      setStep(2) // Move to the AI response step
    } catch (err) {
      console.error('Check-in failed:', err)
      setError('Failed to submit check-in. Please try again.'); // Set error message
    } finally {
        setLoading(false)
    }
  }

  // Called when the modal is fully closed after step 2
  const handleModalClose = () => {
    onComplete() // Notify parent component
    onClose()    // Close the modal
  }

  // --- Style Helper Functions ---
  // Keep functional colors for energy slider gradient
  const getEnergyGradient = () => `linear-gradient(to right, rgb(239 68 68 / 0.8) 0%, rgb(251 191 36 / 0.8) 50%, rgb(34 197 94 / 0.8) 100%)`;

  const getEnergyEmoji = (level: number) => {
    if (level <= 3) return '😫';
    if (level <= 6) return '😐';
    return '😃';
  }

  return (
     // Modal container: Black background with blur, Floral White text
     <div className="fixed inset-0 bg-[#000000]/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 text-[#FBFAEE]">
       {/* Modal Content Box: Raisin Black background, adjusted border */}
       <div className="bg-[#242424] border border-[#242424]/60 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"> {/* Use flex-col */}
        {/* Header */}
         <div className="flex items-center justify-between p-5 border-b border-[#242424]/60 sticky top-0 bg-[#242424]/95 backdrop-blur-md z-10 rounded-t-3xl flex-shrink-0">
          <div className="flex items-center">
             {/* Icon with Purple Gradient */}
             <div className="bg-gradient-to-br from-[#933DC9] to-[#53118F] p-2.5 rounded-xl mr-3 shadow-md">
              <Calendar className="w-6 h-6 text-[#FBFAEE]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#FBFAEE]">Daily Check-in</h2>
               <p className="text-sm text-[#FBFAEE]/70">Be honest. The AI knows when you're not.</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
             {/* History Button */}
             <button
                onClick={loadRecentCheckins} // Load history on demand
                 className="text-[#FBFAEE]/60 hover:text-[#FBFAEE] transition-colors px-3 py-1.5 hover:bg-[#000000]/30 rounded-lg text-sm flex items-center space-x-1 disabled:opacity-50"
                 disabled={historyLoading}
                 aria-label={showHistory ? "Hide recent check-ins" : "View recent check-ins"}
              >
               {historyLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <History className="w-4 h-4" />}
               <span>{showHistory ? 'Hide' : 'History'}</span>
              </button>
             {/* Close Button */}
            <button
              onClick={onClose}
               className="text-[#FBFAEE]/60 hover:text-[#FBFAEE] transition-colors p-2 hover:bg-[#000000]/30 rounded-lg"
               aria-label="Close check-in modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* History View */}
          {showHistory ? (
             <div className="space-y-3 animate-in fade-in duration-300">
               <h3 className="text-lg font-semibold text-[#FBFAEE] mb-3">Recent Check-ins (Last 7)</h3>
               {historyLoading && <p className="text-[#FBFAEE]/60 text-center">Loading history...</p>}
               {!historyLoading && error && <p className="text-red-400 text-center">{error}</p>}
               {!historyLoading && !error && recentCheckins.length === 0 && <p className="text-[#FBFAEE]/60 text-center">No recent check-ins found.</p>}
               {!historyLoading && !error && recentCheckins.map((checkin) => (
                // History Item Card
                 <div key={checkin.id} className="bg-[#000000]/40 border border-[#242424]/40 rounded-xl p-3 text-sm">
                   <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#242424]/40">
                    <div className="flex items-center space-x-2">
                       {/* Energy Badge - Keep functional colors */}
                       <div className={`bg-gradient-to-r ${checkin.energy_level <= 3 ? 'from-red-600 to-orange-500' : checkin.energy_level <= 6 ? 'from-yellow-600 to-amber-500' : 'from-green-600 to-emerald-500'} text-[#FBFAEE] px-2 py-0.5 rounded-md text-xs font-bold shadow-sm`}>
                        {checkin.energy_level}/10
                      </div>
                       <span className="text-xs text-[#FBFAEE]/60">
                        {new Date(checkin.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric'})}
                      </span>
                    </div>
                     {/* Shipped Status */}
                    {checkin.shipped !== null && (
                      <div className={`flex items-center space-x-1 text-xs font-medium px-2 py-0.5 rounded-full border ${
                          checkin.shipped ? 'bg-green-900/40 text-green-300 border-green-500/40' : 'bg-red-900/40 text-red-300 border-red-500/40'
                      }`}>
                        {checkin.shipped ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{checkin.shipped ? 'Shipped' : 'Missed'}</span>
                      </div>
                    )}
                     {checkin.shipped === null && (
                         <span className="text-xs text-[#FBFAEE]/40 italic">Pending</span>
                     )}
                  </div>
                   {/* Details */}
                   <div className="space-y-1">
                     <div><span className="text-[#FBFAEE]/60 text-[11px] uppercase tracking-wide">Commitment:</span> <span className="text-[#FBFAEE]/90 ml-1">{checkin.commitment}</span></div>
                     <div><span className="text-[#FBFAEE]/60 text-[11px] uppercase tracking-wide">Avoiding:</span> <span className="text-[#FBFAEE]/90 ml-1">{checkin.avoiding_what}</span></div>
                     {/* AI Analysis Preview */}
                     {checkin.ai_analysis && (
                        <div className="mt-2 pt-1 border-t border-[#242424]/30">
                           <p className="text-[11px] text-[#FBFAEE]/60 line-clamp-2 italic">{checkin.ai_analysis}</p>
                        </div>
                     )}
                  </div>
                </div>
              ))}
               {/* Back Button */}
              <button
                onClick={() => setShowHistory(false)}
                 className="w-full mt-4 bg-[#000000]/40 text-[#FBFAEE]/80 py-2.5 rounded-lg font-semibold hover:bg-[#000000]/60 transition border border-[#242424]/50 text-sm"
              >
                Back to New Check-in
              </button>
            </div>
          ) : step === 1 ? (
             // --- Check-in Form ---
             <form onSubmit={handleSubmit} className="space-y-5">
                {error && <div className="p-3 bg-red-900/40 border border-red-500/50 text-red-300 rounded-lg text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-2"/> {error}</div>}

              {/* Energy Level */}
              <div>
                 <label className="block text-sm font-medium text-[#FBFAEE]/80 mb-2">
                  Energy Level:
                   <span className={`text-2xl font-bold ml-2 bg-clip-text text-transparent`} style={{ backgroundImage: getEnergyGradient() }}>
                    {energyLevel} {getEnergyEmoji(energyLevel)}
                  </span>
                </label>
                <div className="relative pt-1">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                     // Custom styled range input
                     className="w-full h-2 bg-[#000000]/50 rounded-lg appearance-none cursor-pointer range-lg accent-[#933DC9]" // Use accent color for thumb
                    // Style below might not be needed if using accent-*
                    // style={{ background: getEnergyGradient() }}
                  />
                   <div className="flex justify-between text-xs text-[#FBFAEE]/60 mt-1 px-1">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                </div>
              </div>

              {/* Avoiding */}
              <div>
                 <label className="block text-sm font-medium text-[#FBFAEE]/80 mb-1.5">
                  What are you avoiding today? <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={avoiding}
                  onChange={(e) => setAvoiding(e.target.value)}
                  placeholder="Be brutally honest. What task makes you uncomfortable or seems 'too hard'?"
                   className="w-full px-4 py-2 bg-[#000000]/50 border border-[#242424]/60 text-[#FBFAEE] placeholder-[#FBFAEE]/50 rounded-lg focus:ring-1 focus:ring-[#933DC9] focus:border-[#933DC9] resize-none transition duration-150"
                  rows={2}
                  required
                />
                 <p className="text-xs text-[#FBFAEE]/60 mt-1 flex items-start">
                  <Brain className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0 text-[#933DC9]" />
                  Honesty here is key for useful AI feedback.
                </p>
              </div>

              {/* Commitment */}
              <div>
                 <label className="block text-sm font-medium text-[#FBFAEE]/80 mb-1.5">
                  What will you *ship* today? <span className="text-red-400">*</span>
                </label>
                {/* Template Pills */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {commitmentTemplates.map((template, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCommitment(template)}
                       className="px-2.5 py-0.5 bg-[#000000]/40 hover:bg-[#000000]/60 text-[#FBFAEE]/70 text-xs rounded-full transition border border-[#242424]/40"
                    >
                      {template.length > 25 ? template.substring(0, 22) + '...' : template}
                    </button>
                  ))}
                </div>
                <textarea
                  value={commitment}
                  onChange={(e) => setCommitment(e.target.value)}
                  placeholder="Define 'done'. Example: 'Deploy feature X', not 'Work on feature X'."
                   className="w-full px-4 py-2 bg-[#000000]/50 border border-[#242424]/60 text-[#FBFAEE] placeholder-[#FBFAEE]/50 rounded-lg focus:ring-1 focus:ring-[#933DC9] focus:border-[#933DC9] resize-none transition duration-150"
                  rows={2}
                  required
                />
                 <p className="text-xs text-[#FBFAEE]/60 mt-1 flex items-start">
                  <TrendingUp className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0 text-[#933DC9]" />
                  Vague goals lead to vague results. Be specific.
                </p>
              </div>

              {/* Mood (Optional) */}
              <div>
                 <label className="block text-sm font-medium text-[#FBFAEE]/80 mb-1.5">
                  Current Mood (Optional)
                </label>
                <input
                  type="text"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  placeholder="e.g., Anxious, motivated, tired, focused..."
                   className="w-full px-4 py-2 bg-[#000000]/50 border border-[#242424]/60 text-[#FBFAEE] placeholder-[#FBFAEE]/50 rounded-lg focus:ring-1 focus:ring-[#933DC9] focus:border-[#933DC9] transition duration-150"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !avoiding.trim() || !commitment.trim()}
                 className="w-full bg-gradient-to-r from-[#933DC9] to-[#53118F] text-[#FBFAEE] py-3 rounded-xl font-semibold hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center shadow-lg text-lg mt-2" // Added margin-top
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Submit & Analyze'
                )}
              </button>
            </form>
          ) : (
            // --- AI Response View (Step 2) ---
             <div className="space-y-6 animate-in fade-in duration-500">
               {/* AI Response Box */}
               <div className="bg-gradient-to-br from-[#933DC9]/15 to-[#53118F]/15 border border-[#933DC9]/30 rounded-2xl p-5 shadow-inner">
                <div className="flex items-center mb-3">
                   <div className="bg-gradient-to-r from-[#933DC9] to-[#53118F] p-2 rounded-lg mr-2.5 shadow-md">
                    <Brain className="w-5 h-5 text-[#FBFAEE]" />
                  </div>
                   <h3 className="font-semibold text-lg text-[#FBFAEE]">AI Analysis</h3>
                </div>
                <div className="prose prose-sm max-w-none text-[#FBFAEE]/90">
                    <MarkdownRenderer
                        content={aiResponse}
                        className="text-[#FBFAEE]/90 text-sm" // Pass text color class
                    />
                </div>
              </div>

              {/* Commitment Summary */}
               <div className="bg-[#000000]/40 border border-[#242424]/40 rounded-xl p-5">
                 <h4 className="font-semibold text-[#FBFAEE]/90 mb-2 flex items-center text-base">
                   <TrendingUp className="w-5 h-5 mr-2 text-green-400" /> {/* Keep green */}
                   Your Commitment for Today
                </h4>
                 <div className="bg-[#000000]/30 border border-[#242424]/30 rounded-lg p-3 mb-3">
                   <p className="text-[#FBFAEE] italic">"{commitment}"</p>
                </div>
                 <p className="text-xs text-[#FBFAEE]/70">
                  Remember this goal. We'll check back later to see if you shipped it. Accountability matters.
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={handleModalClose} // Use the new close handler
                 className="w-full bg-gradient-to-r from-[#933DC9] to-[#53118F] text-[#FBFAEE] py-3 rounded-xl font-semibold hover:brightness-110 transition-all shadow-lg text-lg"
              >
                Got it. Let's work. 💪
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}