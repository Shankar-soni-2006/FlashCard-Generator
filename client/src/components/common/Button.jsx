import { cn } from '../../utils/cn'

const variants = {
  primary: 'bg-[var(--color-text-primary)] text-[var(--color-bg)] hover:opacity-85',
  secondary: 'bg-transparent border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)]',
  ghost: 'bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)]',
  danger: 'bg-[var(--color-danger)] text-white hover:opacity-85',
  success: 'bg-[var(--color-success)] text-white hover:opacity-85',
}

const sizes = {
  sm: 'h-7 px-3 text-xs',
  md: 'h-8 px-4 text-sm',
  lg: 'h-10 px-5 text-sm',
}

export function Button({ variant = 'primary', size = 'md', className, children, loading, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}
