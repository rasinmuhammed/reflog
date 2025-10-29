'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, BookOpen, TrendingUp, AlertCircle, CheckCircle, Lightbulb, Calendar, X, Loader2, Clock, Filter, Brain } from 'lucide-react'
import MarkdownRenderer from './MarkdownRenderer'

const API_URL = 'http://localhost:8000'

interface LifeDecision {
  id: number
  title: string
  description: string
  decision_type: string
  impact_areas: string[]
  timestamp: string
  time_horizon?: string
  ai_analysis?: string
  lessons_learned?: string[]
}

interface LifeDecisionsProps {
  githubUsername: string
}

export default function LifeDecisions({ githubUsername }: LifeDecisionsProps) {
  const [decisions, setDecisions] = useState<LifeDecision[]>([])
  const [filteredDecisions, setFilteredDecisions] = useState<LifeDecision[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedDecision, setSelectedDecision] = useState<LifeDecision | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterHorizon, setFilterHorizon] = useState<string>('all')
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [decisionType, setDecisionType] = useState('major_decision')
  const [timeHorizon, setTimeHorizon] = useState('medium_term')
  const [impactAreas, setImpactAreas] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [reanalyzing, setReanalyzing] = useState(false)
  const [reanalyzeError, setReanalyzeError] = useState('')

  useEffect(() => {
    loadDecisions()
  }, [githubUsername])

  useEffect(() => {
    applyFilters()
  }, [decisions, filterType, filterHorizon])

  const loadDecisions = async () => {
    try {
      const response = await axios.get(`${API_URL}/life-decisions/${githubUsername}`)
      setDecisions(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to load decisions:', error)
      setLoading(false)
    }
  }

  const handleReanalyze = async (decisionId: number) => {
    setReanalyzing(true)
    setReanalyzeError('')
    
    try {
        const response = await axios.post(
        `${API_URL}/life-decisions/${githubUsername}/${decisionId}/reanalyze`
        )
        
        // Update the selected decision with new analysis
        if (selectedDecision && selectedDecision.id === decisionId) {
        setSelectedDecision({
            ...selectedDecision,
            ai_analysis: response.data.ai_analysis,
            lessons_learned: response.data.lessons_learned
        })
        }
        
        // Reload all decisions to update the list
        await loadDecisions()
        
        setReanalyzing(false)
        
        // Show success message
        alert('✅ Analysis complete! The decision has been re-analyzed.')
    } catch (error) {
        console.error('Failed to reanalyze:', error)
        setReanalyzeError('Failed to reanalyze decision.')
        // Optionally, show an error message to the user
        alert('❌ Failed to re-analyze the decision.')
    } finally {
        setReanalyzing(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...decisions]
    
    if (filterType !== 'all') {
      filtered = filtered.filter(d => d.decision_type === filterType)
    }
    
    if (filterHorizon !== 'all') {
      filtered = filtered.filter(d => d.time_horizon === filterHorizon)
    }
    
    setFilteredDecisions(filtered)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await axios.post(`${API_URL}/life-decisions/${githubUsername}`, {
        title,
        description,
        decision_type: decisionType,
        impact_areas: impactAreas,
        time_horizon: timeHorizon
      })

      setDecisions(prev => [response.data, ...prev])
      setShowModal(false)
      resetForm()
    } catch (error) {
      console.error('Failed to create decision:', error)
      alert('Failed to save decision')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setDecisionType('major_decision')
    setTimeHorizon('medium_term')
    setImpactAreas([])
  }

  const toggleImpactArea = (area: string) => {
    setImpactAreas(prev =>
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    )
  }

  const decisionTypeColors: Record<string, string> = {
    major_decision: 'from-blue-500 to-cyan-500',
    mistake: 'from-red-500 to-orange-500',
    win: 'from-green-500 to-emerald-500',
    pattern: 'from-purple-500 to-pink-500'
  }

  const decisionTypeIcons: Record<string, JSX.Element> = {
    major_decision: <TrendingUp className="w-5 h-5" />,
    mistake: <AlertCircle className="w-5 h-5" />,
    win: <CheckCircle className="w-5 h-5" />,
    pattern: <Lightbulb className="w-5 h-5" />
  }

  const timeHorizonColors: Record<string, string> = {
    short_term: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    medium_term: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    long_term: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  }

  const timeHorizonLabels: Record<string, string> = {
    short_term: '0-6 months',
    medium_term: '6-24 months',
    long_term: '2+ years'
  }

  const impactAreaOptions = [
    'Career', 'Finance', 'Relationships', 'Health', 
    'Learning', 'Personal Growth', 'Business', 'Lifestyle'
  ]

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl shadow-lg mr-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">Life Decisions Log</h2>
              <p className="text-gray-400">Track major decisions and learn from them over time</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center whitespace-nowrap"
          >
            <Plus className="w-5 h-5 mr-2" />
            Log Decision
          </button>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Filters:</span>
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="major_decision">Major Decisions</option>
            <option value="mistake">Mistakes</option>
            <option value="win">Wins</option>
            <option value="pattern">Patterns</option>
          </select>

          <select
            value={filterHorizon}
            onChange={(e) => setFilterHorizon(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Time Horizons</option>
            <option value="short_term">Short-term (0-6mo)</option>
            <option value="medium_term">Medium-term (6-24mo)</option>
            <option value="long_term">Long-term (2+ years)</option>
          </select>

          <div className="ml-auto text-sm text-gray-400">
            {filteredDecisions.length} of {decisions.length} decisions
          </div>
        </div>
      </div>

      {/* Decisions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 text-center py-12 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            Loading decisions...
          </div>
        ) : filteredDecisions.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-xl">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              {decisions.length === 0 ? 'No decisions logged yet' : 'No decisions match filters'}
            </h3>
            <p className="text-gray-500 mb-6">
              {decisions.length === 0 
                ? 'Start tracking your major life decisions to get AI analysis and extract lessons'
                : 'Try adjusting your filters to see more decisions'
              }
            </p>
            {decisions.length === 0 && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
              >
                Log Your First Decision
              </button>
            )}
          </div>
        ) : (
          filteredDecisions.map(decision => (
            <div
              key={decision.id}
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-xl p-6 hover:shadow-2xl hover:border-gray-600 transition-all cursor-pointer group"
              onClick={() => setSelectedDecision(decision)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`bg-gradient-to-r ${decisionTypeColors[decision.decision_type]} text-white p-3 rounded-xl flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                    {decisionTypeIcons[decision.decision_type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{decision.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(decision.timestamp).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                      <span className="text-gray-600">•</span>
                      <span className="capitalize">{decision.decision_type.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {decision.time_horizon && (
                <div className="mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border ${timeHorizonColors[decision.time_horizon]}`}>
                    <Clock className="w-3 h-3 mr-1" />
                    {timeHorizonLabels[decision.time_horizon]}
                  </span>
                </div>
              )}

              <p className="text-gray-300 mb-4 line-clamp-2">{decision.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {decision.impact_areas.slice(0, 4).map((area, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-lg text-xs font-medium"
                  >
                    {area}
                  </span>
                ))}
                {decision.impact_areas.length > 4 && (
                  <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg text-xs font-medium">
                    +{decision.impact_areas.length - 4} more
                  </span>
                )}
              </div>

              {decision.lessons_learned && decision.lessons_learned.length > 0 && (
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3">
                  <div className="flex items-center text-yellow-400 text-sm font-semibold mb-2">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    {decision.lessons_learned.length} Key Lessons
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {decision.lessons_learned[0]}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Decision Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-900/95 backdrop-blur-lg z-10 rounded-t-3xl">
              <h2 className="text-2xl font-bold text-white">Log Life Decision</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-300 transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Decision Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Accepted senior developer role at StartupXYZ"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the decision, why you made it, and what you hope to achieve..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Decision Type
                  </label>
                  <select
                    value={decisionType}
                    onChange={(e) => setDecisionType(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="major_decision">Major Decision</option>
                    <option value="mistake">Mistake / Learning</option>
                    <option value="win">Win / Success</option>
                    <option value="pattern">Pattern / Insight</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Time Horizon
                  </label>
                  <select
                    value={timeHorizon}
                    onChange={(e) => setTimeHorizon(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="short_term">Short-term (0-6 months)</option>
                    <option value="medium_term">Medium-term (6-24 months)</option>
                    <option value="long_term">Long-term (2+ years)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    How long until you expect to see results?
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Impact Areas <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {impactAreaOptions.map(area => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleImpactArea(area)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        impactAreas.includes(area)
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300 border border-gray-700'
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
                {impactAreas.length === 0 && (
                  <p className="text-xs text-gray-500 mt-2">Select at least one impact area</p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-800 text-gray-300 rounded-xl font-semibold hover:bg-gray-700 transition-all border border-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !title || !description || impactAreas.length === 0}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Log Decision'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Decision Detail Modal */}
      {selectedDecision && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-900/95 backdrop-blur-lg z-10 rounded-t-3xl">
              <h2 className="text-2xl font-bold text-white">{selectedDecision.title}</h2>
              <button
                onClick={() => setSelectedDecision(null)}
                className="text-gray-400 hover:text-gray-300 transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className={`bg-gradient-to-r ${decisionTypeColors[selectedDecision.decision_type]} text-white p-4 rounded-2xl shadow-lg`}>
                  {decisionTypeIcons[selectedDecision.decision_type]}
                </div>
                <div>
                  <p className="text-sm text-gray-400">Decision Type</p>
                  <p className="text-white font-semibold capitalize text-lg">{selectedDecision.decision_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Date</p>
                  <p className="text-white font-semibold text-lg">
                    {new Date(selectedDecision.timestamp).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
                {selectedDecision.time_horizon && (
                  <div>
                    <p className="text-sm text-gray-400">Time Horizon</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border ${timeHorizonColors[selectedDecision.time_horizon]}`}>
                      <Clock className="w-4 h-4 mr-1" />
                      {timeHorizonLabels[selectedDecision.time_horizon]}
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Description</h3>
                <p className="text-gray-200 leading-relaxed">
                    <MarkdownRenderer 
                        content={selectedDecision.description} 
                        className="text-gray-200"
                        />
                    </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3">Impact Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDecision.impact_areas.map((area, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-xl text-sm font-medium"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {selectedDecision.ai_analysis && selectedDecision.ai_analysis.length > 0 ? (
                <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2" />
                    AI Analysis
                    </h3>
                    <MarkdownRenderer 
                    content={selectedDecision.ai_analysis} 
                    className="text-gray-200"
                    />
                </div>
                ) : (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    No AI Analysis Available
                    </h3>
                    <p className="text-gray-400 text-sm">
                    This decision was created before AI analysis was implemented, or the analysis failed to save.
                    You can re-analyze it using the button below.
                    </p>
                    <button
                    onClick={() => handleReanalyze(selectedDecision.id)}
                    className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition"
                    >
                    Analyze Now
                    </button>
                </div>
                )}

              {selectedDecision.lessons_learned && selectedDecision.lessons_learned.length > 0 ? (
                <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Key Lessons Learned
                    </h3>
                    <ul className="space-y-3">
                    {selectedDecision.lessons_learned.map((lesson, idx) => (
                        <li key={idx} className="flex items-start bg-gray-800/50 rounded-xl p-4">
                        <span className="text-yellow-400 mr-3 text-xl font-bold flex-shrink-0">{idx + 1}.</span>
                        <MarkdownRenderer 
                            content={lesson} 
                            className="flex-1 text-gray-200"
                        />
                        </li>
                    ))}
                    </ul>
                </div>
                ) : (
                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4">
                    <p className="text-gray-500 text-sm">No lessons extracted yet.</p>
                </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}