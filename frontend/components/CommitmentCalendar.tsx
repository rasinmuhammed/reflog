'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Calendar, CheckCircle, XCircle, Circle } from 'lucide-react'

const API_URL = 'http://localhost:8000'

interface CommitmentDay {
  date: string
  commitment: string
  shipped: boolean | null
  energy: number
}

interface CommitmentCalendarProps {
  githubUsername: string
}

export default function CommitmentCalendar({ githubUsername }: CommitmentCalendarProps) {
  const [days, setDays] = useState<CommitmentDay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCalendarData()
  }, [githubUsername])

  const loadCalendarData = async () => {
    try {
      const response = await axios.get(`${API_URL}/checkins/${githubUsername}?limit=30`)
      const formatted = response.data.map((checkin: any) => ({
        date: new Date(checkin.timestamp).toLocaleDateString(),
        commitment: checkin.commitment,
        shipped: checkin.shipped,
        energy: checkin.energy_level
      }))
      setDays(formatted)
      setLoading(false)
    } catch (error) {
      console.error('Failed to load calendar:', error)
      setLoading(false)
    }
  }

  const getDayIcon = (shipped: boolean | null) => {
    if (shipped === true) return <CheckCircle className="w-6 h-6 text-green-400" />
    if (shipped === false) return <XCircle className="w-6 h-6 text-red-400" />
    return <Circle className="w-6 h-6 text-gray-600" />
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6">
      <div className="flex items-center mb-6">
        <Calendar className="w-6 h-6 text-blue-400 mr-3" />
        <h3 className="text-xl font-bold text-white">Commitment Calendar</h3>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {days.slice(0, 28).map((day, idx) => (
            <div
              key={idx}
              className="aspect-square bg-gray-800/50 border border-gray-700 rounded-lg flex flex-col items-center justify-center p-2 hover:bg-gray-800 transition group cursor-pointer"
              title={day.commitment}
            >
              {getDayIcon(day.shipped)}
              <span className="text-xs text-gray-500 mt-1">
                {new Date(day.date).getDate()}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-400">
        <div className="flex items-center">
          <CheckCircle className="w-4 h-4 text-green-400 mr-1" />
          <span>Shipped</span>
        </div>
        <div className="flex items-center">
          <XCircle className="w-4 h-4 text-red-400 mr-1" />
          <span>Missed</span>
        </div>
        <div className="flex items-center">
          <Circle className="w-4 h-4 text-gray-600 mr-1" />
          <span>Pending</span>
        </div>
      </div>
    </div>
  )
}