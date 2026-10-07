import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { groupService } from '../services'
import { Badge } from '../components/common/Badge'
import { Skeleton } from '../components/common/Skeleton'
import { ArrowLeft } from 'lucide-react'

export default function GroupDeck() {
  const { id, deckId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [revealed, setRevealed] = useState({})

  useEffect(() => {
    groupService.getDeck(id, deckId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [id, deckId])

  if (loading) return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-48" />
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
    </div>
  )

  if (!data) return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-[var(--color-text-muted)]">Deck not available.</p>
      <Link to={`/groups/${id}`} className="text-sm text-[var(--color-text-secondary)] underline">Back to group</Link>
    </div>
  )

  const { deck, cards } = data

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link to={`/groups/${id}`} className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] mb-4">
          <ArrowLeft size={12} /> Back to group
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">{deck.title}</h1>
        {deck.description && <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{deck.description}</p>}
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">{cards.length} cards · view only</p>
      </div>

      <div>
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => setRevealed(r => ({ ...r, [card.id]: !r[card.id] }))}
            className="block w-full text-left py-4 border-b border-[var(--color-border-subtle)]"
          >
            <p className="text-sm font-medium text-[var(--color-text-primary)]">{card.word || card.question}</p>
            {revealed[card.id] ? (
              <div className="mt-1">
                <p className="text-sm text-[var(--color-text-secondary)]">{card.definition || card.answer}</p>
                {card.explanation && <p className="text-xs text-[var(--color-text-muted)] mt-1.5">{card.explanation}</p>}
                {card.code_example && (
                  <pre className="mt-2 p-3 rounded bg-[var(--color-border-subtle)] text-xs overflow-x-auto text-[var(--color-text-primary)]"><code>{card.code_example}</code></pre>
                )}
              </div>
            ) : (
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">Click to reveal answer</p>
            )}
            {Array.isArray(card.tags) && card.tags.length > 0 && (
              <div className="flex gap-1.5 mt-2">
                {card.tags.map(t => <Badge key={t}>{t}</Badge>)}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
