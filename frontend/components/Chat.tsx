'use client'

import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { Send, Brain, BarChart, AlertTriangle, Target, Loader2, MessageCircle, History, Eye, EyeOff, Sparkles, Terminal } from 'lucide-react'
import MarkdownRenderer from './MarkdownRenderer'

const API_URL = 'http://localhost:8000'

interface AgentContribution {
  agent: string
  output: string
  timestamp: string
}

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
  raw_deliberation?: AgentContribution[]
  timestamp: Date
}

interface ChatProps {
  githubUsername: string
}

export default function Chat({ githubUsername }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDebateByDefault, setShowDebateByDefault] = useState(true)
  const [expandedDebateIndex, setExpandedDebateIndex] = useState<number | null>(null)
  const [showRawDeliberation, setShowRawDeliberation] = useState<number | null>(null)
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
        raw_deliberation: response.data.raw_deliberation,
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
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-3xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
              <MessageCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Chat with Sage</h2>
              <p className="text-blue-100 text-sm">Multi-agent AI deliberation</p>
            </div>
          </div>
          <button
            onClick={() => setShowDebateByDefault(!showDebateByDefault)}
            className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition backdrop-blur-sm"
          >
            {showDebateByDefault ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>{showDebateByDefault ? 'Debates On' : 'Debates Off'}</span>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-950 to-gray-900">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-3xl shadow-lg w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Brain className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Ask me anything</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              I'll analyze your question with multiple AI agents who will debate to give you the best advice.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(prompt)}
                  className="p-4 text-left bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-xl text-sm transition text-gray-300 hover:text-white group"
                >
                  <Sparkles className="w-4 h-4 inline mr-2 text-blue-400 group-hover:text-blue-300" />
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
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-2xl rounded-tr-none max-w-2xl shadow-lg">
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ) : msg.type === 'assistant' ? (
                <div className="space-y-4">
                  {/* Main Response with Markdown */}
                  <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 px-6 py-5 rounded-2xl rounded-tl-none max-w-3xl shadow-lg">
                    <MarkdownRenderer 
                      content={msg.content} 
                      className="text-gray-200"
                    />
                  </div>

                  {/* Raw Deliberation Section */}
                  {msg.raw_deliberation && msg.raw_deliberation.length > 0 && (
                    <div className="ml-8">
                      <button
                        onClick={() => setShowRawDeliberation(showRawDeliberation === idx ? null : idx)}
                        className="flex items-center space-x-2 text-sm font-semibold text-gray-400 hover:text-gray-300 transition mb-3"
                      >
                        <Terminal className="w-4 h-4" />
                        <span>
                          {showRawDeliberation === idx ? 'Hide Raw Deliberation' : 'Show Raw Deliberation'}
                        </span>
                        <span className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full text-xs">
                          Behind the scenes
                        </span>
                      </button>

                      {showRawDeliberation === idx && (
                        <div className="space-y-3 animate-in slide-in-from-top duration-300 mb-4">
                          {msg.raw_deliberation.map((contribution, i) => (
                            <div
                              key={i}
                              className="bg-gray-900/80 border border-gray-700 rounded-xl p-4 overflow-hidden"
                            >
                              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-700">
                                <div className="flex items-center space-x-2">
                                  <div className={`bg-gradient-to-r ${agentColors[contribution.agent]} w-3 h-3 rounded-full shadow-lg`}></div>
                                  <span className="text-gray-300 font-bold text-sm">{contribution.agent}</span>
                                </div>
                                <span className="text-gray-500 text-xs">
                                  {new Date(contribution.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <div className="text-xs">
                                <MarkdownRenderer 
                                  content={contribution.output} 
                                  className="text-gray-400 font-mono"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Agent Debate Section */}
                  {msg.debate && msg.debate.length > 0 && (
                    <div className="ml-8 space-y-3">
                      <button
                        onClick={() => setExpandedDebateIndex(expandedDebateIndex === idx ? null : idx)}
                        className="flex items-center space-x-2 text-sm font-semibold text-gray-400 hover:text-gray-300 transition mb-3"
                      >
                        <History className="w-4 h-4" />
                        <span>
                          {(showDebateByDefault || expandedDebateIndex === idx)
                            ? 'Hide Agent Debate'
                            : 'Show Agent Debate'}
                        </span>
                        <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full text-xs">
                          {msg.debate.length} agents
                        </span>
                      </button>

                      {(showDebateByDefault || expandedDebateIndex === idx) && (
                        <div className="space-y-3 animate-in slide-in-from-top duration-300">
                          {msg.debate.map((agent, i) => (
                            <div
                              key={i}
                              className="flex items-start space-x-3 p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-800/70 transition-all group"
                            >
                              <div className={`bg-gradient-to-r ${agentColors[agent.agent]} text-white p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform`}>
                                {agentIcons[agent.agent]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="font-semibold text-white">{agent.agent}</div>
                                </div>
                                <div className="text-sm leading-relaxed">
                                  <MarkdownRenderer 
                                    content={agent.perspective} 
                                    className="text-gray-300"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Key Insights */}
                  {msg.insights && msg.insights.length > 0 && (
                    <div className="ml-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4">
                      <h4 className="font-semibold text-blue-400 mb-3 flex items-center">
                        <Brain className="w-4 h-4 mr-2" />
                        Key Insights:
                      </h4>
                      <ul className="space-y-2">
                        {msg.insights.map((insight, i) => (
                          <li key={i} className="text-sm text-gray-300 flex items-start">
                            <span className="text-blue-400 mr-2">•</span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Immediate Actions */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="ml-8 bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/30 rounded-xl p-4">
                      <h4 className="font-semibold text-green-400 mb-3 flex items-center">
                        <Target className="w-4 h-4 mr-2" />
                        Immediate Actions:
                      </h4>
                      <ul className="space-y-2">
                        {msg.actions.map((action, i) => (
                          <li key={i} className="text-sm text-gray-300 flex items-start">
                            <span className={`font-bold mr-2 ${action.priority === 'high' ? 'text-red-400' : 'text-green-400'}`}>
                              {i + 1}.
                            </span>
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
      <div className="border-t border-gray-700 p-4 bg-gradient-to-t from-gray-900 to-gray-800/50">
        <div className="flex items-end space-x-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Sage anything..."
            className="flex-1 px-4 py-3 bg-gray-800/70 border border-gray-600 text-gray-200 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-inner"
            rows={2}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          💡 Press Enter to send, Shift+Enter for new line. Powered by multi-agent deliberation.
        </p>
      </div>
    </div>
  )
}