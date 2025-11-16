'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  description?: string
}

let addToastFn: ((toast: Omit<Toast, 'id'>) => void) | null = null

export const toast = {
  success: (message: string, description?: string) => {
    addToastFn?.({ type: 'success', message, description })
  },
  error: (message: string, description?: string) => {
    addToastFn?.({ type: 'error', message, description })
  },
  warning: (message: string, description?: string) => {
    addToastFn?.({ type: 'warning', message, description })
  },
  info: (message: string, description?: string) => {
    addToastFn?.({ type: 'info', message, description })
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    addToastFn = (toast: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substr(2, 9)
      setToasts(prev => [...prev, { ...toast, id }])
      setTimeout(() => removeToast(id), 5000)
    }
    return () => { addToastFn = null }
  }, [])

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const getIcon = (type: ToastType) => {
    const icons = {
      success: <CheckCircle className="w-5 h-5" />,
      error: <XCircle className="w-5 h-5" />,
      warning: <AlertCircle className="w-5 h-5" />,
      info: <Info className="w-5 h-5" />
    }
    return icons[type]
  }

  const getStyles = (type: ToastType) => {
    const styles = {
      success: 'bg-green-900/40 border-green-500/40 text-green-300',
      error: 'bg-red-900/40 border-red-500/40 text-red-300',
      warning: 'bg-yellow-900/40 border-yellow-500/40 text-yellow-300',
      info: 'bg-blue-900/40 border-blue-500/40 text-blue-300'
    }
    return styles[type]
  }

  return (
    <>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2 max-w-md w-full pointer-events-none px-4">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`${getStyles(toast.type)} border rounded-xl p-4 shadow-lg animate-in slide-in-from-right pointer-events-auto`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(toast.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{toast.message}</p>
                {toast.description && (
                  <p className="text-xs mt-1 opacity-90">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 opacity-70 hover:opacity-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}