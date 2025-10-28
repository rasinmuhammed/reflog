'use client'

import { useState } from 'react'
import axios from 'axios'
import { X, Loader2 } from 'lucide-react'

const API_URL = 'http://localhost:8000'

interface CheckInModalProps {
  githubUsername: string
  onClose: () => void
  onComplete: () => void
}

export default function CheckInModal({ githubUsername, onClose, onComplete }: CheckInModalProps) {
  const [energyLevel, setEnergyLevel] = useState(5)
  const [avoiding, setAvoiding] = useState('')
  const [commitment, setCommitment] = useState('')
  const [mood, setMood] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState('')
  const [step, setStep] = useState(1)

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Daily Check-in</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Energy Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Energy Level: <span className="text-2xl font-bold text-blue-600">{energyLevel}</span>/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Exhausted</span>
                  <span>Energized</span>
                </div>
              </div>

              {/* What are you avoiding? */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What are you avoiding today? <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={avoiding}
                  onChange={(e) => setAvoiding(e.target.value)}
                  placeholder="Be honest. What task makes you uncomfortable?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This is where honesty matters most.
                </p>
              </div>

              {/* Commitment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What will you ship today? <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={commitment}
                  onChange={(e) => setCommitment(e.target.value)}
                  placeholder="Not 'work on' - what will you COMPLETE? Be specific."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Vague goals = no accountability. Be specific with what 'done' looks like.
                </p>
              </div>

              {/* Mood (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Mood (Optional)
                </label>
                <input
                  type="text"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  placeholder="Anxious, motivated, tired, focused..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !avoiding || !commitment}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Submit Check-in'
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              {/* AI Response */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border-l-4 border-purple-500">
                <h3 className="font-bold text-lg mb-3 flex items-center">
                  <span className="mr-2">🧠</span>
                  AI Analysis
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {aiResponse}
                </p>
              </div>

              {/* Action Items Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold mb-3">Your Commitment Today:</h4>
                <p className="text-gray-700 mb-4 italic">"{commitment}"</p>
                <p className="text-sm text-gray-600">
                  We'll check in tonight to see if you shipped it. No excuses accepted.
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
              >
                Got it. Let's work.
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}