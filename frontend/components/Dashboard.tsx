'use client'

import { useState, useEffect } from 'react'
import { UserButton } from '@clerk/nextjs'
import axios from 'axios'
import { Github, Brain, Target, TrendingUp, AlertCircle, CheckCircle, MessageCircle, BookOpen, Menu, X, History, Eye, Calendar as CalendarIcon, ArrowRight } from 'lucide-react'
import CheckInModal from './CheckInModal' 
import AgentInsights from './AgentInsights' 
import Chat from './Chat' 
import LifeDecisions from './LifeDecisions' 
import InteractionHistory from './InteractionHistory' 
import MarkdownRenderer from './MarkdownRenderer' 
import CommitmentTracker from './CommitmentTracker' 
import NotificationBanner from './NotificationBanner' 
import CommitmentCalendar from './CommitmentCalendar'
import Goals from './Goals' 

// Assuming API_URL is defined elsewhere or replace with actual URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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

type TabType = 'overview' | 'chat' | 'commitments' | 'goals'| 'decisions' | 'history'

export default function Dashboard({ githubUsername }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCheckin, setShowCheckin] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showCommitmentReview, setShowCommitmentReview] = useState(false) // Handled within CommitmentTracker now

  useEffect(() => {
    loadDashboard()
  }, [githubUsername, refreshKey])

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/dashboard/${githubUsername}`)
      setData(response.data)
    } catch (err) {
      console.error('Failed to load dashboard:', err)
      // setError('Failed to load data. Please try again.'); // Consider adding an error state
    } finally {
      setLoading(false)
    }
  }

  const handleCheckinComplete = () => {
    setShowCheckin(false)
    setRefreshKey(prev => prev + 1)
  }

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] text-[#FBFAEE] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-[#933DC9] mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="w-8 h-8 text-[#933DC9]" />
            </div>
          </div>
          <p className="text-[#FBFAEE]/80 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // --- Error State ---
  if (!data) {
    return (
      <div className="min-h-screen bg-[#000000] text-[#FBFAEE] flex items-center justify-center p-4">
        <div className="text-center bg-red-900/30 border border-red-500/40 rounded-2xl p-8 max-w-md w-full">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-300 text-lg mb-4">Failed to load dashboard data.</p>
          <button
             onClick={loadDashboard}
             className="mt-4 px-6 py-2 bg-[#933DC9] text-[#FBFAEE] rounded-lg hover:bg-[#7d34ad] transition font-semibold" // Added hover
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // --- Main Dashboard ---
  const activePercentage = data.github.total_repos > 0
    ? (data.github.active_repos / data.github.total_repos * 100).toFixed(0)
    : 0;

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'commitments', label: 'Commitments', icon: CalendarIcon },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'decisions', label: 'Decisions', icon: BookOpen },
    { id: 'history', label: 'History', icon: History }
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-[#FBFAEE]">
        {/* Notification Banner */}
        <NotificationBanner
          githubUsername={githubUsername}
          onReviewClick={() => {
              setActiveTab('commitments');
          }}
        />

      {/* --- Header --- */}
       <header className="bg-[#000000]/80 border-b border-[#242424]/50 sticky top-0 z-40 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Username */}
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-[#933DC9] to-[#53118F] p-3 rounded-2xl shadow-lg">
                <Brain className="w-7 h-7 text-[#FBFAEE]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#933DC9] to-[#53118F] bg-clip-text text-transparent">
                  Reflog
                </h1>
                <p className="text-xs text-[#FBFAEE]/60">@{data.user.username}</p>
              </div>
            </div>

            {/* Desktop Navigation */}
             <nav className="hidden md:flex items-center space-x-1 bg-[#242424]/40 rounded-full p-1 border border-[#242424]/60">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-full transition-all flex items-center space-x-2 text-sm ${
                      isActive
                        ? `bg-[#933DC9]/20 text-[#C488F8] shadow-md ring-1 ring-[#933DC9]/30` // Use lighter purple text for active
                        : 'text-[#FBFAEE]/70 hover:text-[#FBFAEE] hover:bg-[#242424]/60'
                    }`}
                  >
                     <Icon className={`w-4 h-4 ${isActive ? 'text-[#C488F8]' : 'text-[#FBFAEE]/70 group-hover:text-[#FBFAEE]'}`} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCheckin(true)}
                className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-[#933DC9] to-[#53118F] px-5 py-2.5 rounded-xl font-semibold hover:brightness-110 transition-all shadow-lg hover:shadow-[#933DC9]/40"
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Daily Check-in</span>
              </button>

              <div className="flex items-center space-x-2">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10 ring-2 ring-[#933DC9]/40"
                    }
                  }}
                />
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-[#FBFAEE]/70 hover:text-[#FBFAEE] p-2 hover:bg-[#242424]/50 rounded-xl transition"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 pt-2 border-t border-[#242424]/50">
              <div className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                       className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-all text-base ${
                        isActive
                          ? 'bg-[#933DC9]/20 text-[#C488F8]'
                          : 'text-[#FBFAEE]/80 hover:bg-[#242424]/50 hover:text-[#FBFAEE]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => {
                  setShowCheckin(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full mt-3 bg-gradient-to-r from-[#933DC9] to-[#53118F] text-[#FBFAEE] px-4 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:brightness-110 transition"
              >
                <CalendarIcon className="w-5 h-5" />
                <span>Daily Check-in</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* GitHub Stats */}
               <div className="bg-[#242424] border border-[#242424]/50 rounded-2xl shadow-xl p-6">
                 <div className="flex items-center mb-6">
                   <div className="bg-gradient-to-br from-[#333] to-[#111] p-3 rounded-xl mr-3 shadow-md"> {/* Darker gray for GitHub logo contrast */}
                    <Github className="w-6 h-6 text-[#FBFAEE]/90" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#FBFAEE]">GitHub Reality</h2>
                    <p className="text-xs text-[#FBFAEE]/60">Your actual activity</p>
                  </div>
                </div>
                <div className="space-y-4">
                   <div className="bg-[#000000]/40 rounded-xl p-4 border border-[#242424]/40">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-[#FBFAEE]/70">Total Repos</span>
                      <span className="text-2xl font-bold text-[#FBFAEE]">{data.github.total_repos}</span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-[#FBFAEE]/70">Active (3mo)</span>
                       <span className="text-2xl font-bold text-green-400">{data.github.active_repos}</span> {/* Keep green */}
                    </div>
                     <div className="relative w-full bg-[#000000]/50 rounded-full h-2.5 mt-2 overflow-hidden border border-[#242424]/30">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-600 to-emerald-500 rounded-full transition-all duration-1000" // Keep green
                        style={{ width: `${activePercentage}%` }}
                      >
                         <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-xs text-[#FBFAEE]/60 mt-1.5 text-center">
                      {activePercentage}% maintained
                    </p>
                  </div>
                   <div className="bg-[#000000]/40 rounded-xl p-4 border border-[#242424]/40">
                     <span className="text-sm text-[#FBFAEE]/70 block mb-3 font-medium">Top Languages</span>
                    <div className="space-y-1.5">
                      {Object.entries(data.github.languages).slice(0, 3).map(([lang, count]) => (
                        <div key={lang} className="flex items-center justify-between">
                           <span className="text-[#FBFAEE]/90 text-sm">{lang}</span>
                          <div className="flex items-center space-x-2">
                             <div className="w-16 bg-[#000000]/50 rounded-full h-1.5 border border-[#242424]/30">
                              <div
                                className="bg-gradient-to-r from-[#933DC9] to-[#53118F] h-1.5 rounded-full"
                                style={{ width: `${Math.min(((count as number) / (data.github.total_repos || 1)) * 100, 100)}%` }}
                              ></div>
                            </div>
                             <span className="text-[#FBFAEE]/60 text-xs w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                      {Object.keys(data.github.languages).length === 0 && (
                          <p className="text-xs text-[#FBFAEE]/60">No language data found.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Accountability Stats */}
               <div className="bg-[#242424] border border-[#242424]/50 rounded-2xl shadow-xl p-6">
                <div className="flex items-center mb-6">
                   <div className="bg-gradient-to-br from-[#933DC9] to-[#53118F] p-3 rounded-xl mr-3 shadow-md">
                    <Target className="w-6 h-6 text-[#FBFAEE]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#FBFAEE]">Accountability</h2>
                    <p className="text-xs text-[#FBFAEE]/60">Your commitment track record</p>
                  </div>
                </div>
                <div className="space-y-4">
                   <div className="relative bg-gradient-to-br from-[#933DC9]/20 to-[#53118F]/20 border border-[#933DC9]/30 rounded-2xl p-6 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#933DC9]/10 to-transparent"></div>
                    <div className="relative text-center">
                       <div className="text-5xl font-bold bg-gradient-to-r from-[#C488F8] to-[#933DC9] bg-clip-text text-transparent mb-2"> {/* Lighter Purple gradient */}
                        {data.stats.success_rate.toFixed(0)}%
                      </div>
                      <div className="text-sm text-[#FBFAEE]/80 font-medium">Success Rate</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                     <div className="bg-[#000000]/40 rounded-xl p-4 text-center border border-[#242424]/40">
                       <div className="text-3xl font-bold text-[#FBFAEE] mb-1">{data.stats.total_checkins}</div>
                       <div className="text-xs text-[#FBFAEE]/70">Check-ins</div>
                    </div>
                     <div className="bg-[#000000]/40 rounded-xl p-4 text-center border border-[#242424]/40">
                       <div className="text-3xl font-bold text-green-400 mb-1">{data.stats.commitments_kept}</div> {/* Keep green */}
                       <div className="text-xs text-[#FBFAEE]/70">Kept</div>
                    </div>
                  </div>
                   <div className="bg-[#000000]/40 rounded-xl p-4 border border-[#242424]/40">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-sm text-[#FBFAEE]/70">Average Energy</span>
                       <span className="text-lg font-bold text-[#FBFAEE]">{data.stats.avg_energy.toFixed(1)}<span className="text-[#FBFAEE]/60 text-sm">/10</span></span>
                    </div>
                     <div className="w-full bg-[#000000]/50 rounded-full h-1.5 border border-[#242424]/30">
                      <div
                        className="bg-gradient-to-r from-[#933DC9] to-[#53118F] h-1.5 rounded-full transition-all duration-1000"
                        style={{ width: `${data.stats.avg_energy * 10}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Today's Commitment Widget - Kept Orange/Red */}
               <div className="bg-[#242424] border border-[#242424]/50 rounded-2xl shadow-xl p-6">
                <div className="flex items-center mb-4">
                   <div className="bg-gradient-to-br from-orange-600 to-red-600 p-3 rounded-xl mr-3 shadow-md">
                    <CalendarIcon className="w-6 h-6 text-[#FBFAEE]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#FBFAEE]">Today</h2>
                    <p className="text-xs text-[#FBFAEE]/60">Your daily commitment</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('commitments')}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-3 rounded-xl font-semibold hover:brightness-110 transition-all shadow-lg flex items-center justify-center group"
                >
                  <span>View Commitments</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Interactions */}
               <div className="bg-[#242424] border border-[#242424]/50 rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                     <div className="bg-gradient-to-br from-[#933DC9] to-[#53118F] p-3 rounded-xl mr-3 shadow-md"> {/* Updated icon bg */}
                      <History className="w-6 h-6 text-[#FBFAEE]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#FBFAEE]">Recent Interactions</h2>
                      <p className="text-xs text-[#FBFAEE]/60">Your latest AI conversations</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('history')}
                    className="flex items-center space-x-2 text-sm text-[#C488F8] hover:text-[#933DC9] transition" // Lighter purple link
                  >
                    <Eye className="w-4 h-4" />
                    <span>View All</span>
                  </button>
                </div>
                <div className="space-y-3">
                  {data.recent_advice.slice(0, 3).map((item) => {
                    const typeColors: Record<string, string> = {
                      chat: 'from-[#933DC9] to-[#53118F]',
                      checkin: 'from-[#933DC9] to-[#53118F]',
                      analysis: 'from-[#933DC9] to-[#53118F]',
                      evening_review: 'from-[#933DC9] to-[#53118F]',
                    };
                    const typeIcons: Record<string, React.ElementType> = {
                      chat: MessageCircle,
                      checkin: CalendarIcon,
                      analysis: Brain,
                      evening_review: CheckCircle,
                    };
                    const Icon = typeIcons[item.type] || Brain;

                    return (
                      <div
                        key={item.id}
                        className="bg-[#000000]/40 border border-[#242424]/40 rounded-xl p-4 hover:bg-[#242424]/30 transition-all cursor-pointer group"
                        onClick={() => setActiveTab('history')}
                      >
                        <div className="flex items-start space-x-3">
                           <div className={`bg-gradient-to-r ${typeColors[item.type] || 'from-[#933DC9] to-[#53118F]'} text-[#FBFAEE] p-2 rounded-lg flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                               <span className="font-semibold text-[#FBFAEE] text-sm">{item.agent}</span>
                               <span className="text-xs text-[#FBFAEE]/60">{item.date}</span>
                            </div>
                             <MarkdownRenderer
                                content={item.advice.substring(0, 150) + (item.advice.length > 150 ? '...' : '')}
                                className="text-[#FBFAEE]/80 text-sm line-clamp-2" // Ensure MarkdownRenderer uses this color
                              />
                            <div className="mt-2">
                               <span className="text-xs text-[#FBFAEE]/50 capitalize">{item.type.replace(/_/g, ' ')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {data.recent_advice.length === 0 && (
                      <p className="text-sm text-[#FBFAEE]/60 text-center py-4">No recent interactions found.</p>
                  )}
                </div>
              </div>

              {/* Patterns Detected */}
              {data.github.patterns.length > 0 && (
                <div className="bg-[#242424] border border-[#242424]/50 rounded-2xl shadow-xl p-6">
                  <div className="flex items-center mb-6">
                     <div className="bg-gradient-to-br from-[#933DC9] to-[#53118F] p-3 rounded-xl mr-3 shadow-md">
                      <Brain className="w-6 h-6 text-[#FBFAEE]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#FBFAEE]">Patterns Detected</h2>
                      <p className="text-xs text-[#FBFAEE]/60">AI-identified behavior patterns</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {data.github.patterns.map((pattern, idx) => {
                      const severityStyles: Record<string, string> = {
                        high: 'bg-gradient-to-br from-red-900/30 to-orange-900/30 border-red-500/40 text-red-300',
                        medium: 'bg-gradient-to-br from-[#933DC9]/20 to-[#53118F]/20 border-[#933DC9]/40 text-[#C488F8]',
                        positive: 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/40 text-green-300',
                      };
                      const severityIcons: Record<string, React.ElementType> = {
                        high: AlertCircle,
                        medium: TrendingUp,
                        positive: CheckCircle,
                      };
                      const Icon = severityIcons[pattern.severity] || AlertCircle;
                      const styleClasses = severityStyles[pattern.severity] || severityStyles.medium;
                      const iconColor = pattern.severity === 'high' ? 'text-red-400' : pattern.severity === 'positive' ? 'text-green-400' : 'text-[#C488F8]';


                      return (
                        <div key={idx} className={`${styleClasses.split(' ')[0]} ${styleClasses.split(' ')[1]} border ${styleClasses.split(' ')[2]} rounded-xl p-4`}>
                          <div className="flex items-start space-x-3">
                            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
                            <div className="flex-1">
                               <div className={`font-semibold text-sm capitalize ${styleClasses.split(' ')[3]} mb-1`}>
                                {pattern.type.replace(/_/g, ' ')}
                              </div>
                               <p className="text-sm text-[#FBFAEE]/80">{pattern.message}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* AI Agent Insights */}
              <AgentInsights advice={data.recent_advice} />
            </div>
          </div>
        )}

        {/* --- Other Tab Content Placeholders --- */}
        {activeTab === 'chat' && (
          <div className="max-w-5xl mx-auto">
            <Chat githubUsername={githubUsername} />
          </div>
        )}

        {activeTab === 'commitments' && (
           <div className="max-w-6xl mx-auto space-y-6">
            <CommitmentTracker
              githubUsername={githubUsername}
              onReviewComplete={() => setRefreshKey(prev => prev + 1)}
            />
            <CommitmentCalendar githubUsername={githubUsername} />
          </div>
        )}

        {activeTab === 'goals' && (
            <div className="max-w-6xl mx-auto">
              <Goals githubUsername={githubUsername} />
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

      {/* --- Check-in Modal Trigger --- */}
      {showCheckin && (
        <CheckInModal
          githubUsername={githubUsername}
          onClose={() => setShowCheckin(false)}
          onComplete={handleCheckinComplete}
        />
      )}
    </div>
  );
}