import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { deckService, cardService } from '../services'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { Skeleton } from '../components/common/Skeleton'
import { EmptyState } from '../components/common/EmptyState'
import { Dialog } from '../components/common/Dialog'
import { Input, Textarea } from '../components/common/Input'
import { useToast } from '../components/common/Toast'
import { formatDate } from '../utils/cn'
import { ArrowLeft, Plus, Share2, BookOpen, Pencil, Trash2, Code } from 'lucide-react'

function difficultyVariant(d) {
  if (d === 'easy') return 'success'
  if (d === 'hard') return 'danger'
  if (d === 'medium') return 'warning'
  return 'default'
}

function CardRow({ card, onEdit, onDelete }) {
  return (
    <div className="group flex items-start justify-between py-4 border-b border-[var(--color-border-subtle)]">
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm text-[var(--color-text-primary)]">{card.word || card.question}</p>
        <div className="flex items-center gap-2 mt-1.5">
          {card.tags?.map(t => (
            <span key={t} className="text-xs text-[var(--color-text-muted)]">{t}</span>
          ))}
          <Badge variant={difficultyVariant(card.difficulty)}>{card.difficulty || 'medium'}</Badge>
          {card.code_example && <Code size={11} className="text-[var(--color-text-muted)]" />}
        </div>
        {card.last_reviewed && (
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Last reviewed {formatDate(card.last_reviewed)}</p>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button onClick={() => onEdit(card)} className="p-1.5 rounded hover:bg-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
          <Pencil size={13} />
        </button>
        <button onClick={() => onDelete(card)} className="p-1.5 rounded hover:bg-[var(--color-danger-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

export default function DeckDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [deck, setDeck] = useState(null)
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [editCard, setEditCard] = useState(null)
  const [deleteCard, setDeleteCard] = useState(null)
  const [saving, setSaving] = useState(false)
  const [shareUrl, setShareUrl] = useState('')

  const load = async () => {
    try {
      const [d, c] = await Promise.all([deckService.get(id), cardService.list(id)])
      setDeck(d)
      setCards(c || [])
    } catch {
      toast({ message: 'Failed to load deck.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const saveCard = async () => {
    setSaving(true)
    try {
      const updated = await cardService.update(editCard.id, editCard)
      setCards(c => c.map(x => x.id === updated.id ? updated : x))
      setEditCard(null)
      toast({ message: 'Card updated.', type: 'success' })
    } catch {
      toast({ message: 'Unable to update card.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    try {
      await cardService.delete(deleteCard.id)
      setCards(c => c.filter(x => x.id !== deleteCard.id))
      toast({ message: 'Card deleted.', type: 'success' })
    } catch {
      toast({ message: 'Unable to delete card.', type: 'error' })
    } finally {
      setDeleteCard(null)
    }
  }

  const shareDeck = async () => {
    let url
    try {
      const result = await deckService.share(id)
      url = `${window.location.origin}/shared/${result.share_token}`
    } catch {
      return toast({ message: 'Unable to share deck.', type: 'error' })
    }
    try {
      await navigator.clipboard.writeText(url)
      toast({ message: 'Share link copied.', type: 'success' })
    } catch {
      // Clipboard can be blocked by the browser; show the link so it can be copied manually
      setShareUrl(url)
    }
  }

  if (loading) return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-10 w-full mt-4" />
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
    </div>
  )

  if (!deck) return <p className="text-sm text-[var(--color-text-muted)]">Deck not found.</p>

  return (
    <div className="flex flex-col gap-6">
      <div>
        <button onClick={() => navigate('/decks')} className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors mb-4">
          <ArrowLeft size={13} /> All decks
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">{deck.title}</h1>
            {deck.description && (
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{deck.description}</p>
            )}
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
              {cards.length} cards · {deck.due_count ?? 0} due
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="secondary" size="sm" onClick={shareDeck}>
              <Share2 size={13} /> Share
            </Button>
            <Link to={`/generate`}>
              <Button variant="secondary" size="sm">
                <Plus size={13} /> Add cards
              </Button>
            </Link>
            <Button size="sm" onClick={() => navigate(`/review?deck=${id}`)}>
              <BookOpen size={13} /> Study now
            </Button>
          </div>
        </div>
      </div>

      {cards.length === 0 ? (
        <EmptyState
          title="This deck doesn't have any cards yet."
          action="Generate cards"
          onAction={() => navigate('/generate')}
        />
      ) : (
        <div>
          {cards.map(card => (
            <CardRow key={card.id} card={card} onEdit={setEditCard} onDelete={setDeleteCard} />
          ))}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editCard} onClose={() => setEditCard(null)} title="Edit card" className="max-w-lg">
        {editCard && (
          <div className="flex flex-col gap-4">
            <Input label="Question" value={editCard.question || ''} onChange={e => setEditCard(c => ({ ...c, question: e.target.value }))} />
            <Textarea label="Answer" rows={3} value={editCard.answer || ''} onChange={e => setEditCard(c => ({ ...c, answer: e.target.value }))} />
            <Textarea label="Explanation" rows={2} value={editCard.explanation || ''} onChange={e => setEditCard(c => ({ ...c, explanation: e.target.value }))} />
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" size="sm" onClick={() => setEditCard(null)}>Cancel</Button>
              <Button size="sm" onClick={saveCard} loading={saving}>Save</Button>
            </div>
          </div>
        )}
      </Dialog>

      <Dialog open={!!shareUrl} onClose={() => setShareUrl('')} title="Share deck">
        <p className="text-sm text-[var(--color-text-secondary)] mb-3">Anyone with this link can view the deck.</p>
        <input
          readOnly
          value={shareUrl}
          onFocus={e => e.target.select()}
          className="w-full rounded border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm text-[var(--color-text-primary)]"
        />
        <div className="flex justify-end mt-4">
          <Button size="sm" onClick={() => setShareUrl('')}>Done</Button>
        </div>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteCard} onClose={() => setDeleteCard(null)} title="Delete card">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[var(--color-text-secondary)]">Delete this card? This cannot be undone.</p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" size="sm" onClick={() => setDeleteCard(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={confirmDelete}>Delete</Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
