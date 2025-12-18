'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import {
    Plus,
    Check,
    Trash2,
    Circle,
    Sparkles,
    Calendar,
    Clock,
    MoreHorizontal
} from 'lucide-react'
import confetti from 'canvas-confetti'
import GlassCard from '@/components/ui/premium/GlassCard'
import AnimatedCounter from '@/components/ui/premium/AnimatedCounter'
import { StreakFlame, FloatingXP } from '@/components/ui/premium/Gamification'
import GitHubAnalysis from '@/components/features/github/GitHubAnalysis'
import ProactiveInsights from '@/components/features/insights/ProactiveInsights'
import { cn } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface QuickTask {
    id: number
    title: string
    completed: boolean
    created_at: string
    completed_at: string | null
}

interface TodayViewProps {
    githubUsername: string
    onCheckIn?: () => void
    userData?: {
        streak: number
        bestStreak: number
        todayCommitment?: string
    }
}

/**
 * Premium Today View
 * 
 * The centerpiece of daily productivity
 * 
 * Design Philosophy (from our expert team):
 * - Senior FE: Smooth reorder animations, optimistic updates
 * - Strategist: Task input is the hero, everything supports it
 * - Psychologist: Celebration moments, streak visibility
 * - PM: Premium feel in every interaction
 * - Architect: Clean separation, reusable patterns
 */
