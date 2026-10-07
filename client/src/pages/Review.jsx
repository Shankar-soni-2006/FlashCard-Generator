import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { reviewService, deckService, groupService } from '../services'
import { Button } from '../components/common/Button'
import { Skeleton } from '../components/common/Skeleton'
import { useToast } from '../components/common/Toast'
import { ArrowLeft } from 'lucide-react'

const RATINGS = [
  { key: 'again', label: 'Again', shortcut: '1', color: 'text-[var(--color-danger)]', hover: 'hover:bg-[var(--color-danger-subtle)]' },
  { key: 'hard',  label: 'Hard',  shortcut: '2', color: 'text-[var(--color-warning)]', hover: 'hover:bg-[var(--color-warning-subtle)]' },
  { key: 'good',  label: 'Good',  shortcut: '3', color: 'text-[var(--color-text-primary)]', hover: 'hover:bg-[var(--color-border-subtle)]' },
  { key: 'easy',  label: 'Easy',  shortcut: '4', color: 'text-[var(--color-success)]', hover: 'hover:bg-[var(--color-success-subtle)]' },
]

function FlashCard({ card, revealed, onReveal }) {
  const isVocab = !!card.word
  const hasCode = !!card.code_example

  return (
    <div className="card-flip-container w-full" style={{ height: '340px' }}>
      <div className={`card-flip-inner${revealed ? ' flipped' : ''}`}>
        {/* Front */}
        <div className="card-face flex flex-col border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] p-8">
          {card.tags?.length > 0 && (
            <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-widest mb-6">
              {card.tags.join(' · ')}
            </p>
          )}
          <div className="flex-1 flex items-center justify-center">
            {isVocab ? (
              <div className="text-center">
                <p className="text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">{card.word}</p>
                {card.part_of_speech && (
                  <p className="text-sm text-[var(--color-text-muted)] mt-1 italic">{card.part_of_speech}</p>
                )}
              </div>
            ) : (
              <p className="text-lg font-medium text-[var(--color-text-primary)] text-center leading-relaxed">
                {card.question}
              </p>
            )}
          </div>
          <div className="mt-6 pt-5 border-t border-[var(--color-border-subtle)] flex justify-center">
            <button
              onClick={onReveal}
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              Show answer{' '}
              <kbd className="ml-1 px-1.5 py-0.5 rounded border border-[var(--color-border)] font-mono text-xs opacity-50">
                Space
              </kbd>
            </button>
          </div>
        </div>

        {/* Back */}
        <div className="card-face card-face-back flex flex-col border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] p-8 overflow-y-auto">
          {card.tags?.length > 0 && (
            <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-widest mb-4">
              {card.tags.join(' · ')}
            </p>
          )}
          {isVocab ? (
            <div className="flex flex-col gap-3">
              <p className="text-xl font-semibold text-[var(--color-text-primary)]">{card.word}</p>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{card.definition}</p>
              {card.example_sentence && (
                <p className="text-sm text-[var(--color-text-muted)] italic">"{card.example_sentence}"</p>
              )}
              {card.synonyms?.length > 0 && (
                <p className="text-xs text-[var(--color-text-muted)]">
                  <span className="uppercase tracking-wide">synonyms</span>
                  {' · '}{card.synonyms.join(' · ')}
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{card.question}</p>
              <div className="h-px bg-[var(--color-border-subtle)]" />
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{card.answer}</p>
              {card.explanation && (
                <>
                  <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Explanation</p>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{card.explanation}</p>
                </>
              )}
              {hasCode && (
                <pre className="p-3 rounded bg-[var(--color-border-subtle)] text-xs font-mono overflow-x-auto leading-relaxed">
                  {card.code_example}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ReviewComplete({ stats, onBack, backLabel = 'Back to dashboard' }) {
  const total = stats.again + stats.hard + stats.good + stats.easy
  const accuracy = total > 0 ? Math.round(((stats.good + stats.easy) / total) * 100) : 0

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-8">
      <div>
        <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-widest mb-4">
          Review complete.
        </p>
        <p className="text-5xl font-semibold tracking-tight text-[var(--color-text-primary)]">{total}</p>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">cards reviewed</p>
      </div>

      <div>
        <p className="text-5xl font-semibold tracking-tight text-[var(--color-text-primary)]">{accuracy}%</p>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">accuracy</p>
      </div>

      <div className="flex flex-col gap-2 w-36">
        {RATINGS.map(r => (
          <div key={r.key} className="flex items-center justify-between text-sm">
            <span className={r.color}>{r.label}</span>
            <span className="text-[var(--color-text-muted)] font-mono tabular-nums">{stats[r.key]}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-1">
        <p className="text-xs text-[var(--color-text-muted)]">Next review</p>
        <p className="text-sm text-[var(--color-text-secondary)]">Tomorrow</p>
      </div>

      <Button onClick={onBack}>{backLabel}</Button>
    </div>
  )
}

export default function Review() {
  const [searchParams] = useSearchParams()
  const deckId = searchParams.get('deck')
  const groupId = searchParams.get('group')
  const backPath = groupId ? `/groups/${groupId}` : '/dashboard'
  const backLabel = groupId ? 'Back to group' : 'Back to dashboard'
  const navigate = useNavigate()
  const toast = useToast()

  const [queue, setQueue] = useState([])
  const [current, setCurrent] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [deckTitle, setDeckTitle] = useState('')
  const [stats, setStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 })

  useEffect(() => {
    const load = async () => {
      try {
        if (groupId && deckId) {
          const study = await groupService.studyQueue(groupId, deckId)
          setDeckTitle(study.deck?.title || '')
          setQueue(study.cards || [])
          return
        }
        const due = await reviewService.getDue(deckId)
        let cards = due || []
        if (deckId) {
          const deck = await deckService.get(deckId)
          setDeckTitle(deck?.title || '')
        }
        setQueue(cards)
      } catch {
        toast({ message: 'Failed to load review queue.', type: 'error' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [deckId, groupId])

  const handleReveal = useCallback(() => setRevealed(true), [])

  const handleRate = useCallback(async (rating) => {
    if (submitting) return
    setSubmitting(true)
    try {
      await reviewService.submitRating(queue[current].id, rating)
      setStats(s => ({ ...s, [rating]: s[rating] + 1 }))
      if (current + 1 >= queue.length) {
        setDone(true)
      } else {
        setCurrent(c => c + 1)
        setRevealed(false)
      }
    } catch {
      toast({ message: 'Failed to save rating.', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }, [current, queue, submitting])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === ' ' && !revealed) { e.preventDefault(); handleReveal() }
      if (revealed && !submitting) {
        if (e.key === '1') handleRate('again')
        if (e.key === '2') handleRate('hard')
        if (e.key === '3') handleRate('good')
        if (e.key === '4') handleRate('easy')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [revealed, submitting, handleReveal, handleRate])

  if (loading) return (
    <div className="flex flex-col gap-4 max-w-xl mx-auto">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-80 w-full" />
    </div>
  )

  if (done) return <ReviewComplete stats={stats} backLabel={backLabel} onBack={() => navigate(backPath)} />

  if (queue.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
      <p className="text-sm font-medium text-[var(--color-text-primary)]">You're all caught up!</p>
      <p className="text-sm text-[var(--color-text-muted)]">No cards are due for review.</p>
      <Button variant="secondary" onClick={() => navigate(backPath)}>{backLabel}</Button>
    </div>
  )

  const card = queue[current]
  const progress = (current / queue.length) * 100

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">{deckTitle || 'Review'}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5 font-mono">
            {String(current + 1).padStart(2, '0')} / {String(queue.length).padStart(2, '0')}
          </p>
        </div>
        <Link
          to={backPath}
          className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ArrowLeft size={13} /> Exit
        </Link>
      </div>

      {/* Progress bar */}
      <div className="h-px w-full bg-[var(--color-border-subtle)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--color-text-primary)] rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Card */}
      <FlashCard card={card} revealed={revealed} onReveal={handleReveal} />

      {/* Rating buttons */}
      {revealed && (
        <div className="grid grid-cols-4 gap-2">
          {RATINGS.map(r => (
            <button
              key={r.key}
              onClick={() => handleRate(r.key)}
              disabled={submitting}
              className={`flex flex-col items-center gap-1 py-3 rounded border border-[var(--color-border)] ${r.hover} transition-colors disabled:opacity-40 cursor-pointer`}
            >
              <span className={`text-sm font-medium ${r.color}`}>{r.label}</span>
              <span className="text-xs text-[var(--color-text-muted)]">{r.shortcut}</span>
            </button>
          ))}
        </div>
      )}

      {!revealed && (
        <p className="text-center text-xs text-[var(--color-text-muted)]">
          Press{' '}
          <kbd className="px-1.5 py-0.5 rounded border border-[var(--color-border)] font-mono text-xs">Space</kbd>
          {' '}to reveal · Rate with{' '}
          <kbd className="px-1 py-0.5 rounded border border-[var(--color-border)] font-mono text-xs">1</kbd>
          –
          <kbd className="px-1 py-0.5 rounded border border-[var(--color-border)] font-mono text-xs">4</kbd>
        </p>
      )}
    </div>
  )
}
