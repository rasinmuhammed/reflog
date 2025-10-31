import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { toast } from '@/components/Toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Axios instance with interceptors
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    // Handle network errors
    if (!error.response) {
      toast.error('Network Error', 'Please check your internet connection')
      return Promise.reject(error)
    }

    // Handle specific status codes
    const { status } = error.response

    switch (status) {
      case 401:
        // Unauthorized - redirect to login
        toast.error('Session Expired', 'Please sign in again')
        // Clear local storage and redirect
        localStorage.clear()
        window.location.href = '/sign-in'
        break

      case 403:
        toast.error('Access Denied', 'You don\'t have permission for this action')
        break

      case 404:
        toast.error('Not Found', 'The requested resource was not found')
        break

      case 429:
        // Rate limit - retry after delay
        if (!originalRequest._retry) {
          originalRequest._retry = true
          await new Promise(resolve => setTimeout(resolve, 2000))
          return api(originalRequest)
        }
        toast.error('Too Many Requests', 'Please slow down and try again')
        break

      case 500:
      case 502:
      case 503:
        toast.error('Server Error', 'Something went wrong on our end. Please try again')
        break

      default:
        const message = (error.response.data as any)?.detail || 'An error occurred'
        toast.error('Error', message)
    }

    return Promise.reject(error)
  }
)

// Retry helper with exponential backoff
async function retryRequest<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries === 0) throw error
    
    await new Promise(resolve => setTimeout(resolve, delay))
    return retryRequest(fn, retries - 1, delay * 2)
  }
}

// API methods with proper typing
export const apiService = {
  // User endpoints
  user: {
    create: (data: { github_username: string; email?: string }) =>
      api.post('/users', data),
    
    get: (githubUsername: string) =>
      api.get(`/users/${githubUsername}`),
    
    completeOnboarding: (githubUsername: string) =>
      api.patch(`/users/${githubUsername}/complete-onboarding`)
  },

  // GitHub endpoints
  github: {
    analyze: (githubUsername: string) =>
      retryRequest(() => api.post(`/analyze-github/${githubUsername}`)),
    
    getAnalysis: (githubUsername: string) =>
      api.get(`/github-analysis/${githubUsername}`)
  },

  // Check-in endpoints
  checkins: {
    create: (githubUsername: string, data: {
      energy_level: number
      avoiding_what: string
      commitment: string
      mood?: string
    }) => api.post(`/checkins/${githubUsername}`, data),
    
    get: (githubUsername: string, limit = 30) =>
      api.get(`/checkins/${githubUsername}?limit=${limit}`),
    
    updateEvening: (checkinId: number, data: {
      shipped: boolean
      excuse?: string
    }) => api.patch(`/checkins/${checkinId}/evening`, data)
  },

  // Commitment endpoints
  commitments: {
    getToday: (githubUsername: string) =>
      api.get(`/commitments/${githubUsername}/today`),
    
    getPending: (githubUsername: string) =>
      api.get(`/commitments/${githubUsername}/pending`),
    
    review: (checkinId: number, data: {
      shipped: boolean
      excuse?: string
    }) => api.post(`/commitments/${checkinId}/review`, data),
    
    getStats: (githubUsername: string, days = 30) =>
      api.get(`/commitments/${githubUsername}/stats?days=${days}`),
    
    getReminder: (githubUsername: string) =>
      api.get(`/commitments/${githubUsername}/reminder-needed`)
  },

  // Chat endpoint
  chat: (githubUsername: string, data: {
    message: string
    context?: any
  }) => api.post(`/chat/${githubUsername}`, data),

  // Goals endpoints
  goals: {
    create: (githubUsername: string, data: any) =>
      api.post(`/goals/${githubUsername}`, data),
    
    get: (githubUsername: string, params?: {
      status?: string
      goal_type?: string
    }) => api.get(`/goals/${githubUsername}`, { params }),
    
    getDetail: (githubUsername: string, goalId: number) =>
      api.get(`/goals/${githubUsername}/${goalId}`),
    
    update: (githubUsername: string, goalId: number, data: any) =>
      api.patch(`/goals/${githubUsername}/${goalId}`, data),
    
    logProgress: (githubUsername: string, goalId: number, data: any) =>
      api.post(`/goals/${githubUsername}/${goalId}/progress`, data),
    
    updateTask: (githubUsername: string, goalId: number, taskId: number, status: string) =>
      api.patch(`/goals/${githubUsername}/${goalId}/tasks/${taskId}`, null, {
        params: { status }
      }),
    
    getDashboard: (githubUsername: string) =>
      api.get(`/goals/${githubUsername}/dashboard`)
  },

  // Life decisions endpoints
  decisions: {
    create: (githubUsername: string, data: any) =>
      api.post(`/life-decisions/${githubUsername}`, data),
    
    get: (githubUsername: string, limit = 20) =>
      api.get(`/life-decisions/${githubUsername}?limit=${limit}`),
    
    getDetail: (githubUsername: string, decisionId: number) =>
      api.get(`/life-decisions/${githubUsername}/${decisionId}`),
    
    reanalyze: (githubUsername: string, decisionId: number) =>
      api.post(`/life-decisions/${githubUsername}/${decisionId}/reanalyze`)
  },

  // Dashboard endpoint
  dashboard: (githubUsername: string) =>
    api.get(`/dashboard/${githubUsername}`),

  // Advice/History endpoint
  advice: (githubUsername: string, limit = 50) =>
    api.get(`/advice/${githubUsername}?limit=${limit}`)
}

export default api