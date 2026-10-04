import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ThemeToggle } from '../../components/common/ThemeToggle'

export function LegalLayout({ title, lastUpdated, children }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Minimal header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-border)]
        bg-[var(--color-surface)]/90 backdrop-blur-md px-6 h-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]
          hover:text-[var(--color-text-primary)] transition-colors">
          <ArrowLeft size={13} />
          Flashcards
        </Link>
        <ThemeToggle />
      </header>

      <main className="pt-20 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">{title}</h1>
          {lastUpdated && (
            <p className="text-xs text-[var(--color-text-muted)] mt-2">Last updated: {lastUpdated}</p>
          )}
          <div className="mt-10 flex flex-col gap-8 text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

export function Section({ title, children }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-[var(--color-text-primary)]">{title}</h2>
      <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed flex flex-col gap-2">
        {children}
      </div>
    </div>
  )
}
