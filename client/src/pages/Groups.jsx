import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { groupService } from '../services'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { Dialog } from '../components/common/Dialog'
import { EmptyState } from '../components/common/EmptyState'
import { Skeleton } from '../components/common/Skeleton'
import { Badge } from '../components/common/Badge'
import { useToast } from '../components/common/Toast'
import { Plus, Users } from 'lucide-react'

export default function Groups() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    groupService.list()
      .then(g => setGroups(g || []))
      .catch(() => toast({ message: 'Failed to load groups.', type: 'error' }))
      .finally(() => setLoading(false))
  }, [])

  const createGroup = async () => {
    if (!name.trim()) return
    setCreating(true)
    try {
      const group = await groupService.create({ name, description })
      setCreateOpen(false)
      setName('')
      setDescription('')
      navigate(`/groups/${group.id}`)
    } catch (e) {
      toast({ message: e.message || 'Unable to create group.', type: 'error' })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">Groups</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Study together. Create a group and share an invite link.</p>
        </div>
        <Button size="md" onClick={() => setCreateOpen(true)}>
          <Plus size={14} /> New group
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          title="You're not in any groups yet."
          description="Create a group and invite friends, or open an invite link someone sent you."
          action="Create group"
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <div>
          {groups.map(g => (
            <Link
              key={g.id}
              to={`/groups/${g.id}`}
              className="flex items-center justify-between gap-4 px-2 py-3.5 border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-border-subtle)] rounded transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm text-[var(--color-text-primary)] truncate">{g.name}</p>
                {g.description && <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">{g.description}</p>}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {g.role === 'owner' && <Badge variant="accent">Owner</Badge>}
                <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                  <Users size={13} /> {g.member_count}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="New group">
        <div className="flex flex-col gap-4">
          <Input
            label="Group name"
            placeholder="e.g. DBMS Exam Prep"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createGroup()}
            maxLength={80}
            autoFocus
          />
          <Input
            label="Description (optional)"
            placeholder="What is this group for?"
            value={description}
            onChange={e => setDescription(e.target.value)}
            maxLength={300}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={createGroup} loading={creating}>Create</Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
