'use client'

import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { Send, Brain, BarChart, AlertTriangle, Target, Loader2, MessageCircle, History } from 'lucide-react'

const API_URL = 'http://localhost:8000'

interface Message {
  type: 'user' | 'assistant' | 'error'
  content: string
  debate?: Array<{
    agent: string
    perspective: string
    color: string
  }>
  insights?: string[]
  actions?: Array<{
    action: string
    priority: string
  }>
  timestamp: Date
}

interface ChatProps {
  githubUsername: string
}

export default function Chat({ githubUsername }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDebate, setShowDebate] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const agentColors: Record<string, string> = {
    'Analyst': 'from-blue-500 to-cyan-500',
    'Psychologist': 'from-purple-500 to-pink-500',
    'Contrarian': 'from-red-500 to-orange-500',
    'Strategist': 'from-green-500 to-emerald-500'
  }

  const agentIcons: Record<string, JSX.Element> = {
    'Analyst': <BarChart className="w-5 h-5" />,
    'Psychologist': <Brain className="w-5 h-5" />,
    'Contrarian': <AlertTriangle className="w-5 h-5" />,
    'Strategist': <Target className="w-5 h-5" />
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input
    setInput('')
    
    setMessages(prev => [...prev, {
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    }])

    setLoading(true)

    try {
      const response = await axios.post(`${API_URL}/chat/${githubUsername}`, {
        message: userMessage
      })

      setMessages(prev => [...prev, {
        type: 'assistant',
        content: response.data.response,
        debate: response.data.agent_debate,
        insights: response.data.key_insights,
        actions: response.data.recommended_actions,
        timestamp: new Date()
      }])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        type: 'error',
        content: 'Failed to get response. Please try again.',
        timestamp: new Date()
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const quickPrompts = [
    "Should I learn a new framework or deepen my current skills?",
    "I keep starting projects but never finish them. Why?",
    "Should I apply for senior roles or stay at my level?",
    "How do I know if I'm actually improving or just busy?"
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-gray-900 border border-gray-800 rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageCircle className="w-8 h-8 mr-3" />
            <div>
              <h2 className="text-2xl font-bold">Chat with Sage</h2>
              <p className="text-blue-100 text-sm">Your brutally honest AI mentor</p>
            </div>
          </div>
          {messages.some(m => m.debate) && (
            <button
              onClick={() => setShowDebate(!showDebate)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition"
            >
              {showDebate ? 'Hide' : 'Show'} Agent Debate
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-950">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              Ask me anything
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              I'll analyze your question with multiple AI agents who will debate to give you the best advice.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(prompt)}
                  className="p-3 text-left bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm transition text-gray-300"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx}>
              {msg.type === 'user' ? (
                <div className="flex justify-end">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl rounded-tr-none max-w-2xl">
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ) : msg.type === 'assistant' ? (
                <div className="space-y-4">
                  {/* Main Response */}
                  <div className="bg-gray-800 border border-gray-700 px-6 py-4 rounded-2xl rounded-tl-none max-w-3xl">
                    <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>
                  </div>

                  {/* Agent Debate */}
                  {showDebate && msg.debate && (
                    <div className="ml-8 space-y-3">
                      <div className="flex items-center text-sm font-semibold text-gray-400 mb-2">
                        <History className="w-4 h-4 mr-2" />
                        How the agents debated this:
                      </div>
                      {msg.debate.map((agent, i) => (
                        <div
                          key={i}
                          className="flex items-start space-x-3 p-3 bg-gray-800 border border-gray-700 rounded-lg"
                        >
                          <div className={`bg-gradient-to-r ${agentColors[agent.agent]} text-white p-2 rounded-lg`}>
                            {agentIcons[agent.agent]}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-sm text-white">{agent.agent}</div>
                            <div className="text-xs text-gray-400">{agent.perspective}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="ml-8 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <h4 className="font-semibold text-green-400 mb-2 flex items-center">
                        <Target className="w-4 h-4 mr-2" />
                        Immediate Actions:
                      </h4>
                      <ul className="space-y-2">
                        {msg.actions.map((action, i) => (
                          <li key={i} className="text-sm text-gray-300 flex items-start">
                            <span className="font-bold text-green-400 mr-2">{i + 1}.</span>
                            <span>{action.action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-3 rounded-lg max-w-md">
                  {msg.content}
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="flex items-start space-x-3">
            <div className="bg-gray-800 border border-gray-700 px-6 py-4 rounded-2xl rounded-tl-none">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                <div>
                  <p className="text-gray-300 font-medium">Agents are deliberating...</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Analyst, Psychologist, Contrarian, and Strategist are debating your question
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-800 p-4 bg-gray-900">
        <div className="flex items-end space-x-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your career, patterns, or decisions..."
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={2}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}

// This file is: frontend/components/Chat.tsx