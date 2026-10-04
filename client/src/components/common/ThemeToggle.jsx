import { useTheme } from '../../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle({ className = '' }) {
  const { dark, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200
        border border-[var(--color-border)] bg-[var(--color-surface)]
        hover:bg-[var(--color-border-subtle)] ${className}`}
    >
      <span
        className="absolute transition-all duration-300"
        style={{
          opacity: dark ? 0 : 1,
          transform: dark ? 'rotate(90deg) scale(0.5)' : 'rotate(0deg) scale(1)',
        }}
      >
        <Sun size={14} className="text-[var(--color-text-secondary)]" />
      </span>
      <span
        className="absolute transition-all duration-300"
        style={{
          opacity: dark ? 1 : 0,
          transform: dark ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.5)',
        }}
      >
        <Moon size={14} className="text-[var(--color-text-secondary)]" />
      </span>
    </button>
  )
}
