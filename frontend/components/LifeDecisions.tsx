'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, BookOpen, TrendingUp, AlertCircle, CheckCircle, Lightbulb, Calendar, X } from 'lucide-react'

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
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <BookOpen className="w-8 h-8 mr-3 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">Life Decisions Log</h2>
            <p className="text-gray-600 text-sm">Track major decisions and learn from them</p>
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
          <div className="text-center py-12 text-gray-500">Loading decisions...</div>
        ) : decisions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No decisions logged yet</h3>
            <p className="text-gray-500 mb-6">
              Start tracking your major life decisions to get AI analysis and extract lessons
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Log Your First Decision
            </button>
          </div>
        ) : (
          decisions.map(decision => (
            <div
              key={decision.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
              onClick={() => setSelectedDecision(decision)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className={`bg-gradient-to-r ${decisionTypeColors[decision.decision_type]} text-white p-3 rounded-lg`}>
                    {decisionTypeIcons[decision.decision_type]}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{decision.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 space-x-3">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(decision.timestamp).toLocaleDateString()}
                      </span>
                      <span className="capitalize">{decision.decision_type.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{decision.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {decision.impact_areas.map((area, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {area}
                  </span>
                ))}
              </div>

              {decision.lessons_learned && decision.lessons_learned.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Key Lessons:
                  </h4>
                  <ul className="space-y-1">
                    {decision.lessons_learned.slice(0, 3).map((lesson, idx) => (
                      <li key={idx} className="text-sm text-gray-700">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">Log Life Decision</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Decision Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Accepted senior developer role at StartupXYZ"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the decision, why you made it, and what you hope to achieve..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Decision Type
                </label>
                <select
                  value={decisionType}
                  onChange={(e) => setDecisionType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="major_decision">Major Decision</option>
                  <option value="mistake">Mistake / Learning</option>
                  <option value="win">Win / Success</option>
                  <option value="pattern">Pattern / Insight</option>
                </select>
              </div>