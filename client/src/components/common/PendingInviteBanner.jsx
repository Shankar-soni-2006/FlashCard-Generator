import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { groupService } from '../../services'
import { getPendingInvite, clearPendingInvite } from '../../utils/invite'
import { Button } from './Button'
import { useToast } from './Toast'
import { Users } from 'lucide-react'

// Shown while a group invite the user opened has not been accepted or declined yet,
// so a forgotten "Join" click never means asking for the link again.
export function PendingInviteBanner() {
  const [token, setToken] = useState(() => getPendingInvite())
  const [invite, setInvite] = useState(null)
  const [joining, setJoining] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const toast = useToast()
  const onJoinPage = pathname.startsWith('/join/')

  useEffect(() => {
    if (!token || onJoinPage) return
    let cancelled = false
    groupService.previewInvite(token)
      .then(data => {
        if (cancelled) return
        if (data.already_member) { clearPendingInvite(); setToken(null) }
        else setInvite(data)
      })
      .catch(() => { if (!cancelled) { clearPendingInvite(); setToken(null) } }) // invalid or reset link
    return () => { cancelled = true }
  }, [token, onJoinPage])

  if (!token || !invite || onJoinPage) return null

  const dismiss = () => { clearPendingInvite(); setToken(null) }

  const join = async () => {
    setJoining(true)
    try {
      const group = await groupService.join(token)
      clearPendingInvite()
      setToken(null)
      toast({ message: `You joined ${group.name}.`, type: 'success' })
      navigate(`/groups/${group.id}`)
    } catch (e) {
      toast({ message: e.message || 'Unable to join group.', type: 'error' })
      setJoining(false)
    }
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
      <p className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
        <Users size={14} className="text-[var(--color-text-muted)]" />
        You were invited to <span className="font-medium">{invite.name}</span>
      </p>
      <div className="flex gap-2">
        <Button size="sm" onClick={join} loading={joining}>Join group</Button>
        <Button size="sm" variant="secondary" onClick={dismiss}>Dismiss</Button>
      </div>
    </div>
  )
}
