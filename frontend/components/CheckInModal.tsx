'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { X, Loader2, Calendar, TrendingUp, Brain, CheckCircle, XCircle } from 'lucide-react'

const API_URL = 'http://localhost:8000'

interface CheckInModalProps {
  githubUsername: string
  onClose: () => void
  onComplete: () => void
}

interface CheckIn {
  id: number
  timestamp: string
  energy_level: number
  avoiding_what: string
  commitment: string
  shipped: boolean | null
  excuse: string | null
  mood: string | null
  ai_analysis: string | null
}

export default function CheckInModal({ githubUsername, onClose, onComplete }: CheckInModalProps) {
  const [energyLevel, setEnergyLevel] = useState(5)
  const [avoiding, setAvoiding] = useState('')
  const [commitment, setCommitment] = useState('')
  const [mood, setMood] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState('')
  const [step, setStep] = useState(1)
  const [recentCheckins, setRecentCheckins] = useState<CheckIn[]>([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    loadRecentCheckins()
  }, [githubUsername])

  const loadRecentCheckins = async () => {
    try {
      const response = await axios.get(`${API_URL}/checkins/${githubUsername}?limit=7`)
      setRecentCheckins(response.data)
    } catch (error) {
      console.error('Failed to load recent check-ins:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post(`${API_URL}/checkins/${githubUsername}`, {
        energy_level: energyLevel,
        avoiding_what: avoiding,
        commitment: commitment,
        mood: mood
      })

      setAiResponse(response.data.ai_response)
      setStep(2)
      setLoading(false)
    } catch (err) {
      console.error('Check-in failed:', err)
      setLoading(false)
      alert('Failed to submit check-in')
    }
  }

  const handleClose = () => {
    onComplete()
    onClose()
  }

  const getEnergyColor = (level: number) => {
    if (level <= 3) return 'from-red-500 to-orange-500'
    if (level <= 6) return 'from-yellow-500 to-amber-500'
    return 'from-green-500 to-emerald-500'
  }

  const getEnergyEmoji = (level: number) => {
    if (level <= 3) return '😫'
    if (level <= 6) return '😐'
    return '😃'
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-900/95 backdrop-blur-lg z-10 rounded-t-3xl">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-xl mr-3 shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Daily Check-in</h2>
              <p className="text-sm text-gray-400">Be honest. The AI knows when you're not.</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {recentCheckins.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-gray-400 hover:text-gray-300 transition-colors px-3 py-2 hover:bg-gray-800 rounded-lg text-sm"
              >
                {showHistory ? 'Hide' : 'View'} History
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300 transition-colors p-2 hover:bg-gray-800 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {showHistory ? (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white mb-4">Recent Check-ins</h3>
              {recentCheckins.map((checkin) => (
                <div
                  key={checkin.id}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`bg-gradient-to-r ${getEnergyColor(checkin.energy_level)} text-white px-3 py-1 rounded-lg font-bold`}>
                        {checkin.energy_level}/10
                      </div>
                      <span className="text-sm text-gray-400">
                        {new Date(checkin.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {checkin.shipped !== null && (
                      <div className="flex items-center space-x-2">
                        {checkin.shipped ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                        <span className={`text-sm ${checkin.shipped ? 'text-green-400' : 'text-red-400'}`}>
                          {checkin.shipped ? 'Shipped' : 'Not Shipped'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">Commitment: </span>
                      <span className="text-gray-200">{checkin.commitment}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Avoiding: </span>
                      <span className="text-gray-200">{checkin.avoiding_what}</span>
                    </div>
                    {checkin.ai_analysis && (
                      <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                        <p className="text-xs text-gray-300 line-clamp-2">{checkin.ai_analysis}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <button
                onClick={() => setShowHistory(false)}
                className="w-full mt-4 bg-gray-800 text-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-700 transition border border-gray-700"
              >
                Back to New Check-in
              </button>
            </div>
          ) : step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Energy Level with Visual Feedback */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Energy Level: 
                  <span className={`text-3xl font-bold ml-3 bg-gradient-to-r ${getEnergyColor(energyLevel)} bg-clip-text text-transparent`}>
                    {energyLevel} {getEnergyEmoji(energyLevel)}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, 
                        rgb(239, 68, 68) 0%, 
                        rgb(251, 191, 36) 50%, 
                        rgb(34, 197, 94) 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                    <span>Exhausted</span>
                    <span>Neutral</span>
                    <span>Energized</span>
                  </div>
                </div>
              </div>

              {/* What are you avoiding? */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  What are you avoiding today? <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={avoiding}
                  onChange={(e) => setAvoiding(e.target.value)}
                  placeholder="Be brutally honest. What task makes you uncomfortable?"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"
                  rows={3}
                  required
                />
                <p className="text-xs text-gray-500 mt-2 flex items-start">
                  <Brain className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                  This is where honesty matters most. The AI can only help if you're truthful.
                </p>
              </div>

              {/* Commitment */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  What will you ship today? <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={commitment}
                  onChange={(e) => setCommitment(e.target.value)}
                  placeholder="Not 'work on' - what will you COMPLETE? Be specific with what 'done' looks like."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"
                  rows={3}
                  required
                />
                <p className="text-xs text-gray-500 mt-2 flex items-start">
                  <TrendingUp className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                  Vague goals = no accountability. Be specific.
                </p>
              </div>

              {/* Mood (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Mood (Optional)
                </label>
                <input
                  type="text"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  placeholder="Anxious, motivated, tired, focused, overwhelmed..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {/* Recent Performance Stats */}
              {recentCheckins.length > 0 && (
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">Your Recent Performance</h4>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="text-xl font-bold text-white">{recentCheckins.length}</div>
                      <div className="text-xs text-gray-400">Check-ins</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="text-xl font-bold text-green-400">
                        {recentCheckins.filter(c => c.shipped === true).length}
                      </div>
                      <div className="text-xs text-gray-400">Shipped</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="text-xl font-bold text-blue-400">
                        {(recentCheckins.reduce((sum, c) => sum + c.energy_level, 0) / recentCheckins.length).toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-400">Avg Energy</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !avoiding || !commitment}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing your patterns...
                  </>
                ) : (
                  'Submit Check-in'
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              {/* AI Response */}
              <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/40 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl mr-3">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-white">AI Analysis</h3>
                </div>
                <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {aiResponse}
                </p>
              </div>

              {/* Commitment Summary */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                <h4 className="font-semibold text-white mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                  Your Commitment Today
                </h4>
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4 mb-4">
                  <p className="text-gray-200 italic">"{commitment}"</p>
                </div>
                <p className="text-sm text-gray-400">
                  We'll check in tonight to see if you shipped it. No excuses accepted.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleClose}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  Got it. Let's work. 💪
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}