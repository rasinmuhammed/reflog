'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Github, Brain, Target, TrendingUp, AlertCircle, CheckCircle, MessageCircle, BookOpen, Menu, X, History, Eye, Calendar as CalendarIcon } from 'lucide-react'
import CheckInModal from './CheckInModal'
import AgentInsights from './AgentInsights'
import Chat from './Chat'
import LifeDecisions from './LifeDecisions'
import InteractionHistory from './InteractionHistory'

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
    id: number
    agent: string
    advice: string
    date: string
    type: string
  }>
}

type TabType = 'overview' | 'chat' | 'decisions' | 'history'

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
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500 mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <p className="text-gray-400 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center bg-red-500/10 border border-red-500/30 rounded-2xl p-8">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 text-lg">Failed to load dashboard</p>
        </div>
      </div>
    )
  }

  const activePercentage = data.github.total_repos > 0 
    ? (data.github.active_repos / data.github.total_repos * 100).toFixed(0)
    : 0

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: Target, color: 'blue' },
    { id: 'chat' as TabType, label: 'Chat', icon: MessageCircle, color: 'purple' },
    { id: 'decisions' as TabType, label: 'Decisions', icon: BookOpen, color: 'green' },
    { id: 'history' as TabType, label: 'History', icon: History, color: 'orange' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Modern Header */}
      <header className="bg-gray-900/80 border-b border-gray-800/50 sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-3 rounded-2xl shadow-lg">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Sage
                </h1>
                <p className="text-xs text-gray-500">@{data.user.username}</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2 bg-gray-800/50 rounded-2xl p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2.5 rounded-xl transition-all flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? `bg-${tab.color}-500/20 text-${tab.color}-400 shadow-lg`
                        : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </nav>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCheckin(true)}
                className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Daily Check-in</span>
              </button>
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-gray-400 hover:text-gray-300 p-2 hover:bg-gray-800 rounded-xl transition"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 pt-2 border-t border-gray-800">
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id)
                        setMobileMenuOpen(false)
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl flex items-center space-x-3 transition-all ${
                        activeTab === tab.id
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'text-gray-400 hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => {
                  setShowCheckin(true)
                  setMobileMenuOpen(false)
                }}
                className="w-full mt-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2"
              >
                <CalendarIcon className="w-5 h-5" />
                <span>Daily Check-in</span>
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
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-3 rounded-xl mr-3">
                    <Github className="w-6 h-6 text-gray-300" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">GitHub Reality</h2>
                    <p className="text-xs text-gray-500">Your actual activity</p>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-400">Total Repos</span>
                      <span className="text-2xl font-bold text-white">{data.github.total_repos}</span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-400">Active (3mo)</span>
                      <span className="text-2xl font-bold text-green-400">{data.github.active_repos}</span>
                    </div>
                    <div className="relative w-full bg-gray-700 rounded-full h-3 mt-3 overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-400 rounded-full transition-all duration-1000"
                        style={{ width: `${activePercentage}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      {activePercentage}% maintained
                    </p>
                  </div>

                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <span className="text-sm text-gray-400 block mb-3 font-medium">Top Languages</span>
                    <div className="space-y-2">
                      {Object.entries(data.github.languages).slice(0, 3).map(([lang, count]) => (
                        <div key={lang} className="flex items-center justify-between">
                          <span className="text-gray-300 text-sm">{lang}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                                style={{ width: `${Math.min((count as number / data.github.total_repos) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-gray-500 text-xs w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Accountability Stats */}
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-xl mr-3">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Accountability</h2>
                    <p className="text-xs text-gray-500">Your commitment track record</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="relative bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl p-6 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent"></div>
                    <div className="relative text-center">
                      <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                        {data.stats.success_rate.toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-400 font-medium">Success Rate</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-white mb-1">{data.stats.total_checkins}</div>
                      <div className="text-xs text-gray-400">Check-ins</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-green-400 mb-1">{data.stats.commitments_kept}</div>
                      <div className="text-xs text-gray-400">Kept</div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Average Energy</span>
                      <span className="text-lg font-bold text-white">{data.stats.avg_energy}<span className="text-gray-500 text-sm">/10</span></span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${data.stats.avg_energy * 10}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Insights & Patterns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Interactions Quick View */}
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-br from-orange-600 to-red-600 p-3 rounded-xl mr-3">
                      <History className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Recent Interactions</h2>
                      <p className="text-xs text-gray-500">Your latest AI conversations</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('history')}
                    className="flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300 transition"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View All</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {data.recent_advice.slice(0, 3).map((item) => {
                    const typeColors: Record<string, string> = {
                      chat: 'from-purple-500 to-pink-500',
                      checkin: 'from-blue-500 to-cyan-500',
                      analysis: 'from-green-500 to-emerald-500'
                    }
                    const typeIcons: Record<string, any> = {
                      chat: MessageCircle,
                      checkin: CalendarIcon,
                      analysis: Brain
                    }
                    const Icon = typeIcons[item.type] || Brain

                    return (
                      <div
                        key={item.id}
                        className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:bg-gray-800 transition-all cursor-pointer group"
                        onClick={() => setActiveTab('history')}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`bg-gradient-to-r ${typeColors[item.type]} text-white p-2 rounded-lg flex-shrink-0 group-hover:scale-110 transition-transform`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-white text-sm">{item.agent}</span>
                              <span className="text-xs text-gray-500">{item.date}</span>
                            </div>
                            <p className="text-sm text-gray-400 line-clamp-2">{item.advice}</p>
                            <div className="mt-2">
                              <span className="text-xs text-gray-600 capitalize">{item.type}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Patterns Detected */}
              {data.github.patterns.length > 0 && (
                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6">
                  <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-xl mr-3">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Patterns Detected</h2>
                      <p className="text-xs text-gray-500">AI-identified behavior patterns</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {data.github.patterns.map((pattern, idx) => {
                      const severityStyles = {
                        high: 'from-red-500/20 to-orange-500/20 border-red-500/40',
                        medium: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/40',
                        positive: 'from-green-500/20 to-emerald-500/20 border-green-500/40'
                      }
                      const severityIcons = {
                        high: AlertCircle,
                        medium: TrendingUp,
                        positive: CheckCircle
                      }
                      const Icon = severityIcons[pattern.severity as keyof typeof severityIcons] || AlertCircle

                      return (
                        <div
                          key={idx}
                          className={`bg-gradient-to-br ${severityStyles[pattern.severity as keyof typeof severityStyles]} border rounded-xl p-4`}
                        >
                          <div className="flex items-start space-x-3">
                            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                              pattern.severity === 'positive' ? 'text-green-400' : 
                              pattern.severity === 'high' ? 'text-red-400' : 'text-yellow-400'
                            }`} />
                            <div className="flex-1">
                              <div className="font-semibold text-sm capitalize text-white mb-1">
                                {pattern.type.replace(/_/g, ' ')}
                              </div>
                              <p className="text-sm text-gray-300">{pattern.message}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
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
          <div className="max-w-6xl mx-auto">
            <LifeDecisions githubUsername={githubUsername} />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="max-w-5xl mx-auto">
            <InteractionHistory githubUsername={githubUsername} />
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