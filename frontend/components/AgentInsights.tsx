'use client'

import { Brain, BarChart, Lightbulb } from 'lucide-react'
import MarkdownRenderer from './MarkdownRenderer'

interface Advice {
  agent: string
  advice: string
  date: string
}

interface AgentInsightsProps {
  advice: Advice[]
}

export default function AgentInsights({ advice }: AgentInsightsProps) {
  const getAgentIcon = (agentName: string) => {
    switch (agentName.toLowerCase()) {
      case 'analyst':
        return <BarChart className="w-5 h-5" />
      case 'psychologist':
        return <Brain className="w-5 h-5" />
      case 'strategist':
        return <Lightbulb className="w-5 h-5" />
      default:
        return <Brain className="w-5 h-5" />
    }
  }

  const getAgentColor = (agentName: string) => {
    switch (agentName.toLowerCase()) {
      case 'analyst':
        return 'from-blue-500 to-cyan-500'
      case 'psychologist':
        return 'from-purple-500 to-pink-500'
      case 'strategist':
        return 'from-orange-500 to-red-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  if (advice.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Agent Insights</h2>
        <p className="text-gray-500 text-center py-8">
          No insights yet. Complete your first check-in or run a GitHub analysis.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">Recent Agent Insights</h2>
      
      <div className="space-y-4">
        {advice.map((item, idx) => (
          <div
            key={idx}
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:bg-gray-800 hover:border-gray-600 transition"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className={`bg-gradient-to-r ${getAgentColor(item.agent)} text-white p-2 rounded-lg mr-3 shadow-lg`}>
                  {getAgentIcon(item.agent)}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{item.agent}</h3>
                  <p className="text-xs text-gray-500">{item.date}</p>
                </div>
              </div>
            </div>
            
            <MarkdownRenderer 
              content={item.advice} 
              className="text-gray-300"
            />
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl">
        <p className="text-sm text-gray-300">
          💡 <strong className="text-white">Tip:</strong> These insights are based on your actual behavior patterns, 
          not generic advice. Review them regularly to track your growth.
        </p>
      </div>
    </div>
  )
}