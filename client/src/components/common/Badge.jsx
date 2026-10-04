import { cn } from '../../utils/cn'

const variants = {
  default: 'bg-[var(--color-border-subtle)] text-[var(--color-text-secondary)]',
  success: 'bg-[var(--color-success-subtle)] text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning-subtle)] text-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger-subtle)] text-[var(--color-danger)]',
  accent: 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]',
}

export function Badge({ variant = 'default', className, children }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium uppercase tracking-wide',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}
