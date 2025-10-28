'use client'

import { useState } from 'react'
import axios from 'axios'
import { Github, Loader2 } from 'lucide-react'

const API_URL = 'http://localhost:8000'

interface OnboardingProps {
  onComplete: (username: string) => void
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Step 1: Create user
      await axios.post(`${API_URL}/users`, {
        github_username: username
      })

      setStep(2)

      // Step 2: Analyze GitHub
      const response = await axios.post(`${API_URL}/analyze-github/${username}`)
      
      setLoading(false)
      onComplete(username)
    } catch (err: any) {
      setLoading(false)
      if (err.response?.status === 400 && err.response?.data?.detail === 'User already exists') {
        // User exists, just continue
        setStep(2)
        try {
          await axios.post(`${API_URL}/analyze-github/${username}`)
          onComplete(username)
        } catch (analyzeErr: any) {
          setError(analyzeErr.response?.data?.detail || 'Failed to analyze GitHub profile')
        }
      } else {
        setError(err.response?.data?.detail || 'Failed to connect. Please try again.')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Sage
          </h1>
          <p className="text-xl text-gray-600">Your Brutally Honest AI Mentor</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {step === 1 ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Let's get real</h2>
                <p className="text-gray-600">
                  Enter your GitHub username. We'll analyze your repos and tell you what you're <strong>really</strong> doing (not what you think you're doing).
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub Username
                  </label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="octocat"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !username}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Start My Journey'
                  )}
                </button>
              </form>

              <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> This AI doesn't validate you. It challenges you. 
                  If you're looking for compliments, this isn't the place.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-blue-600" />
              <h3 className="text-xl font-bold mb-2">Analyzing your GitHub...</h3>
              <p className="text-gray-600">
                Our AI agents are examining your repos, commit patterns, and behavior.
                This takes about 30 seconds.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Open source • Privacy-focused • No BS</p>
        </div>
      </div>
    </div>
  )
}