export default function TodayView({
    githubUsername,
    onCheckIn,
    userData
}: TodayViewProps) {
    const [tasks, setTasks] = useState<QuickTask[]>([])
    const [newTask, setNewTask] = useState('')
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)
    const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 })
    const [showXP, setShowXP] = useState(false)
    const [xpAmount, setXpAmount] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)

    const fetchTasks = useCallback(async () => {
        try {
            const [tasksRes, statsRes] = await Promise.all([
                axios.get(`${API_URL}/quick-tasks/${githubUsername}?include_completed=true&days=1`),
                axios.get(`${API_URL}/quick-tasks/${githubUsername}/stats`)
            ])
            setTasks(tasksRes.data)
            setStats(statsRes.data)
        } catch (error) {
            console.error('Failed to fetch tasks:', error)
        } finally {
            setLoading(false)
        }
    }, [githubUsername])

    useEffect(() => {
        fetchTasks()
    }, [fetchTasks])

    const addTask = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTask.trim() || adding) return

        setAdding(true)

        // Optimistic update
        const tempId = Date.now()
        const tempTask: QuickTask = {
            id: tempId,
            title: newTask.trim(),
            completed: false,
            created_at: new Date().toISOString(),
            completed_at: null
        }
        setTasks(prev => [tempTask, ...prev])
        setNewTask('')

        try {
            const response = await axios.post(`${API_URL}/quick-tasks/${githubUsername}`, {
                title: tempTask.title
            })
            // Replace temp with real
            setTasks(prev => prev.map(t => t.id === tempId ? response.data : t))
            setStats(prev => ({ ...prev, total: prev.total + 1, pending: prev.pending + 1 }))
            inputRef.current?.focus()
        } catch (error) {
            // Rollback on error
            setTasks(prev => prev.filter(t => t.id !== tempId))
            console.error('Failed to add task:', error)
        } finally {
            setAdding(false)
        }
    }

    const toggleTask = async (taskId: number, currentStatus: boolean) => {
        // Optimistic update
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, completed: !currentStatus } : t
        ))

        try {
            await axios.patch(`${API_URL}/quick-tasks/${githubUsername}/${taskId}`, {
                completed: !currentStatus
            })

            if (!currentStatus) {
                // Completing a task
                setStats(prev => ({
                    ...prev,
                    completed: prev.completed + 1,
                    pending: prev.pending - 1
                }))

                // XP animation
                setXpAmount(25)
                setShowXP(true)

                // Confetti!
                confetti({
                    particleCount: 50,
                    spread: 60,
                    origin: { y: 0.7 },
                    colors: ['#9333ea', '#c084fc', '#22c55e', '#fbbf24']
                })
            } else {
                setStats(prev => ({
                    ...prev,
                    completed: prev.completed - 1,
                    pending: prev.pending + 1
                }))
            }
        } catch (error) {
            // Rollback
            setTasks(prev => prev.map(t =>
                t.id === taskId ? { ...t, completed: currentStatus } : t
            ))
        }
    }

    const deleteTask = async (taskId: number, wasCompleted: boolean) => {
        const taskToDelete = tasks.find(t => t.id === taskId)
        setTasks(prev => prev.filter(t => t.id !== taskId))

        try {
            await axios.delete(`${API_URL}/quick-tasks/${githubUsername}/${taskId}`)
            setStats(prev => ({
                ...prev,
                total: prev.total - 1,
                completed: wasCompleted ? prev.completed - 1 : prev.completed,
                pending: wasCompleted ? prev.pending : prev.pending - 1
            }))
        } catch (error) {
            // Rollback
            if (taskToDelete) {
                setTasks(prev => [...prev, taskToDelete])
            }
        }
    }

    const incompleteTasks = tasks.filter(t => !t.completed)
    const completedTasks = tasks.filter(t => t.completed)
    const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

    // Get current time greeting
    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good morning'
        if (hour < 18) return 'Good afternoon'
        return 'Good evening'
    }

    return (
        <div className="h-full overflow-y-auto p-6 md:p-8 lg:p-12">
            {/* Floating XP */}
            <FloatingXP
                amount={xpAmount}
                show={showXP}
                onComplete={() => setShowXP(false)}
            />

            <div className="max-w-3xl mx-auto space-y-8">
                {/* Hero Section */}
                <header className="space-y-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-3xl md:text-4xl font-bold text-white"
                            >
                                {getGreeting()} ✨
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-white/60 mt-2"
                            >
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </motion.p>
                        </div>

                        {/* Streak display */}
                        {userData?.streak !== undefined && userData.streak > 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-orange-500/20 to-red-500/10 border border-orange-500/20"
                            >
                                <StreakFlame streak={userData.streak} size="md" />
                                <div className="text-right">
                                    <div className="text-lg font-bold text-white">
                                        <AnimatedCounter value={userData.streak} suffix=" days" />
                                    </div>
                                    <p className="text-xs text-orange-300/70">Current streak</p>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Today's Commitment (if set) */}
                    {userData?.todayCommitment && (
                        <GlassCard className="p-4" glow>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-purple-300 font-medium uppercase tracking-wider">
                                        Today's Commitment
                                    </p>
                                    <p className="text-white font-medium">{userData.todayCommitment}</p>
                                </div>
                            </div>
                        </GlassCard>
                    )}
                </header>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4">
                    <GlassCard className="p-4 text-center">
                        <AnimatedCounter
                            value={stats.total}
                            className="text-2xl font-bold text-white"
                        />
                        <p className="text-xs text-white/50 mt-1">Total tasks</p>
                    </GlassCard>

                    <GlassCard className="p-4 text-center">
                        <AnimatedCounter
                            value={stats.completed}
                            className="text-2xl font-bold text-green-400"
                        />
                        <p className="text-xs text-white/50 mt-1">Completed</p>
                    </GlassCard>

                    <GlassCard className="p-4 text-center">
                        <AnimatedCounter
                            value={completionRate}
                            suffix="%"
                            className="text-2xl font-bold text-purple-400"
                        />
                        <p className="text-xs text-white/50 mt-1">Done</p>
                    </GlassCard>
                </div>

                {/* Proactive AI Insights */}
                <ProactiveInsights
                    githubUsername={githubUsername}
                    streak={userData?.streak || 0}
                    completionRate={completionRate}
                    pendingTasks={incompleteTasks.length}
                />

                {/* Task Input - The Hero */}
                <GlassCard className="p-2" glow>
                    <form onSubmit={addTask} className="relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="What needs to be done today?"
                            className={cn(
                                'w-full px-5 py-4 pl-14 rounded-xl',
                                'bg-transparent border-0',
                                'text-white placeholder-white/40',
                                'text-lg font-medium',
                                'focus:outline-none focus:ring-0',
                                'transition-all'
                            )}
                            disabled={adding}
                            autoFocus
                        />
                        <div className="absolute left-5 top-1/2 -translate-y-1/2">
                            <motion.div
                                animate={adding ? { rotate: 360 } : { rotate: 0 }}
                                transition={{ duration: 0.5, repeat: adding ? Infinity : 0 }}
                            >
                                <Plus className={cn(
                                    'w-5 h-5',
                                    newTask ? 'text-purple-400' : 'text-white/40'
                                )} />
                            </motion.div>
                        </div>

                        {newTask && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                type="submit"
                                disabled={adding}
                                className={cn(
                                    'absolute right-2 top-1/2 -translate-y-1/2',
                                    'px-4 py-2 rounded-lg',
                                    'bg-gradient-to-r from-purple-600 to-indigo-600',
                                    'text-white text-sm font-medium',
                                    'hover:brightness-110 transition',
                                    'disabled:opacity-50'
                                )}
                            >
                                Add
                            </motion.button>
                        )}
                    </form>
                </GlassCard>

                {/* Task List */}
                <div className="space-y-3">
                    {/* Incomplete Tasks */}
                    <AnimatePresence mode="popLayout">
                        {incompleteTasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onToggle={() => toggleTask(task.id, task.completed)}
                                onDelete={() => deleteTask(task.id, task.completed)}
                            />
                        ))}
                    </AnimatePresence>

                    {/* Empty State */}
                    {!loading && incompleteTasks.length === 0 && completedTasks.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-16"
                        >
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-600/20 to-indigo-600/10 flex items-center justify-center">
                                <Sparkles className="w-10 h-10 text-purple-400/50" />
                            </div>
                            <h3 className="text-xl font-semibold text-white/80 mb-2">
                                Ready to be productive?
                            </h3>
                            <p className="text-white/50 max-w-sm mx-auto">
                                Add your first task above to get started. Every journey begins with a single step.
                            </p>
                        </motion.div>
                    )}

                    {/* All Done State */}
                    {!loading && incompleteTasks.length === 0 && completedTasks.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-8"
                        >
                            <div className="text-4xl mb-4">🎉</div>
                            <h3 className="text-xl font-bold text-white mb-2">
                                All tasks complete!
                            </h3>
                            <p className="text-white/60">
                                You've crushed it today. Keep the momentum going!
                            </p>
                        </motion.div>
                    )}

                    {/* Completed Tasks */}
                    {completedTasks.length > 0 && (
                        <div className="mt-8">
                            <p className="text-xs text-white/40 uppercase tracking-wider font-medium mb-3 px-2">
                                Completed ({completedTasks.length})
                            </p>
                            <div className="space-y-2 opacity-60">
                                <AnimatePresence mode="popLayout">
                                    {completedTasks.map((task) => (
                                        <TaskItem
                                            key={task.id}
                                            task={task}
                                            onToggle={() => toggleTask(task.id, task.completed)}
                                            onDelete={() => deleteTask(task.id, task.completed)}
                                            completed
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}
                </div>

                {/* GitHub Activity Analysis */}
                <div className="mt-8 pt-8 border-t border-white/10">
                    <GitHubAnalysis githubUsername={githubUsername} />
                </div>
            </div>
        </div>
    )
}

interface TaskItemProps {
    task: QuickTask
    onToggle: () => void
    onDelete: () => void
    completed?: boolean
}

function TaskItem({ task, onToggle, onDelete, completed }: TaskItemProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
            className={cn(
                'group flex items-center gap-4 p-4 rounded-xl',
                'bg-white/[0.03] border border-white/[0.06]',
                'hover:bg-white/[0.05] hover:border-white/[0.1]',
                'transition-all duration-200'
            )}
        >
            {/* Checkbox */}
            <motion.button
                onClick={onToggle}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
                    'border-2 transition-all duration-200',
                    completed
                        ? 'bg-green-500/20 border-green-500 text-green-400'
                        : 'border-white/30 hover:border-purple-400 text-transparent hover:text-purple-400/30'
                )}
            >
                <Check className="w-3.5 h-3.5" />
            </motion.button>

            {/* Content */}
            <span className={cn(
                'flex-1 text-white font-medium transition-all',
                completed && 'line-through text-white/50'
            )}>
                {task.title}
            </span>

            {/* Delete */}
            <motion.button
                onClick={onDelete}
                initial={{ opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-all"
            >
                <Trash2 className="w-4 h-4" />
            </motion.button>
        </motion.div>
    )
}
