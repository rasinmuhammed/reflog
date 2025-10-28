'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Github, Brain, Target, TrendingUp, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import CheckInModal from './CheckInModal'
import AgentInsights from './AgentInsights'

const API_URL = 'http://localhost:8000'

interface DashboardProps {
  githubUsername: string
}

interface DashboardData {
  user: {
    username: string
    member_since: string
  }
  github: {
    total_repos: number
    active_repos: number
    languages: Record<string, number>
    patterns: Array<{
      type: string
      severity: string
      message: string
    }>
  }
  stats: {
    total_checkins: number
    commitments_kept: number
    success_rate: number
    avg_energy: number
  }
  recent_advice: Array<{
    agent: string
    advice: string
    date: string
  }>
}

export default function Dashboard({ githubUsername }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCheckin, setShowCheckin] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    loadDashboard()
  }, [githubUsername, refreshKey])

  const loadDashboard = async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/${githubUsername}`)
      setData(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Failed to load dashboard:', err)
      setLoading(false)
    }
  }

  const handleCheckinComplete = () => {
    setShowCheckin(false)
    setRefreshKey(prev => prev + 1)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load dashboard</p>
        </div>
      </div>
    )
  }

  const activePercentage = data.github.total_repos > 0 
    ? (data.github.active_repos / data.github.total_repos * 100).toFixed(0)
    : 0

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, {data.user.username}</h1>
            <p className="text-gray-600">Member since {data.user.member_since}</p>
          </div>
          <button
            onClick={() => setShowCheckin(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition"
          >
            Daily Check-in
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Stats */}
        <div className="lg:col-span-1 space-y-6">
          {/* GitHub Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Github className="w-6 h-6 mr-2 text-gray-700" />
              <h2 className="text-xl font-bold">GitHub Reality Check</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Repos</span>
                  <span className="font-semibold">{data.github.total_repos}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Active (3mo)</span>
                  <span className="font-semibold text-green-600">{data.github.active_repos}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${activePercentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {activePercentage}% of your repos are actually maintained
                </p>
              </div>

              <div>
                <span className="text-sm text-gray-600 block mb-2">Top Languages</span>
                {Object.entries(data.github.languages).slice(0, 3).map(([lang, count]) => (
                  <div key={lang} className="flex justify-between text-sm mb-1">
                    <span>{lang}</span>
                    <span className="text-gray-500">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Check-in Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Target className="w-6 h-6 mr-2 text-blue-600" />
              <h2 className="text-xl font-bold">Accountability</h2>
            </div>

            <div className="space-y-4">
              <div className="text-center py-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                <div className="text-4xl font-bold text-blue-600">
                  {data.stats.success_rate.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600 mt-1">Success Rate</div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold">{data.stats.total_checkins}</div>
                  <div className="text-xs text-gray-600">Check-ins</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600">{data.stats.commitments_kept}</div>
                  <div className="text-xs text-gray-600">Kept</div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Avg Energy</span>
                  <span className="font-semibold">{data.stats.avg_energy}/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${data.stats.avg_energy * 10}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle & Right Columns - Insights */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patterns Detected */}
          {data.github.patterns.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Brain className="w-6 h-6 mr-2 text-purple-600" />
                <h2 className="text-xl font-bold">Patterns Detected</h2>
              </div>

              <div className="space-y-3">
                {data.github.patterns.map((pattern, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-l-4 ${
                      pattern.severity === 'high'
                        ? 'bg-red-50 border-red-500'
                        : pattern.severity === 'medium'
                        ? 'bg-yellow-50 border-yellow-500'
                        : 'bg-green-50 border-green-500'
                    }`}
                  >
                    <div className="flex items-start">
                      {pattern.severity === 'positive' ? (
                        <CheckCircle className="w-5 h-5 mr-2 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 mr-2 text-yellow-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-semibold text-sm capitalize mb-1">
                          {pattern.type.replace(/_/g, ' ')}
                        </div>
                        <p className="text-sm text-gray-700">{pattern.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Agent Insights */}
          <AgentInsights advice={data.recent_advice} />
        </div>
      </div>

      {/* Check-in Modal */}
      {showCheckin && (
        <CheckInModal
          githubUsername={githubUsername}
          onClose={() => setShowCheckin(false)}
          onComplete={handleCheckinComplete}
        />
      )}
    </div>
  )
}