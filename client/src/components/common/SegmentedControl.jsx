import { cn } from '../../utils/cn'

export function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded border border-[var(--color-border)] bg-[var(--color-border-subtle)] p-0.5 gap-0.5">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded transition-all duration-150',
            value === opt.value
              ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
