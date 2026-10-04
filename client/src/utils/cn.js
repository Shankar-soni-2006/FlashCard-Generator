import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date) {
  if (!date) return '—'
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  if (diff < 86400000) return 'Today'
  if (diff < 172800000) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatRelative(date) {
  if (!date) return '—'
  const d = new Date(date)
  const now = new Date()
  const diff = d - now
  if (diff < 0) return 'Overdue'
  if (diff < 86400000) return 'Today'
  if (diff < 172800000) return 'Tomorrow'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
