import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

/**
 * Toast types and their visual styles
 */
const TOAST_STYLES = {
  success: {
    bg: 'bg-brand-teal',
    border: 'border-brand-teal/30',
    icon: CheckCircle,
    iconColor: 'text-white'
  },
  error: {
    bg: 'bg-brand-cardinal',
    border: 'border-brand-cardinal/30',
    icon: AlertCircle,
    iconColor: 'text-white'
  },
  warning: {
    bg: 'bg-amber-500',
    border: 'border-amber-400/30',
    icon: AlertCircle,
    iconColor: 'text-white'
  },
  info: {
    bg: 'bg-blue-500',
    border: 'border-blue-400/30',
    icon: Info,
    iconColor: 'text-white'
  }
}

const TOAST_DURATION = 5000 // 5 seconds

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = TOAST_DURATION) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type, duration }])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Convenience methods
  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration),
    dismiss: removeToast,
    dismissAll: () => setToasts([])
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function Toast({ toast, onDismiss }) {
  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info
  const Icon = style.icon

  useEffect(() => {
    const timer = setTimeout(onDismiss, toast.duration || TOAST_DURATION)
    return () => clearTimeout(timer)
  }, [toast.duration, onDismiss])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`${style.bg} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[280px] max-w-md pointer-events-auto border ${style.border}`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${style.iconColor}`} />
      <span className="font-body text-sm flex-1">{toast.message}</span>
      <button
        onClick={onDismiss}
        className="text-white/70 hover:text-white transition-colors flex-shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

/**
 * Hook to use toast notifications
 *
 * @example
 * const toast = useToast()
 * toast.success('Profile updated!')
 * toast.error('Failed to save changes')
 * toast.warning('Your session is about to expire')
 * toast.info('New features available')
 */
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export default ToastContext
