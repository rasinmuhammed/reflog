'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import { Plus, Check, Trash2, Loader2, Circle, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface QuickTask {
    id: number
    title: string
    completed: boolean
    created_at: string
    completed_at: string | null
}

interface QuickTasksProps {
    githubUsername: string
}

export default function QuickTasks({ githubUsername }: QuickTasksProps) {
    const [tasks, setTasks] = useState<QuickTask[]>([])
    const [newTask, setNewTask] = useState('')
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)
    const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 })
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
        try {
            const response = await axios.post(`${API_URL}/quick-tasks/${githubUsername}`, {
                title: newTask.trim()
            })
            setTasks(prev => [response.data, ...prev])
            setNewTask('')
            setStats(prev => ({ ...prev, total: prev.total + 1, pending: prev.pending + 1 }))
            inputRef.current?.focus()
        } catch (error) {
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

            // Update stats
            if (!currentStatus) {
                // Was incomplete, now complete
                setStats(prev => ({
                    ...prev,
                    completed: prev.completed + 1,
                    pending: prev.pending - 1
                }))
                // Celebration for completion
                confetti({
                    particleCount: 30,
                    spread: 50,
                    origin: { y: 0.7 },
                    colors: ['#933DC9', '#C488F8', '#22c55e']
                })
            } else {
                // Was complete, now incomplete
                setStats(prev => ({
                    ...prev,
                    completed: prev.completed - 1,
                    pending: prev.pending + 1
                }))
            }
        } catch (error) {
            // Revert on error
            setTasks(prev => prev.map(t =>
                t.id === taskId ? { ...t, completed: currentStatus } : t
            ))
            console.error('Failed to toggle task:', error)
        }
    }

    const deleteTask = async (taskId: number, wasCompleted: boolean) => {
        // Optimistic update
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
            console.error('Failed to delete task:', error)
            fetchTasks() // Refetch on error
        }
    }

    const incompleteTasks = tasks.filter(t => !t.completed)
    const completedTasks = tasks.filter(t => t.completed)

    return (
        <div className="space-y-4">
            {/* Header with Stats */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-[#FBFAEE]">Today's Tasks</h2>
                    <p className="text-sm text-[#FBFAEE]/60">
                        {stats.completed}/{stats.total} completed
                        {stats.total > 0 && (
                            <span className="ml-2 text-[#C488F8]">
                                ({Math.round((stats.completed / stats.total) * 100)}%)
                            </span>
                        )}
                    </p>
                </div>
                {stats.total > 0 && stats.completed === stats.total && (
                    <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-sm font-medium animate-pulse">
                        🎉 All done!
                    </div>
                )}
            </div>

            {/* Quick Add Input */}
            <form onSubmit={addTask} className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add a task..."
                    className="w-full px-4 py-3 pl-12 bg-[#242424] border border-white/10 text-[#FBFAEE] placeholder-[#FBFAEE]/40 rounded-xl focus:ring-2 focus:ring-[#933DC9] focus:border-transparent transition-all text-lg"
                    disabled={adding}
                />
                <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FBFAEE]/40" />
                {adding && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#933DC9] animate-spin" />
                )}
            </form>

            {/* Task List */}
            {loading ? (
                <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#933DC9]" />
                </div>
            ) : (
                <div className="space-y-2">
                    {/* Incomplete Tasks */}
                    <AnimatePresence mode="popLayout">
                        {incompleteTasks.map((task) => (
                            <motion.div
                                key={task.id}
                                layout
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                className="group flex items-center gap-3 p-3 bg-[#242424] border border-white/5 rounded-xl hover:border-[#933DC9]/30 transition-all"
                            >
                                <button
                                    onClick={() => toggleTask(task.id, task.completed)}
                                    className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-[#FBFAEE]/30 hover:border-[#933DC9] transition-colors flex items-center justify-center group-hover:border-[#933DC9]/50"
                                >
                                    <Circle className="w-4 h-4 text-transparent group-hover:text-[#933DC9]/30" />
                                </button>
                                <span className="flex-1 text-[#FBFAEE]">{task.title}</span>
                                <button
                                    onClick={() => deleteTask(task.id, task.completed)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg transition-all"
                                >
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Empty State */}
                    {incompleteTasks.length === 0 && completedTasks.length === 0 && (
                        <div className="text-center py-12 text-[#FBFAEE]/40">
                            <Circle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p>No tasks yet. Type above to add one.</p>
                        </div>
                    )}

                    {/* Completed Tasks */}
                    {completedTasks.length > 0 && (
                        <div className="mt-6">
                            <p className="text-xs text-[#FBFAEE]/40 uppercase tracking-wider mb-2">
                                Completed ({completedTasks.length})
                            </p>
                            <AnimatePresence mode="popLayout">
                                {completedTasks.map((task) => (
                                    <motion.div
                                        key={task.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        className="group flex items-center gap-3 p-3 bg-[#1a1a1a] border border-white/5 rounded-xl opacity-60 hover:opacity-80 transition-all"
                                    >
                                        <button
                                            onClick={() => toggleTask(task.id, task.completed)}
                                            className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center"
                                        >
                                            <Check className="w-3.5 h-3.5 text-green-400" />
                                        </button>
                                        <span className="flex-1 text-[#FBFAEE]/60 line-through">{task.title}</span>
                                        <button
                                            onClick={() => deleteTask(task.id, task.completed)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-400/60" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
