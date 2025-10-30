'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Target,
  Plus,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Loader2,
  Edit,
  Trash2,
  Play,
  Pause,
  Award,
  BarChart3,
  Brain,
  Zap,
  Flag,
  X, // Added for modal close
  Check // Added for checkbox
} from 'lucide-react'
import MarkdownRenderer from './MarkdownRenderer'
import CreateGoalModal from './CreateGoalModal'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Goal {
  id: number
  title: string
  description: string
  goal_type: string
  priority: string
  status: string
  progress: number // Changed to number for consistency
  target_date: string | null
  created_at: string
  ai_analysis?: string
  ai_insights?: any
  obstacles_identified?: any
  subgoals: SubGoal[]
  milestones: Milestone[]
}

interface SubGoal {
  id: number
  title: string
  description?: string
  order: number
  status: string
  progress: number // Changed to number
  target_date?: string
  tasks: Task[]
}

interface Task {
  id: number
  title: string
  description?: string
  status: string
  priority: string
  estimated_hours?: number
  due_date?: string
}

interface Milestone {
  id: number
  title: string
  description?: string
  target_date: string
  achieved: boolean
  achieved_at?: string
  celebration_note?: string
}

interface GoalsProps {
  githubUsername: string
}

export default function Goals({ githubUsername }: GoalsProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [dashboard, setDashboard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [expandedGoals, setExpandedGoals] = useState<Set<number>>(new Set())
  const [filterStatus, setFilterStatus] = useState('active')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    loadData()
  }, [githubUsername, filterStatus, filterType])

  const loadData = async () => {
    setLoading(true)
    try {
      const [goalsRes, dashboardRes] = await Promise.all([
        axios.get(`${API_URL}/goals/${githubUsername}`, {
          params: {
            status: filterStatus !== 'all' ? filterStatus : undefined,
            goal_type: filterType !== 'all' ? filterType : undefined
          }
        }),
        axios.get(`${API_URL}/goals/${githubUsername}/dashboard`)
      ])

      setGoals(goalsRes.data)
      setDashboard(dashboardRes.data)
    } catch (error) {
      console.error('Failed to load goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (goalId: number) => {
    const newExpanded = new Set(expandedGoals)
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId)
    } else {
      newExpanded.add(goalId)
    }
    setExpandedGoals(newExpanded)
  }

  const goalTypeColors: Record<string, string> = {
    career: 'from-[#933DC9] to-[#53118F]',
    personal: 'from-[#53118F] to-[#933DC9]',
    financial: 'from-green-600 to-emerald-500',
    health: 'from-red-600 to-orange-600',
    learning: 'from-blue-600 to-purple-600',
    project: 'from-yellow-600 to-orange-600'
  }

  const priorityStyles: Record<string, string> = {
    critical: 'bg-red-900/40 text-red-300 border-red-500/40',
    high: 'bg-orange-900/40 text-orange-300 border-orange-500/40',
    medium: 'bg-[#933DC9]/20 text-[#C488F8] border-[#933DC9]/40',
    low: 'bg-gray-700/40 text-gray-400 border-gray-600/40'
  }

  const statusIcons: Record<string, JSX.Element> = {
    active: <Play className="w-4 h-4" />,
    completed: <CheckCircle className="w-4 h-4" />,
    paused: <Pause className="w-4 h-4" />,
    abandoned: <Trash2 className="w-4 h-4" />
  }

  if (loading && !dashboard) {
    return (
      <div className="text-center py-16 text-[#FBFAEE]/70">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-[#933DC9]" />
        <p>Loading your goals...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-[#FBFAEE]">
      {/* Dashboard Header */}
      <div className="bg-[#242424] border border-[#242424]/50 rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-[#933DC9] to-[#53118F] p-4 rounded-2xl shadow-lg mr-4">
              <Target className="w-8 h-8 text-[#FBFAEE]" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-[#FBFAEE]">Life Goals</h2>
              <p className="text-[#FBFAEE]/70">AI-guided goal achievement system</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-[#933DC9] to-[#53118F] text-[#FBFAEE] px-6 py-3 rounded-xl font-semibold hover:brightness-110 transition flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Goal
          </button>
        </div>

        {/* Stats Grid */}
        {dashboard && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#000000]/40 rounded-xl p-4 border border-[#242424]/40">
              <div className="text-3xl font-bold text-[#C488F8] mb-1">
                {dashboard.active_goals_count}
              </div>
              <div className="text-xs text-[#FBFAEE]/70">Active Goals</div>
            </div>
            <div className="bg-[#000000]/40 rounded-xl p-4 border border-[#242424]/40">
              <div className="text-3xl font-bold text-green-400 mb-1">
                {dashboard.completed_goals_count}
              </div>
              <div className="text-xs text-[#FBFAEE]/70">Completed</div>
            </div>
            <div className="bg-[#000000]/40 rounded-xl p-4 border border-[#242424]/40">
              <div className="text-3xl font-bold text-[#FBFAEE] mb-1">
                {dashboard.average_progress}%
              </div>
              <div className="text-xs text-[#FBFAEE]/70">Avg Progress</div>
            </div>
            <div className="bg-[#000000]/40 rounded-xl p-4 border border-[#242424]/40">
              <div className="text-3xl font-bold text-yellow-400 mb-1">
                {dashboard.recent_milestones?.length || 0}
              </div>
              <div className="text-xs text-[#FBFAEE]/70">Recent Wins</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mt-6 flex flex-wrap gap-3 border-t border-[#242424]/50 pt-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-[#FBFAEE]/70 font-medium">Status:</span>
            {['all', 'active', 'completed', 'paused'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                  filterStatus === status
                    ? 'bg-[#933DC9]/20 text-[#C488F8] border-[#933DC9]/40'
                    : 'bg-[#000000]/40 text-[#FBFAEE]/70 hover:bg-[#000000]/60 border-[#242424]/50'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-[#FBFAEE]/70 font-medium">Type:</span>
            {['all', 'career', 'personal', 'financial', 'health', 'learning', 'project'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                  filterType === type
                    ? 'bg-[#933DC9]/20 text-[#C488F8] border-[#933DC9]/40'
                    : 'bg-[#000000]/40 text-[#FBFAEE]/70 hover:bg-[#000000]/60 border-[#242424]/50'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-16 bg-[#242424] border border-[#242424]/50 rounded-2xl">
            <Target className="w-16 h-16 mx-auto mb-4 text-[#FBFAEE]/30" />
            <h3 className="text-xl font-semibold text-[#FBFAEE]/90 mb-2">
              No goals yet
            </h3>
            <p className="text-[#FBFAEE]/60 mb-6">
              Start setting meaningful goals and let AI guide you to achievement
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-[#933DC9] to-[#53118F] text-[#FBFAEE] px-6 py-3 rounded-xl font-semibold hover:brightness-110 transition"
            >
              Create Your First Goal
            </button>
          </div>
        ) : (
          goals.map(goal => {
            const isExpanded = expandedGoals.has(goal.id)
            const gradient = goalTypeColors[goal.goal_type] || goalTypeColors.career

            return (
              <div
                key={goal.id}
                className="bg-[#242424] border border-[#242424]/50 rounded-2xl shadow-lg overflow-hidden"
              >
                {/* Goal Header */}
                <div
                  className="p-5 cursor-pointer hover:bg-[#000000]/20 transition"
                  onClick={() => toggleExpand(goal.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`bg-gradient-to-r ${gradient} text-[#FBFAEE] p-3 rounded-xl shadow-md`}>
                        <Target className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-[#FBFAEE] mb-1">{goal.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className={`px-2 py-0.5 rounded-full border font-medium ${priorityStyles[goal.priority]}`}>
                            {goal.priority.toUpperCase()}
                          </span>
                          <span className="text-[#FBFAEE]/60 capitalize">{goal.goal_type}</span>
                          {goal.target_date && (
                            <>
                              <span>•</span>
                              <span className="flex items-center text-[#FBFAEE]/60">
                                <Clock className="w-3 h-3 mr-1" />
                                {new Date(goal.target_date).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-[#FBFAEE]/70">Progress</span>
                            <span className="text-xs font-bold text-[#C488F8]">{goal.progress.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-[#000000]/50 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${gradient} transition-all duration-500`}
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {statusIcons[goal.status]}
                      {isExpanded ? <ChevronDown className="w-5 h-5 text-[#FBFAEE]/60" /> : <ChevronRight className="w-5 h-5 text-[#FBFAEE]/60" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-[#242424]/50 space-y-4 pt-4">
                    {/* Description */}
                    <div>
                      <p className="text-[#FBFAEE]/80 text-sm">{goal.description}</p>
                    </div>

                    {/* AI Analysis */}
                    {goal.ai_analysis && (
                      <div className="bg-gradient-to-br from-[#933DC9]/15 to-[#53118F]/15 border border-[#933DC9]/30 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-[#C488F8] mb-2 flex items-center">
                          <Brain className="w-4 h-4 mr-2" />
                          AI Analysis
                        </h4>
                        <MarkdownRenderer content={goal.ai_analysis} className="text-[#FBFAEE]/90 text-sm" />
                      </div>
                    )}

                    {/* Subgoals */}
                    {goal.subgoals && goal.subgoals.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-[#FBFAEE] mb-3">Subgoals</h4>
                        <div className="space-y-2">
                          {goal.subgoals.map((subgoal, idx) => (
                            <div key={subgoal.id} className="bg-[#000000]/30 rounded-lg p-3 border border-[#242424]/40">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1">
                                  <span className="text-[#FBFAEE]/60 font-bold text-sm">{idx + 1}.</span>
                                  <div className="flex-1">
                                    <p className="text-[#FBFAEE] text-sm font-medium">{subgoal.title}</p>
                                    {subgoal.description && (
                                      <p className="text-[#FBFAEE]/60 text-xs mt-1">{subgoal.description}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    subgoal.status === 'completed' ? 'bg-green-900/40 text-green-300' :
                                    subgoal.status === 'in_progress' ? 'bg-blue-900/40 text-blue-300' :
                                    'bg-gray-700/40 text-gray-400'
                                  }`}>
                                    {subgoal.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Milestones */}
                    {goal.milestones && goal.milestones.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-[#FBFAEE] mb-3 flex items-center">
                          <Award className="w-4 h-4 mr-2" />
                          Milestones
                        </h4>
                        <div className="space-y-2">
                          {goal.milestones.map(milestone => (
                            <div key={milestone.id} className={`rounded-lg p-3 border ${
                              milestone.achieved
                                ? 'bg-green-900/30 border-green-500/40'
                                : 'bg-[#000000]/30 border-[#242424]/40'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {milestone.achieved ? (
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                  ) : (
                                    <Flag className="w-5 h-5 text-[#FBFAEE]/60" />
                                  )}
                                  <div>
                                    <p className="text-[#FBFAEE] text-sm font-medium">{milestone.title}</p>
                                    <p className="text-xs text-[#FBFAEE]/60">
                                      Target: {new Date(milestone.target_date).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                {milestone.achieved && milestone.achieved_at && (
                                  <span className="text-xs text-green-300">
                                    Achieved {new Date(milestone.achieved_at).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3 pt-2">
                      <button
                        onClick={() => setSelectedGoal(goal)}
                        className="flex-1 bg-gradient-to-r from-[#933DC9] to-[#53118F] text-[#FBFAEE] px-4 py-2 rounded-lg font-semibold hover:brightness-110 transition text-sm flex items-center justify-center"
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Log Progress
                      </button>
                      <button className="px-4 py-2 bg-[#000000]/40 text-[#FBFAEE]/80 rounded-lg hover:bg-[#000000]/60 transition border border-[#242424]/50 text-sm">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Create Goal Modal */}
      {showCreateModal && (
        <CreateGoalModal
          githubUsername={githubUsername}
          onClose={() => setShowCreateModal(false)}
          onComplete={() => {
            setShowCreateModal(false)
            loadData()
          }}
        />
      )}

      {/* Progress Modal */}
      {selectedGoal && (
        <ProgressModal
          goal={selectedGoal}
          githubUsername={githubUsername}
          onClose={() => setSelectedGoal(null)}
          onComplete={() => {
            setSelectedGoal(null)
            loadData()
          }}
        />
      )}
    </div>
  )
}

// --------------------------------
// --- NEW Progress Modal Component ---
// --------------------------------

interface ProgressModalProps {
  goal: Goal
  githubUsername: string
  onClose: () => void
  onComplete: () => void
}

function ProgressModal({
  goal,
  githubUsername,
  onClose,
  onComplete
}: ProgressModalProps) {
  const [currentProgress, setCurrentProgress] = useState(goal.progress)
  const [taskStatuses, setTaskStatuses] = useState<Record<number, string>>(() => {
    const initialStatuses: Record<number, string> = {}
    goal.subgoals.forEach(sg => {
      sg.tasks.forEach(task => {
        initialStatuses[task.id] = task.status
      })
    })
    return initialStatuses
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleTask = (taskId: number) => {
    setTaskStatuses(prev => {
      const newStatus =
        prev[taskId] === 'completed' ? 'pending' : 'completed'
      return { ...prev, [taskId]: newStatus }
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)
    try {
        // Update each task that changed status
        const updatePromises = Object.entries(taskStatuses)
        .filter(([taskId, status]) => {
            let originalStatus = 'pending' // Default
            goal.subgoals.forEach(sg => {
            const task = sg.tasks.find(t => t.id === Number(taskId))
            if (task) originalStatus = task.status
            })
            return originalStatus !== status
        })
        .map(([taskId, status]) =>
            axios.patch(
            `${API_URL}/goals/${githubUsername}/${goal.id}/tasks/${taskId}`,
            null,
            { params: { status } }
            )
        )

        // Wait for all task updates to complete
        await Promise.all(updatePromises)

        // Then update the overall goal progress
        await axios.post(
        `${API_URL}/goals/${githubUsername}/${goal.id}/progress`,
        {
            progress: currentProgress,
            notes: `Progress updated to ${currentProgress}%`,
            mood: 'focused'
        }
        )

        onComplete() // This will close the modal and refresh the data
    } catch (err) {
        console.error('Failed to log progress:', err)
        setError('Failed to save progress. Please try again.')
    } finally {
        setIsLoading(false)
    }
    }

  return (
    <div
      className="fixed inset-0 bg-[#000000]/90 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#242424] border border-[#242424]/50 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in"
        onClick={e => e.stopPropagation()} // Prevent click-outside-to-close on the modal itself
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#242424]/50 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-[#C488F8]" />
            <div>
              <h3 className="text-lg font-bold text-[#FBFAEE]">Log Progress</h3>
              <p className="text-sm text-[#FBFAEE]/70 truncate max-w-md">
                {goal.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#FBFAEE]/60 hover:text-[#FBFAEE] transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Manual Progress Slider */}
          <div>
            <label
              htmlFor="progress"
              className="block text-sm font-medium text-[#FBFAEE]/90 mb-2"
            >
              Overall Goal Progress ({currentProgress.toFixed(0)}%)
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                id="progress"
                min="0"
                max="100"
                value={currentProgress}
                onChange={e => setCurrentProgress(Number(e.target.value))}
                className="w-full h-2 bg-[#000000]/50 rounded-lg appearance-none cursor-pointer range-thumb"
              />
              <span className="text-lg font-bold text-[#C488F8] w-12 text-right">
                {currentProgress.toFixed(0)}%
              </span>
            </div>
            {/* Custom styles for the slider thumb */}
            <style jsx>{`
              .range-thumb::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #c488f8;
                cursor: pointer;
                border: 3px solid #53118f;
                margin-top: -7px; /* Center thumb on track */
              }
              .range-thumb::-moz-range-thumb {
                width: 14px; /* FF requires border-box */
                height: 14px;
                border-radius: 50%;
                background: #c488f8;
                cursor: pointer;
                border: 3px solid #53118f;
              }
            `}</style>
            <p className="text-xs text-[#FBFAEE]/60 mt-2">
              Adjust this slider if your progress isn't automatically calculated
              by tasks.
            </p>
          </div>

          {/* Task List */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[#FBFAEE]">
              Subgoals & Tasks
            </h4>
            {goal.subgoals.length > 0 ? (
              <div className="space-y-3 max-h-[calc(90vh-400px)] min-h-[100px] overflow-y-auto pr-2">
                {goal.subgoals.map(subgoal => (
                  <div
                    key={subgoal.id}
                    className="bg-[#000000]/30 rounded-lg p-3 border border-[#242424]/40"
                  >
                    <p className="text-[#FBFAEE] font-medium text-sm mb-2">
                      {subgoal.title}
                    </p>
                    <div className="space-y-2">
                      {subgoal.tasks.length > 0 ? (
                        subgoal.tasks.map(task => {
                          const isCompleted =
                            taskStatuses[task.id] === 'completed'
                          return (
                            <button
                              key={task.id}
                              onClick={() => toggleTask(task.id)}
                              className={`w-full flex items-center space-x-3 p-2 rounded-md transition text-left ${
                                isCompleted
                                  ? 'bg-[#933DC9]/20'
                                  : 'bg-[#000000]/30 hover:bg-[#000000]/50'
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center ${
                                  isCompleted
                                    ? 'bg-[#933DC9] border-[#C488F8]'
                                    : 'border-[#FBFAEE]/40'
                                }`}
                              >
                                {isCompleted && (
                                  <Check className="w-4 h-4 text-[#FBFAEE]" />
                                )}
                              </div>
                              <span
                                className={`text-sm ${
                                  isCompleted
                                    ? 'text-[#C488F8] line-through'
                                    : 'text-[#FBFAEE]/90'
                                }`}
                              >
                                {task.title}
                              </span>
                            </button>
                          )
                        })
                      ) : (
                        <p className="text-xs text-[#FBFAEE]/60 p-2">
                          No tasks for this subgoal.
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#FBFAEE]/60 text-center py-4">
                This goal has no subgoals or tasks defined.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-[#242424]/50 bg-[#000000]/20 flex-shrink-0">
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex items-center space-x-3 ml-auto">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 bg-[#000000]/40 text-[#FBFAEE]/80 rounded-lg hover:bg-[#000000]/60 transition border border-[#242424]/50 text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-gradient-to-r from-[#933DC9] to-[#53118F] text-[#FBFAEE] px-5 py-2.5 rounded-lg font-semibold hover:brightness-110 transition text-sm flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed min-w-[140px]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Save Progress
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}