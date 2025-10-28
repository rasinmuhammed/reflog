'use client'

import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { Send, Brain, BarChart, AlertTriangle, Target, Loader2, MessageCircle, History, Eye, EyeOff, Sparkles } from 'lucide-react'

// Define the API URL - Make sure this points to your running backend
const API_URL = 'http://localhost:8000'

// Interface for the structure of each chat message
interface Message {
  type: 'user' | 'assistant' | 'error'
  content: string
  // Optional fields for assistant messages containing deliberation details
  debate?: Array<{
    agent: string
    perspective: string
    color: string // This might be dynamically assigned or fetched if backend provides it
  }>
  insights?: string[]
  actions?: Array<{
    action: string
    priority: string
  }>
  timestamp: Date
}

// Interface for the Chat component props
interface ChatProps {
  githubUsername: string
}

export default function Chat({ githubUsername }: ChatProps) {
  // State for messages, input field, loading status, and debate visibility
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDebateByDefault, setShowDebateByDefault] = useState(true) // Global toggle for default state
  const [expandedDebateIndex, setExpandedDebateIndex] = useState<number | null>(null) // Tracks which message's debate is expanded
  const messagesEndRef = useRef<HTMLDivElement>(null) // Ref to scroll to the bottom

  // Function to scroll the chat view to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Scroll to bottom whenever messages update
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Color mapping for agent icons/backgrounds
  const agentColors: Record<string, string> = {
    'Analyst': 'from-blue-500 to-cyan-500',
    'Psychologist': 'from-purple-500 to-pink-500',
    'Contrarian': 'from-red-500 to-orange-500',
    'Strategist': 'from-green-500 to-emerald-500'
  }

  // Icon mapping for different agents
  const agentIcons: Record<string, JSX.Element> = {
    'Analyst': <BarChart className="w-5 h-5" />,
    'Psychologist': <Brain className="w-5 h-5" />,
    'Contrarian': <AlertTriangle className="w-5 h-5" />,
    'Strategist': <Target className="w-5 h-5" />
  }

  // Function to handle sending a message
  const handleSend = async () => {
    // Prevent sending empty messages or while loading
    if (!input.trim() || loading) return

    const userMessage = input
    setInput('') // Clear input field immediately

    // Add user message to state optimistically
    setMessages(prev => [...prev, {
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    }])

    setLoading(true) // Set loading state

    try {
      // Make API call to the backend chat endpoint
      const response = await axios.post(`${API_URL}/chat/${githubUsername}`, {
        message: userMessage
      })

      // Add assistant response to state
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: response.data.response,
        debate: response.data.agent_debate, // Include debate details
        insights: response.data.key_insights, // Include key insights
        actions: response.data.recommended_actions, // Include actions
        timestamp: new Date()
      }])
    } catch (error) {
      console.error('Chat error:', error)
      // Add error message to state
      setMessages(prev => [...prev, {
        type: 'error',
        content: 'Failed to get response. Please try again.',
        timestamp: new Date()
      }])
    } finally {
      setLoading(false) // Clear loading state
    }
  }

  // Handle Enter key press (without Shift) to send message
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Example quick prompts for the user
  const quickPrompts = [
    "Should I learn a new framework or deepen my current skills?",
    "I keep starting projects but never finish them. Why?",
    "Should I apply for senior roles or stay at my level?",
    "How do I know if I'm actually improving or just busy?"
  ]

  return (
    // Main chat container with dark theme styling and rounded corners
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-3xl shadow-2xl overflow-hidden">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Header Icon */}
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
              <MessageCircle className="w-8 h-8" />
            </div>
            {/* Header Text */}
            <div>
              <h2 className="text-3xl font-bold">Chat with Sage</h2>
              <p className="text-blue-100 text-sm">Multi-agent AI deliberation</p>
            </div>
          </div>
          {/* Toggle Button for Default Debate Visibility */}
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
        {/* Initial state with quick prompts */}
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-3xl shadow-lg w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Brain className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Ask me anything
            </h3>
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
          // Mapping through messages to display them
          messages.map((msg, idx) => (
            <div key={idx}>
              {/* User Message Styling */}
              {msg.type === 'user' ? (
                <div className="flex justify-end">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-2xl rounded-tr-none max-w-2xl shadow-lg">
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ) : /* Assistant Message Styling */
              msg.type === 'assistant' ? (
                <div className="space-y-4">
                  {/* Main Response Bubble */}
                  <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 px-6 py-5 rounded-2xl rounded-tl-none max-w-3xl shadow-lg">
                    <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>
                  </div>

                  {/* Agent Debate Section (Conditionally Rendered) */}
                  {msg.debate && msg.debate.length > 0 && (
                    <div className="ml-8 space-y-3">
                      {/* Button to toggle individual debate visibility */}
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

                      {/* Render debate details if expanded or default is on */}
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
                                  {/* Perspective seems duplicated below, might remove this line if redundant */}
                                  {/* <div className="text-xs text-gray-500 uppercase">{agent.perspective}</div> */}
                                </div>
                                <div className="text-sm text-gray-300 leading-relaxed">
                                  {agent.perspective}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Key Insights Section */}
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

                  {/* Immediate Actions Section */}
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
              ) : /* Error Message Styling */
              (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-3 rounded-lg max-w-md">
                  {msg.content}
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading Indicator */}
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
        {/* Empty div to ensure scrolling works */}
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
            rows={2} // Increased rows slightly
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