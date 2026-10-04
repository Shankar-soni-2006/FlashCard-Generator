import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { deckService, reviewService } from '../services'
import { Button } from '../components/common/Button'
import { Skeleton } from '../components/common/Skeleton'
import { formatDate } from '../utils/cn'
import { ArrowRight, BookOpen, Layers, Sparkles, FileText, Image, Code, BookMarked } from 'lucide-react'

function MetricItem({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">{value}</span>
      <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
    </div>
  )
}

function DeckRow({ deck }) {
  return (
    <Link
      to={`/decks/${deck.id}`}
      className="flex items-center justify-between py-3 border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-border-subtle)] -mx-2 px-2 rounded transition-colors group"
    >
      <span className="text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
        {deck.title}
      </span>
      <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
        <span>{deck.card_count ?? 0} cards</span>
        {deck.due_count > 0 && (
          <span className="text-[var(--color-warning)] font-medium">{deck.due_count} due</span>
        )}
      </div>
    </Link>
  )
}

const quickCreate = [
  { label: 'Topic', icon: Sparkles, to: '/generate?mode=topic' },
  { label: 'Notes', icon: FileText, to: '/generate?mode=notes' },
  { label: 'Programming', icon: Code, to: '/generate?mode=programming' },
  { label: 'Vocabulary', icon: BookMarked, to: '/generate?mode=vocabulary' },
  { label: 'Image', icon: Image, to: '/generate?mode=image' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [decks, setDecks] = useState([])
  const [dueCount, setDueCount] = useState(0)
  const [stats, setStats] = useState({ total_cards: 0, reviewed_today: 0, streak: 0, accuracy: 0 })
  const [loading, setLoading] = useState(true)

  const displayName = user?.user_metadata?.name?.split(' ')[0] || 'there'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    Promise.all([deckService.list(), reviewService.getDue()])
      .then(([d, due]) => {
        setDecks(d || [])
        setDueCount(due?.length || 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          {greeting}, {displayName}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {dueCount > 0 ? 'Your learning queue is ready.' : "You're all caught up for today."}
        </p>
      </div>

      {/* Review CTA */}
      {loading ? (
        <Skeleton className="h-24 w-full" />
      ) : dueCount > 0 ? (
        <div className="border border-[var(--color-border)] rounded-lg p-6 flex items-center justify-between">
          <div>
            <span className="text-4xl font-semibold tracking-tight text-[var(--color-text-primary)]">{dueCount}</span>
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">cards due for review</p>
          </div>
          <Button size="lg" onClick={() => navigate('/review')}>
            Start review <ArrowRight size={14} />
          </Button>
        </div>
      ) : (
        <div className="border border-[var(--color-border)] rounded-lg p-6">
          <p className="text-sm font-medium text-[var(--color-text-primary)]">All caught up</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">No cards are due for review right now.</p>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-4 border-y border-[var(--color-border-subtle)]">
        <MetricItem label="Total decks" value={loading ? '—' : decks.length} />
        <MetricItem label="Cards due" value={loading ? '—' : dueCount} />
        <MetricItem label="Streak" value={loading ? '—' : `${stats.streak}d`} />
        <MetricItem label="Accuracy" value={loading ? '—' : `${stats.accuracy}%`} />
      </div>

      {/* Quick Create */}
      <div>
        <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-widest mb-3">Quick create</p>
        <div className="flex flex-wrap gap-2">
          {quickCreate.map(({ label, icon: Icon, to }) => (
            <Link
              key={label}
              to={to}
              className="flex items-center gap-2 px-3 py-2 rounded border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-muted)] transition-colors"
            >
              <Icon size={13} strokeWidth={1.75} />
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Decks */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-widest">My decks</p>
          <Link to="/decks" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2 mt-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : decks.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-[var(--color-text-muted)]">No decks yet.</p>
            <Link to="/generate" className="mt-2 inline-block text-xs text-[var(--color-accent)] hover:underline">
              Generate your first deck →
            </Link>
          </div>
        ) : (
          <div className="mt-1">
            {decks.slice(0, 6).map(deck => <DeckRow key={deck.id} deck={deck} />)}
          </div>
        )}
      </div>
    </div>
  )
}
