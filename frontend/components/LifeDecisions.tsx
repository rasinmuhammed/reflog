'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, BookOpen, TrendingUp, AlertCircle, CheckCircle, Lightbulb, Calendar, X, Loader2 } from 'lucide-react'

const API_URL = 'http://localhost:8000'

interface LifeDecision {
  id: number
  title: string
  description: string
  decision_type: string
  impact_areas: string[]
  timestamp: string
  ai_analysis?: string
  lessons_learned?: string[]
}

interface LifeDecisionsProps {
  githubUsername: string
}

export default function LifeDecisions({ githubUsername }: LifeDecisionsProps) {
  const [decisions, setDecisions] = useState<LifeDecision[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedDecision, setSelectedDecision] = useState<LifeDecision | null>(null)
  
  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [decisionType, setDecisionType] = useState('major_decision')
  const [impactAreas, setImpactAreas] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadDecisions()
  }, [githubUsername])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await axios.post(`${API_URL}/life-decisions/${githubUsername}`, {
        title,
        description,
        decision_type: decisionType,
        impact_areas: impactAreas
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

  const impactAreaOptions = [
    'Career', 'Finance', 'Relationships', 'Health', 
    'Learning', 'Personal Growth', 'Business', 'Lifestyle'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <BookOpen className="w-8 h-8 mr-3 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Life Decisions Log</h2>
            <p className="text-gray-400 text-sm">Track major decisions and learn from them</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Log Decision
        </button>
      </div>

      {/* Decisions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            Loading decisions...
          </div>
        ) : decisions.length === 0 ? (
          <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-xl shadow-xl">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No decisions logged yet</h3>
            <p className="text-gray-500 mb-6">
              Start tracking your major life decisions to get AI analysis and extract lessons
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition"
            >
              Log Your First Decision
            </button>
          </div>
        ) : (
          decisions.map(decision => (
            <div
              key={decision.id}
              className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl p-6 hover:shadow-2xl hover:border-gray-700 transition cursor-pointer"
              onClick={() => setSelectedDecision(decision)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`bg-gradient-to-r ${decisionTypeColors[decision.decision_type]} text-white p-3 rounded-lg flex-shrink-0`}>
                    {decisionTypeIcons[decision.decision_type]}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{decision.title}</h3>
                    <div className="flex items-center text-sm text-gray-400 space-x-3">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(decision.timestamp).toLocaleDateString()}
                      </span>
                      <span className="capitalize">{decision.decision_type.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-gray-300 mb-4">{decision.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {decision.impact_areas.map((area, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-sm font-medium"
                  >
                    {area}
                  </span>
                ))}
              </div>

              {decision.lessons_learned && decision.lessons_learned.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-400 mb-2 flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Key Lessons:
                  </h4>
                  <ul className="space-y-1">
                    {decision.lessons_learned.slice(0, 3).map((lesson, idx) => (
                      <li key={idx} className="text-sm text-gray-300">
                        • {lesson}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Decision Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
              <h2 className="text-2xl font-bold text-white">Log Life Decision</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-300 transition"
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
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Decision Type
                </label>
                <select
                  value={decisionType}
                  onChange={(e) => setDecisionType(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="major_decision">Major Decision</option>
                  <option value="mistake">Mistake / Learning</option>
                  <option value="win">Win / Success</option>
                  <option value="pattern">Pattern / Insight</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Impact Areas <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {impactAreaOptions.map(area => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleImpactArea(area)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        impactAreas.includes(area)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
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
                  className="flex-1 px-6 py-3 bg-gray-800 text-gray-300 rounded-lg font-semibold hover:bg-gray-700 transition border border-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !title || !description || impactAreas.length === 0}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
              <h2 className="text-2xl font-bold text-white">{selectedDecision.title}</h2>
              <button
                onClick={() => setSelectedDecision(null)}
                className="text-gray-400 hover:text-gray-300 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-4">
                <div className={`bg-gradient-to-r ${decisionTypeColors[selectedDecision.decision_type]} text-white p-4 rounded-lg`}>
                  {decisionTypeIcons[selectedDecision.decision_type]}
                </div>
                <div>
                  <p className="text-sm text-gray-400">Decision Type</p>
                  <p className="text-white font-semibold capitalize">{selectedDecision.decision_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Date</p>
                  <p className="text-white font-semibold">{new Date(selectedDecision.timestamp).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
                <p className="text-gray-300 leading-relaxed">{selectedDecision.description}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Impact Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDecision.impact_areas.map((area, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-sm font-medium"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {selectedDecision.ai_analysis && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-purple-400 mb-3 flex items-center">
                    <Brain className="w-4 h-4 mr-2" />
                    AI Analysis
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedDecision.ai_analysis}
                  </p>
                </div>
              )}

              {selectedDecision.lessons_learned && selectedDecision.lessons_learned.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-yellow-400 mb-3 flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Key Lessons Learned
                  </h3>
                  <ul className="space-y-2">
                    {selectedDecision.lessons_learned.map((lesson, idx) => (
                      <li key={idx} className="text-sm text-gray-300 flex items-start">
                        <span className="text-yellow-400 mr-2">•</span>
                        <span>{lesson}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

