import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { groupService, deckService } from '../services'
import { Button } from '../components/common/Button'
import { Dialog } from '../components/common/Dialog'
import { Badge } from '../components/common/Badge'
import { Skeleton } from '../components/common/Skeleton'
import { useToast } from '../components/common/Toast'
import { SegmentedControl } from '../components/common/SegmentedControl'
import { ArrowLeft, Copy, Plus, RefreshCw, Trash2, UserMinus, LogOut, Trophy } from 'lucide-react'

export default function GroupDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [myDecks, setMyDecks] = useState([])
  const [confirm, setConfirm] = useState(null) // { title, body, action, label }
  const [period, setPeriod] = useState('week')
  const [board, setBoard] = useState(null)

  const load = () =>
    groupService.get(id)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [id])

  useEffect(() => {
    setBoard(null)
    groupService.leaderboard(id, period)
      .then(setBoard)
      .catch(() => setBoard({ entries: [], points: null, error: true }))
  }, [id, period, data?.members?.length])

  const isOwner = data?.role === 'owner'
  const inviteUrl = data ? `${window.location.origin}/join/${data.group.invite_token}` : ''

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      toast({ message: 'Invite link copied.', type: 'success' })
    } catch {
      // Clipboard can be blocked; select the field so it can be copied manually
      document.getElementById('invite-url')?.select()
      toast({ message: 'Press Ctrl+C to copy the selected link.', type: 'default' })
    }
  }

  const resetInvite = async () => {
    const { invite_token } = await groupService.regenerateInvite(id)
    setData(d => ({ ...d, group: { ...d.group, invite_token } }))
  }

  const openAddDeck = async () => {
    setAddOpen(true)
    try { setMyDecks(await deckService.list() || []) } catch { toast({ message: 'Failed to load your decks.', type: 'error' }) }
  }

  const addDeck = async (deck) => {
    try {
      await groupService.addDeck(id, deck.id)
      toast({ message: `Added ${deck.title}.`, type: 'success' })
      await load()
    } catch (e) {
      toast({ message: e.message || 'Unable to add deck.', type: 'error' })
    }
  }

  const run = async (fn, successMessage, after) => {
    try {
      await fn()
      toast({ message: successMessage, type: 'success' })
      after ? after() : await load()
    } catch (e) {
      toast({ message: e.message || 'Something went wrong.', type: 'error' })
    } finally {
      setConfirm(null)
    }
  }

  if (loading) return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-full mt-4" />
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
    </div>
  )

  if (!data) return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-[var(--color-text-muted)]">Group not found, or you are not a member.</p>
      <Link to="/groups" className="text-sm text-[var(--color-text-secondary)] underline">Back to groups</Link>
    </div>
  )

  const { group, members, decks } = data
  let copied
  const groupDeckIds = new Set(decks.map(d => d.id))
  const addable = myDecks.filter(d => !groupDeckIds.has(d.id))

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link to="/groups" className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] mb-4">
          <ArrowLeft size={12} /> All groups
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">{group.name}</h1>
            {group.description && <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{group.description}</p>}
          </div>
          {isOwner ? (
            <Button variant="danger" size="sm" onClick={() => setConfirm({
              title: 'Delete group',
              body: `Delete ${group.name}? All members will lose access. Decks stay in their owners' accounts.`,
              label: 'Delete',
              action: () => run(() => groupService.delete(id), 'Group deleted.', () => navigate('/groups')),
            })}>
              <Trash2 size={13} /> Delete group
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setConfirm({
              title: 'Leave group',
              body: `Leave ${group.name}? Decks you added will be removed from the group.`,
              label: 'Leave',
              action: () => run(() => groupService.removeMember(id, members.find(m => m.is_you).user_id), 'You left the group.', () => navigate('/groups')),
            })}>
              <LogOut size={13} /> Leave
            </Button>
          )}
        </div>
      </div>

      {/* Invite */}
      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Invite link</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">Anyone with this link can join after logging in.</p>
        <div className="flex gap-2">
          <input
            id="invite-url"
            readOnly
            value={inviteUrl}
            onFocus={e => e.target.select()}
            className="flex-1 min-w-0 rounded border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm text-[var(--color-text-primary)]"
          />
          <Button variant="secondary" size="md" onClick={copyInvite}><Copy size={13} /> Copy</Button>
          {isOwner && (
            <Button variant="secondary" size="md" onClick={() => setConfirm({
              title: 'Reset invite link',
              body: 'The current link will stop working. Existing members stay in the group.',
              label: 'Reset',
              action: () => run(resetInvite, 'Invite link reset. The old link no longer works.', () => {}),
            })}>
              <RefreshCw size={13} /> Reset
            </Button>
          )}
        </div>
      </section>

      {/* Leaderboard */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
            <Trophy size={13} /> Leaderboard
          </h2>
          <SegmentedControl
            options={[{ value: 'week', label: 'This week' }, { value: 'all', label: 'All time' }]}
            value={period}
            onChange={setPeriod}
          />
        </div>
        {!board ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-11 w-full" />)}
          </div>
        ) : board.error ? (
          <p className="py-4 text-sm text-[var(--color-text-muted)]">Unable to load the leaderboard.</p>
        ) : (
          <div>
            {board.entries.map(e => (
              <div
                key={e.user_id}
                className={`flex items-center gap-4 px-2 py-3 border-b border-[var(--color-border-subtle)] ${e.is_you ? 'bg-[var(--color-border-subtle)] rounded' : ''}`}
              >
                <span className={`w-6 text-sm font-semibold tabular-nums ${e.rank === 1 && e.xp > 0 ? 'text-[var(--color-warning)]' : 'text-[var(--color-text-muted)]'}`}>
                  {e.rank}
                </span>
                <p className="flex-1 min-w-0 text-sm text-[var(--color-text-primary)] truncate">
                  {e.name}{e.is_you && <span className="text-[var(--color-text-muted)]"> (you)</span>}
                </p>
                <span className="text-xs text-[var(--color-text-muted)] shrink-0">{e.reviews} {e.reviews === 1 ? 'review' : 'reviews'}</span>
                <span className="w-20 text-right text-sm font-medium text-[var(--color-text-primary)] tabular-nums shrink-0">{e.xp} XP</span>
              </div>
            ))}
            {board.points && (
              <p className="mt-3 text-xs text-[var(--color-text-muted)]">
                Earn XP by studying this group's decks: Again {board.points.again} · Hard {board.points.hard} · Good {board.points.good} · Easy {board.points.easy}.
                Each card counts once per day.
              </p>
            )}
          </div>
        )}
      </section>

      {/* Decks */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Decks · {decks.length}</h2>
          <Button size="sm" onClick={openAddDeck}><Plus size={13} /> Add deck</Button>
        </div>
        {decks.length === 0 ? (
          <p className="py-6 text-sm text-[var(--color-text-muted)]">No decks shared yet. Add one of your decks for the group to study.</p>
        ) : (
          <div>
            {decks.map(d => (
              <div key={d.id} className="group flex items-center justify-between gap-4 px-2 py-3 border-b border-[var(--color-border-subtle)]">
                <Link to={`/groups/${id}/decks/${d.id}`} className="min-w-0 flex-1">
                  <p className="text-sm text-[var(--color-text-primary)] truncate">{d.title}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{d.card_count} cards · added by {d.added_by_name}</p>
                </Link>
                {!d.is_own && (
                  <button
                    title="Copy to my decks"
                    onClick={() => run(
                      async () => { copied = await groupService.copyDeck(id, d.id) },
                      `Copied ${d.title} to your decks.`,
                      () => navigate(`/decks/${copied.id}`)
                    )}
                    className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    <Copy size={14} />
                  </button>
                )}
                {d.can_remove && (
                  <button
                    title="Remove from group"
                    onClick={() => run(() => groupService.removeDeck(id, d.id), 'Deck removed from group.')}
                    className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Members */}
      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Members · {members.length}</h2>
        <div>
          {members.map(m => (
            <div key={m.user_id} className="flex items-center justify-between gap-4 px-2 py-3 border-b border-[var(--color-border-subtle)]">
              <p className="text-sm text-[var(--color-text-primary)] truncate">
                {m.name}{m.is_you && <span className="text-[var(--color-text-muted)]"> (you)</span>}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                {m.role === 'owner' && <Badge variant="accent">Owner</Badge>}
                {isOwner && m.role !== 'owner' && (
                  <button
                    title="Remove member"
                    onClick={() => setConfirm({
                      title: 'Remove member',
                      body: `Remove ${m.name} from the group?`,
                      label: 'Remove',
                      action: () => run(() => groupService.removeMember(id, m.user_id), 'Member removed.'),
                    })}
                    className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors"
                  >
                    <UserMinus size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Add deck */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} title="Add a deck to the group">
        {addable.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            {myDecks.length === 0 ? 'You have no decks yet.' : 'All your decks are already in this group.'}
          </p>
        ) : (
          <div className="flex flex-col max-h-72 overflow-y-auto">
            {addable.map(d => (
              <button
                key={d.id}
                onClick={() => addDeck(d)}
                className="flex items-center justify-between gap-3 px-2 py-2.5 text-left rounded hover:bg-[var(--color-border-subtle)] transition-colors"
              >
                <span className="text-sm text-[var(--color-text-primary)] truncate">{d.title}</span>
                <span className="text-xs text-[var(--color-text-muted)] shrink-0">{d.card_count ?? 0} cards</span>
              </button>
            ))}
          </div>
        )}
        <div className="flex justify-end mt-4">
          <Button variant="secondary" size="sm" onClick={() => setAddOpen(false)}>Done</Button>
        </div>
      </Dialog>

      {/* Confirm */}
      <Dialog open={!!confirm} onClose={() => setConfirm(null)} title={confirm?.title}>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[var(--color-text-secondary)]">{confirm?.body}</p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" size="sm" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={confirm?.action}>{confirm?.label}</Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
