import { cn } from '../../utils/cn'

export function Skeleton({ className }) {
  return (
    <div className={cn('animate-pulse rounded bg-[var(--color-border-subtle)]', className)} />
  )
}
