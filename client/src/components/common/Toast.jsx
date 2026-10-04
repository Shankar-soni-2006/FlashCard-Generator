import { createContext, useCallback, useContext, useState } from 'react'
import { cn } from '../../utils/cn'
import { X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(({ message, type = 'default', duration = 3500 }) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  const dismiss = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-center gap-3 rounded border px-4 py-3 text-sm shadow-sm min-w-64 max-w-sm',
              t.type === 'success' && 'bg-[var(--color-success-subtle)] border-[var(--color-success)] text-[var(--color-success)]',
              t.type === 'error' && 'bg-[var(--color-danger-subtle)] border-[var(--color-danger)] text-[var(--color-danger)]',
              t.type === 'default' && 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-primary)]',
            )}
          >
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="text-current opacity-50 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
