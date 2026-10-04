import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { deckService } from '../services'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { Dialog } from '../components/common/Dialog'
import { EmptyState } from '../components/common/EmptyState'
import { Skeleton } from '../components/common/Skeleton'
import { useToast } from '../components/common/Toast'
import { formatDate } from '../utils/cn'
import { Plus, MoreHorizontal, Pencil, Trash2, Share2, BookOpen } from 'lucide-react'

function DeckMenu({ deck, onEdit, onDelete, onShare }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={e => { e.preventDefault(); setOpen(v => !v) }}
        className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)] transition-colors opacity-0 group-hover:opacity-100"
      >
        <MoreHorizontal size={14} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-7 z-20 w-40 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-md py-1">
            {[
              { icon: BookOpen, label: 'Study', action: () => { onEdit('study'); setOpen(false) } },
              { icon: Pencil, label: 'Edit', action: () => { onEdit('edit'); setOpen(false) } },
              { icon: Share2, label: 'Share', action: () => { onShare(); setOpen(false) } },
              { icon: Trash2, label: 'Delete', action: () => { onDelete(); setOpen(false) }, danger: true },
            ].map(({ icon: Icon, label, action, danger }) => (
              <button
                key={label}
                onClick={action}
                className={`flex items-center gap-2.5 w-full px-3 py-2 text-xs transition-colors ${danger ? 'text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)]'}`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function Decks() {
  const [decks, setDecks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [newDeckName, setNewDeckName] = useState('')
  const [creating, setCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const navigate = useNavigate()
  const toast = useToast()

  const load = () => {
    setLoading(true)
    deckService.list()
      .then(d => setDecks(d || []))
      .catch(() => toast({ message: 'Failed to load decks.', type: 'error' }))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = decks.filter(d => d.title.toLowerCase().includes(search.toLowerCase()))

  const createDeck = async () => {
    if (!newDeckName.trim()) return
    setCreating(true)
    try {
      const deck = await deckService.create({ title: newDeckName, deck_type: 'topic', description: '' })
      setCreateOpen(false)
      setNewDeckName('')
      navigate(`/decks/${deck.id}`)
    } catch {
      toast({ message: 'Unable to create deck.', type: 'error' })
    } finally {
      setCreating(false)
    }
  }

  const deleteDeck = async () => {
    try {
      await deckService.delete(deleteTarget.id)
      setDecks(d => d.filter(x => x.id !== deleteTarget.id))
      toast({ message: 'Deck deleted.', type: 'success' })
    } catch {
      toast({ message: 'Unable to delete deck.', type: 'error' })
    } finally {
      setDeleteTarget(null)
    }
  }

  const shareDeck = async (deck) => {
    try {
      const result = await deckService.share(deck.id)
      const url = `${window.location.origin}/shared/${result.share_token}`
      await navigator.clipboard.writeText(url)
      toast({ message: 'Share link copied to clipboard.', type: 'success' })
    } catch {
      toast({ message: 'Unable to share deck.', type: 'error' })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">My decks</h1>
        <Button size="md" onClick={() => setCreateOpen(true)}>
          <Plus size={14} /> New deck
        </Button>
      </div>

      <Input
        placeholder="Search decks..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={search ? 'No decks match your search.' : "You don't have any decks yet."}
          description={!search ? 'Create your first AI-powered deck.' : undefined}
          action={!search ? 'Create deck' : undefined}
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <div>
          {/* Table header */}
          <div className="grid grid-cols-[1fr_80px_60px_80px_32px] gap-4 px-2 py-2 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide border-b border-[var(--color-border)]">
            <span>Name</span>
            <span className="text-right">Cards</span>
            <span className="text-right">Due</span>
            <span className="text-right">Updated</span>
            <span />
          </div>

          {filtered.map(deck => (
            <Link
              key={deck.id}
              to={`/decks/${deck.id}`}
              className="group grid grid-cols-[1fr_80px_60px_80px_32px] gap-4 items-center px-2 py-3 border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-border-subtle)] rounded transition-colors"
            >
              <span className="text-sm text-[var(--color-text-primary)] truncate">{deck.title}</span>
              <span className="text-sm text-[var(--color-text-muted)] text-right">{deck.card_count ?? 0}</span>
              <span className={`text-sm text-right font-medium ${deck.due_count > 0 ? 'text-[var(--color-warning)]' : 'text-[var(--color-text-muted)]'}`}>
                {deck.due_count ?? 0}
              </span>
              <span className="text-xs text-[var(--color-text-muted)] text-right">{formatDate(deck.updated_at)}</span>
              <DeckMenu
                deck={deck}
                onEdit={(action) => action === 'study' ? navigate(`/review?deck=${deck.id}`) : navigate(`/decks/${deck.id}`)}
                onDelete={() => setDeleteTarget(deck)}
                onShare={() => shareDeck(deck)}
              />
            </Link>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="New deck">
        <div className="flex flex-col gap-4">
          <Input
            label="Deck name"
            placeholder="e.g. DBMS Fundamentals"
            value={newDeckName}
            onChange={e => setNewDeckName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createDeck()}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={createDeck} loading={creating}>Create</Button>
          </div>
        </div>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete deck">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Delete <span className="font-medium text-[var(--color-text-primary)]">{deleteTarget?.title}</span>? This cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={deleteDeck}>Delete</Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
