import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { deckService } from '../services'
import { Badge } from '../components/common/Badge'
import { Skeleton } from '../components/common/Skeleton'

export default function SharedDeck() {
  const { token } = useParams()
  const [deck, setDeck] = useState(null)
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    deckService.getShared(token)
      .then(data => {
        setDeck(data.deck)
        setCards(data.cards || [])
      })
      .catch(() => setError('This deck is not available.'))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
      <div className="w-full max-w-2xl px-6 py-12 flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
      <p className="text-sm text-[var(--color-text-muted)]">{error}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-widest mb-6">Shared deck</p>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">{deck?.title}</h1>
        {deck?.description && (
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{deck.description}</p>
        )}
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">{cards.length} cards</p>

        <div className="mt-8 flex flex-col gap-0">
          {cards.map((card, i) => (
            <div key={card.id || i} className="py-4 border-b border-[var(--color-border-subtle)]">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{card.word || card.question}</p>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">{card.definition || card.answer}</p>
              {card.tags?.length > 0 && (
                <div className="flex gap-1.5 mt-2">
                  {card.tags.map(t => <Badge key={t}>{t}</Badge>)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
