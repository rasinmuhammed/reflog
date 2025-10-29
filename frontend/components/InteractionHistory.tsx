'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { History, MessageCircle, Calendar, Brain, Filter, X, ChevronDown, ChevronUp } from 'lucide-react'
import MarkdownRenderer from './MarkdownRenderer'

const API_URL = 'http://localhost:8000'

interface Interaction {
  id: number
  agent_name: string
  advice: string
  evidence: any
  created_at: string
  interaction_type: string
}

interface InteractionHistoryProps {
  githubUsername: string
}

export default function InteractionHistory({ githubUsername }: InteractionHistoryProps) {
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [filteredInteractions, setFilteredInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => {
    loadInteractions()
  }, [githubUsername])

  useEffect(() => {
    applyFilters()
  }, [interactions, filterType])

  const loadInteractions = async () => {
    try {
      const response = await axios.get(`${API_URL}/advice/${githubUsername}?limit=50`)
      setInteractions(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to load interactions:', error)
      setLoading(false)
    }
  }

  const applyFilters = () => {
    if (filterType === 'all') {
      setFilteredInteractions(interactions)
    } else {
      setFilteredInteractions(interactions.filter(i => i.interaction_type === filterType))
    }
  }

  const typeColors: Record<string, string> = {
    chat: 'from-purple-500 to-pink-500',
    checkin: 'from-blue-500 to-cyan-500',
    analysis: 'from-green-500 to-emerald-500'
  }

  const typeIcons: Record<string, any> = {
    chat: MessageCircle,
    checkin: Calendar,
    analysis: Brain
  }

  const getDebateFromEvidence = (evidence: any) => {
    if (evidence?.deliberation) {
      return evidence.deliberation
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-4 rounded-2xl shadow-lg mr-4">
              <History className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">Interaction History</h2>
              <p className="text-gray-400">Complete record of your AI conversations</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Filter by type:</span>
          </div>
          
          {['all', 'chat', 'checkin', 'analysis'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filterType === type
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}

          <div className="ml-auto text-sm text-gray-400">
            {filteredInteractions.length} of {interactions.length} interactions
          </div>
        </div>
      </div>

      {/* Interactions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading interaction history...</p>
          </div>
        ) : filteredInteractions.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl">
            <History className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              {interactions.length === 0 ? 'No interactions yet' : 'No interactions match filters'}
            </h3>
            <p className="text-gray-500">
              {interactions.length === 0 
                ? 'Start chatting with Sage or complete a check-in to see your history here'
                : 'Try adjusting your filters to see more interactions'
              }
            </p>
          </div>
        ) : (
          filteredInteractions.map((interaction) => {
            const Icon = typeIcons[interaction.interaction_type] || Brain
            const isExpanded = expandedId === interaction.id
            const debate = getDebateFromEvidence(interaction.evidence)

            return (
              <div
                key={interaction.id}
                className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`bg-gradient-to-r ${typeColors[interaction.interaction_type]} text-white p-3 rounded-xl flex-shrink-0 shadow-lg`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-white">{interaction.agent_name}</h3>
                          <span className="text-sm text-gray-500">
                            {new Date(interaction.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mb-3">
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                            interaction.interaction_type === 'chat' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                            interaction.interaction_type === 'checkin' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                            'bg-green-500/20 text-green-300 border border-green-500/30'
                          }`}>
                            {interaction.interaction_type.toUpperCase()}
                          </span>
                        </div>
                        <p className={`text-gray-300 leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
                          <MarkdownRenderer 
                            content={interaction.advice} 
                            className="text-gray-300"
                            />
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Expand/Collapse Button */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : interaction.id)}
                      className="flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300 transition"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          <span>Show Less</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          <span>Show More</span>
                        </>
                      )}
                    </button>
                    {debate && (
                      <button
                        onClick={() => setSelectedInteraction(interaction)}
                        className="flex items-center space-x-2 text-sm text-purple-400 hover:text-purple-300 transition"
                      >
                        <Brain className="w-4 h-4" />
                        <span>View Agent Debate</span>
                      </button>
                    )}
                  </div>

                  {/* Expanded Evidence */}
                  {isExpanded && interaction.evidence && (
                    <div className="mt-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                      <h4 className="text-sm font-semibold text-gray-400 mb-3">Context & Evidence</h4>
                      {interaction.evidence.user_message && (
                        <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <p className="text-xs text-gray-400 mb-1">Your Question:</p>
                          <p className="text-sm text-gray-200">{interaction.evidence.user_message}</p>
                        </div>
                      )}
                      {interaction.evidence.checkin && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Energy Level:</span>
                            <span className="text-white font-semibold">{interaction.evidence.checkin.energy_level}/10</span>
                          </div>
                          <div className="flex items-start justify-between text-sm">
                            <span className="text-gray-400">Avoiding:</span>
                            <span className="text-white text-right max-w-xs">{interaction.evidence.checkin.avoiding_what}</span>
                          </div>
                          <div className="flex items-start justify-between text-sm">
                            <span className="text-gray-400">Commitment:</span>
                            <span className="text-white text-right max-w-xs">{interaction.evidence.checkin.commitment}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Agent Debate Modal */}
      {selectedInteraction && getDebateFromEvidence(selectedInteraction.evidence) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-900/95 backdrop-blur-lg z-10 rounded-t-3xl">
              <div>
                <h2 className="text-2xl font-bold text-white">Agent Debate</h2>
                <p className="text-sm text-gray-400 mt-1">How the AI agents deliberated on this</p>
              </div>
              <button
                onClick={() => setSelectedInteraction(null)}
                className="text-gray-400 hover:text-gray-300 transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {getDebateFromEvidence(selectedInteraction.evidence)?.map((agent: any, idx: number) => {
                const agentColors: Record<string, string> = {
                  'Analyst': 'from-blue-500 to-cyan-500',
                  'Psychologist': 'from-purple-500 to-pink-500',
                  'Contrarian': 'from-red-500 to-orange-500',
                  'Strategist': 'from-green-500 to-emerald-500'
                }

                return (
                  <div
                    key={idx}
                    className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5 hover:bg-gray-800 transition-all"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`bg-gradient-to-r ${agentColors[agent.agent] || 'from-gray-500 to-gray-600'} text-white p-3 rounded-xl flex-shrink-0 shadow-lg`}>
                        <Brain className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-white">{agent.agent}</h3>
                          <span className="text-xs text-gray-500 uppercase">{agent.perspective}</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed">{agent.perspective}</p>
                      </div>
                    </div>
                  </div>
                )
              })}

              <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl">
                <h4 className="text-sm font-semibold text-blue-400 mb-2">Final Response</h4>
                <MarkdownRenderer content={selectedInteraction.advice} />
                
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}