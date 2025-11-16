import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { toast } from '@/components/Toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Simple in-memory cache with TTL
class RequestCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  
  set(key: string, data: any, ttl: number = 5 * 60 * 1000) {
    this.cache.set(key, { data, timestamp: Date.now(), ttl })
  }
  
  get(key: string) {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data
  }
  
  invalidate(pattern: string) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }
  
  clear() {
    this.cache.clear()
  }
}

const requestCache = new RequestCache()

// Axios instance with caching
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor with caching
api.interceptors.request.use(
  (config) => {
    // Check cache for GET requests
    if (config.method === 'get') {
      const cacheKey = `${config.url}${JSON.stringify(config.params || {})}`
      const cached = requestCache.get(cacheKey)
      if (cached) {
        // Return cached response
        return Promise.reject({ 
          __cached: true, 
          data: cached,
          config
        })
      }
    }
    
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor with caching
api.interceptors.response.use(
  (response) => {
    // Cache successful GET requests
    if (response.config.method === 'get') {
      const cacheKey = `${response.config.url}${JSON.stringify(response.config.params || {})}`
      // Cache for 5 minutes by default, 1 minute for dashboard/stats
      const ttl = response.config.url?.includes('dashboard') || response.config.url?.includes('stats') 
        ? 60 * 1000 
        : 5 * 60 * 1000
      requestCache.set(cacheKey, response.data, ttl)
    }
    
    // Invalidate related cache on mutations
    if (['post', 'put', 'patch', 'delete'].includes(response.config.method || '')) {
      const url = response.config.url || ''
      if (url.includes('checkins')) requestCache.invalidate('checkins')
      if (url.includes('goals')) requestCache.invalidate('goals')
      if (url.includes('commitments')) requestCache.invalidate('commitments')
    }
    
    return response
  },
  async (error: any) => {
    // Handle cached responses
    if (error.__cached) {
      return Promise.resolve({ data: error.data, config: error.config })
    }
    
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    if (!error.response) {
      toast.error('Network Error', 'Please check your internet connection')
      return Promise.reject(error)
    }

    const { status } = error.response

    switch (status) {
      case 401:
        toast.error('Session Expired', 'Please sign in again')
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

// Export cache control
export const cacheControl = {
  clear: () => requestCache.clear(),
  invalidate: (pattern: string) => requestCache.invalidate(pattern)
}


export const apiService = {

  batch: async (requests: Array<() => Promise<any>>) => {
    return Promise.all(requests.map(req => req().catch(e => ({ error: e }))))
  },
  
  user: {
    create: (data: { github_username: string; email?: string }) =>
      api.post('/users', data),
    
    get: (githubUsername: string) =>
      api.get(`/users/${githubUsername}`),
    
    completeOnboarding: (githubUsername: string) =>
      api.patch(`/users/${githubUsername}/complete-onboarding`)
  },

  github: {
    analyze: (githubUsername: string) =>
      api.post(`/analyze-github/${githubUsername}`),
    
    getAnalysis: (githubUsername: string) =>
      api.get(`/github-analysis/${githubUsername}`)
  },

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

  chat: (githubUsername: string, data: {
    message: string
    context?: any
  }) => api.post(`/chat/${githubUsername}`, data),

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

  dashboard: (githubUsername: string) =>
    api.get(`/dashboard/${githubUsername}`),

  advice: (githubUsername: string, limit = 50) =>
    api.get(`/advice/${githubUsername}?limit=${limit}`)
}

export default api