import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Target, Calendar, Clock, TrendingUp, CheckCircle, Play, 
  Pause, Zap, Brain, Award, AlertCircle, Plus, ArrowRight,
  Loader2, ChevronRight, ChevronDown, Filter, X, Flame
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function ActionPlans({ githubUsername }) {
  const [plans, setPlans] = useState([])
  const [activePlan, setActivePlan] = useState(null)
  const [todayTasks, setTodayTasks] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [expandedPlan, setExpandedPlan] = useState(null)
  const [skillFocusSummary, setSkillFocusSummary] = useState(null)

  useEffect(() => {
    loadData()
  }, [githubUsername])

  const loadData = async () => {
    setLoading(true)
    try {
      const [plansRes, focusRes] = await Promise.all([
        axios.get(`${API_URL}/action-plans/${githubUsername}`),
        axios.get(`${API_URL}/skill-focus/${githubUsername}/summary?days=7`)
      ])
      
      setPlans(plansRes.data)
      setSkillFocusSummary(focusRes.data)
      
      const active = plansRes.data.find(p => p.status === 'active')
      if (active) {
        setActivePlan(active)
        loadTodayTasks(active.id)
      }
    } catch (error) {
      console.error('Failed to load action plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTodayTasks = async (planId) => {
    try {
      const response = await axios.get(`${API_URL}/action-plans/${githubUsername}/${planId}/today`)
      setTodayTasks(response.data)
    } catch (error) {
      console.error('Failed to load today tasks:', error)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-16 text-white">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-500" />
        <p>Loading your action plans...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-4 rounded-2xl shadow-lg mr-4">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">30-Day Action Plans</h2>
              <p className="text-gray-400">Structured learning paths to mastery</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:brightness-110 transition flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Plan
          </button>
        </div>

        {/* Stats Row */}
        {skillFocusSummary && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
              <div className="text-3xl font-bold text-purple-400 mb-1">
                {Math.round(skillFocusSummary.total_time / 60)}h
              </div>
              <div className="text-xs text-gray-400">This Week</div>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {Object.keys(skillFocusSummary.skills).length}
              </div>
              <div className="text-xs text-gray-400">Skills Practiced</div>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
              <div className="text-3xl font-bold text-green-400 mb-1">
                {skillFocusSummary.total_sessions}
              </div>
              <div className="text-xs text-gray-400">Sessions</div>
            </div>
          </div>
        )}
      </div>

      {/* Today's Tasks Section */}
      {activePlan && todayTasks && (
        <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-2 border-purple-500/50 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-xl mr-3">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Day {todayTasks.day_number} of 30</h3>
                <p className="text-sm text-gray-400">{todayTasks.focus_area}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-orange-600/20 border border-orange-500/40 px-3 py-1 rounded-full">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-orange-300 font-bold text-sm">Day {todayTasks.day_number}</span>
            </div>
          </div>

          {/* Today's Tasks */}
          <div className="space-y-3 mb-4">
            {todayTasks.tasks.map((task, idx) => (
              <TaskCard key={task.id} task={task} planId={activePlan.id} onComplete={loadData} />
            ))}
          </div>

          {/* Skills to Focus */}
          {todayTasks.skills_to_focus && todayTasks.skills_to_focus.length > 0 && (
            <div className="mt-4 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
              <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                <Brain className="w-4 h-4 mr-2 text-purple-400" />
                Focus Skills Today:
              </h4>
              <div className="flex flex-wrap gap-2">
                {todayTasks.skills_to_focus.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-purple-600/20 text-purple-300 border border-purple-500/40 rounded-full text-sm font-medium">
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Plans List */}
      <div className="space-y-4">
        {plans.length === 0 ? (
          <div className="text-center py-16 bg-gray-800 border border-gray-700 rounded-2xl">
            <Target className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold mb-2">No action plans yet</h3>
            <p className="text-gray-400 mb-6">Create your first 30-day learning plan</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:brightness-110 transition"
            >
              Create Your First Plan
            </button>
          </div>
        ) : (
          plans.map(plan => (
            <PlanCard 
              key={plan.id} 
              plan={plan} 
              expanded={expandedPlan === plan.id}
              onToggle={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
              onRefresh={loadData}
            />
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreatePlanModal
          githubUsername={githubUsername}
          onClose={() => setShowCreateModal(false)}
          onComplete={() => {
            setShowCreateModal(false)
            loadData()
          }}
        />
      )}
    </div>
  )
}

function TaskCard({ task, planId, onComplete }) {
  const [completing, setCompleting] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [timeSpent, setTimeSpent] = useState('')
  const [difficulty, setDifficulty] = useState(3)
  const [notes, setNotes] = useState('')
  const [feedback, setFeedback] = useState(null)

  const handleComplete = async () => {
    setCompleting(true)
    try {
      const response = await axios.post(
        `${API_URL}/action-plans/${planId}/tasks/${task.id}/complete`,
        {
          status: 'completed',
          actual_time_spent: parseInt(timeSpent) || task.estimated_time,
          difficulty_rating: difficulty,
          notes: notes
        }
      )
      setFeedback(response.data.feedback)
      setShowFeedback(true)
      onComplete()
    } catch (error) {
      console.error('Failed to complete task:', error)
      alert('Failed to complete task')
    } finally {
      setCompleting(false)
    }
  }

  if (task.status === 'completed') {
    return (
      <div className="bg-green-900/20 border border-green-500/40 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <div>
              <h4 className="font-semibold text-white">{task.title}</h4>
              <p className="text-xs text-gray-400">
                Completed • {task.actual_time_spent || task.estimated_time} mins
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showFeedback) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
        <div className="flex items-center mb-3">
          <Brain className="w-5 h-5 mr-2 text-purple-400" />
          <h4 className="font-semibold">AI Feedback</h4>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">{feedback}</p>
        <button
          onClick={() => setShowFeedback(false)}
          className="mt-3 text-sm text-purple-400 hover:text-purple-300"
        >
          Close
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 hover:border-purple-500/50 transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-white mb-1">{task.title}</h4>
          <p className="text-sm text-gray-400">{task.description}</p>
          <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {task.estimated_time} mins
            </span>
            <span className={`px-2 py-0.5 rounded ${
              task.difficulty === 'easy' ? 'bg-green-900/40 text-green-300' :
              task.difficulty === 'medium' ? 'bg-yellow-900/40 text-yellow-300' :
              'bg-red-900/40 text-red-300'
            }`}>
              {task.difficulty}
            </span>
          </div>
        </div>
      </div>

      {/* Complete Form */}
      <div className="space-y-3 mt-4 pt-3 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Time Spent (mins)</label>
            <input
              type="number"
              value={timeSpent}
              onChange={(e) => setTimeSpent(e.target.value)}
              placeholder={task.estimated_time.toString()}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Difficulty (1-5)</label>
            <input
              type="number"
              min="1"
              max="5"
              value={difficulty}
              onChange={(e) => setDifficulty(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What did you learn? Any challenges?"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg text-sm resize-none"
            rows={2}
          />
        </div>
        <button
          onClick={handleComplete}
          disabled={completing}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg font-semibold hover:brightness-110 transition disabled:opacity-50 text-sm flex items-center justify-center"
        >
          {completing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Complete
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function PlanCard({ plan, expanded, onToggle, onRefresh }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
      <div className="p-5 cursor-pointer hover:bg-gray-750 transition" onClick={onToggle}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-xl">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">{plan.title}</h3>
              <p className="text-sm text-gray-400 mb-2">{plan.focus_area}</p>
              <div className="flex items-center space-x-3 text-xs text-gray-500">
                <span>Day {plan.current_day}/30</span>
                <span>•</span>
                <span>{plan.completion_percentage.toFixed(0)}% complete</span>
              </div>
              <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${plan.completion_percentage}%` }}
                />
              </div>
            </div>
          </div>
          {expanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-700 pt-4">
          {plan.ai_analysis && (
            <div className="bg-gray-900/50 rounded-xl p-4 mb-4">
              <h4 className="text-sm font-semibold text-purple-400 mb-2">AI Analysis</h4>
              <p className="text-sm text-gray-300 line-clamp-3">{plan.ai_analysis}</p>
            </div>
          )}
          
          {plan.skills_to_focus && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Focus Skills</h4>
              <div className="flex flex-wrap gap-2">
                {plan.skills_to_focus.skills?.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm">
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CreatePlanModal({ githubUsername, onClose, onComplete }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [focusArea, setFocusArea] = useState('')
  const [skills, setSkills] = useState('')
  const [skillLevel, setSkillLevel] = useState('beginner')
  const [hoursPerDay, setHoursPerDay] = useState(2)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await axios.post(`${API_URL}/action-plans/${githubUsername}`, {
        title,
        description,
        plan_type: '30_day',
        focus_area: focusArea,
        skills_to_learn: skills.split(',').map(s => s.trim()),
        current_skill_level: skillLevel,
        available_hours_per_day: hoursPerDay
      })

      onComplete()
    } catch (error) {
      console.error('Failed to create plan:', error)
      alert('Failed to create plan')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold">Create 30-Day Action Plan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Plan Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Backend Development Mastery"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Focus Area <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              placeholder="e.g., Backend Development, System Design"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Skills to Learn <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g., Node.js, PostgreSQL, Docker (comma-separated)"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-lg"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Current Level</label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-lg"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Hours/Day</label>
              <input
                type="number"
                min="0.5"
                max="8"
                step="0.5"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(parseFloat(e.target.value))}
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What do you want to achieve in 30 days?"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-lg resize-none"
              rows={3}
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2.5 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:brightness-110 transition disabled:opacity-50"
            >
              {submitting ? 'Generating...' : 'Generate Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}