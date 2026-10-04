import { Button } from './Button'

export function EmptyState({ title, description, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-sm font-medium text-[var(--color-text-primary)]">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-[var(--color-text-muted)] max-w-xs">{description}</p>
      )}
      {action && (
        <Button className="mt-5" onClick={onAction}>{action}</Button>
      )}
    </div>
  )
}
