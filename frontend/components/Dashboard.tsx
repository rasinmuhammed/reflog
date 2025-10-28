'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Github, Brain, Target, TrendingUp, AlertCircle, CheckCircle, XCircle, MessageCircle, BookOpen, Menu, X } from 'lucide-react'
import CheckInModal from './CheckInModal'
import AgentInsights from './AgentInsights'

// This file is: frontend/components/Dashboard.tsx
import Chat from './Chat'
import LifeDecisions from './LifeDecisions'

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

type TabType = 'overview' | 'chat' | 'decisions'

export default function Dashboard({ githubUsername }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCheckin, setShowCheckin] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">Failed to load dashboard</p>
        </div>
      </div>
    )
  }

  const activePercentage = data.github.total_repos > 0 
    ? (data.github.active_repos / data.github.total_repos * 100).toFixed(0)
    : 0

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40 backdrop-blur-lg bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Sage
              </h1>
              <span className="ml-3 text-gray-500">|</span>
              <span className="ml-3 text-gray-400">{data.user.username}</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'overview'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Target className="w-4 h-4 inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'chat'
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                }`}
              >
                <MessageCircle className="w-4 h-4 inline mr-2" />
                Chat
              </button>
              <button
                onClick={() => setActiveTab('decisions')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'decisions'
                    ? 'bg-green-500/20 text-green-400'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                }`}
              >
                <BookOpen className="w-4 h-4 inline mr-2" />
                Decisions
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCheckin(true)}
                className="hidden md:block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition"
              >
                Daily Check-in
              </button>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-gray-400 hover:text-gray-300"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-800">
              <button
                onClick={() => {
                  setActiveTab('overview')
                  setMobileMenuOpen(false)
                }}
                className={`w-full text-left px-4 py-3 rounded-lg mb-2 ${
                  activeTab === 'overview'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-gray-400'
                }`}
              >
                <Target className="w-4 h-4 inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => {
                  setActiveTab('chat')
                  setMobileMenuOpen(false)
                }}
                className={`w-full text-left px-4 py-3 rounded-lg mb-2 ${
                  activeTab === 'chat'
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-gray-400'
                }`}
              >
                <MessageCircle className="w-4 h-4 inline mr-2" />
                Chat
              </button>
              <button
                onClick={() => {
                  setActiveTab('decisions')
                  setMobileMenuOpen(false)
                }}
                className={`w-full text-left px-4 py-3 rounded-lg mb-2 ${
                  activeTab === 'decisions'
                    ? 'bg-green-500/20 text-green-400'
                    : 'text-gray-400'
                }`}
              >
                <BookOpen className="w-4 h-4 inline mr-2" />
                Decisions
              </button>
              <button
                onClick={() => {
                  setShowCheckin(true)
                  setMobileMenuOpen(false)
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-3 rounded-lg font-semibold mt-4"
              >
                Daily Check-in
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Stats */}
            <div className="lg:col-span-1 space-y-6">
              {/* GitHub Stats */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl p-6">
                <div className="flex items-center mb-4">
                  <Github className="w-6 h-6 mr-2 text-gray-400" />
                  <h2 className="text-xl font-bold text-white">GitHub Reality Check</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">Repos</span>
                      <span className="font-semibold text-white">{data.github.total_repos}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">Active (3mo)</span>
                      <span className="font-semibold text-green-400">{data.github.active_repos}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                        style={{ width: `${activePercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {activePercentage}% of your repos are actually maintained
                    </p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-400 block mb-2">Top Languages</span>
                    {Object.entries(data.github.languages).slice(0, 3).map(([lang, count]) => (
                      <div key={lang} className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">{lang}</span>
                        <span className="text-gray-500">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Check-in Stats */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl p-6">
                <div className="flex items-center mb-4">
                  <Target className="w-6 h-6 mr-2 text-blue-400" />
                  <h2 className="text-xl font-bold text-white">Accountability</h2>
                </div>

                <div className="space-y-4">
                  <div className="text-center py-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg">
                    <div className="text-4xl font-bold text-blue-400">
                      {data.stats.success_rate.toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-400 mt-1">Success Rate</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="text-2xl font-bold text-white">{data.stats.total_checkins}</div>
                      <div className="text-xs text-gray-400">Check-ins</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="text-2xl font-bold text-green-400">{data.stats.commitments_kept}</div>
                      <div className="text-xs text-gray-400">Kept</div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">Avg Energy</span>
                      <span className="font-semibold text-white">{data.stats.avg_energy}/10</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        style={{ width: `${data.stats.avg_energy * 10}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Columns - Insights */}
            <div className="lg:col-span-2 space-y-6">
              {/* Patterns Detected */}
              {data.github.patterns.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl p-6">
                  <div className="flex items-center mb-4">
                    <Brain className="w-6 h-6 mr-2 text-purple-400" />
                    <h2 className="text-xl font-bold text-white">Patterns Detected</h2>
                  </div>

                  <div className="space-y-3">
                    {data.github.patterns.map((pattern, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border-l-4 ${
                          pattern.severity === 'high'
                            ? 'bg-red-500/10 border-red-500'
                            : pattern.severity === 'medium'
                            ? 'bg-yellow-500/10 border-yellow-500'
                            : 'bg-green-500/10 border-green-500'
                        }`}
                      >
                        <div className="flex items-start">
                          {pattern.severity === 'positive' ? (
                            <CheckCircle className="w-5 h-5 mr-2 text-green-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-5 h-5 mr-2 text-yellow-400 flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="font-semibold text-sm capitalize text-white mb-1">
                              {pattern.type.replace(/_/g, ' ')}
                            </div>
                            <p className="text-sm text-gray-300">{pattern.message}</p>
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
        )}

        {activeTab === 'chat' && (
          <div className="max-w-5xl mx-auto">
            <Chat githubUsername={githubUsername} />
          </div>
        )}

        {activeTab === 'decisions' && (
          <div className="max-w-5xl mx-auto">
            <LifeDecisions githubUsername={githubUsername} />
          </div>
        )}
      </main>

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