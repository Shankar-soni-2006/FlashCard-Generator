import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { groupService } from '../services'
import { AppLayout } from '../components/common/AppLayout'
import { Button } from '../components/common/Button'
import { Skeleton } from '../components/common/Skeleton'
import { useToast } from '../components/common/Toast'
import { setPendingInvite, clearPendingInvite } from '../utils/invite'
import { Users } from 'lucide-react'

function JoinContent({ token }) {
  const [invite, setInvite] = useState(null)
  const [error, setError] = useState('')
  const [joining, setJoining] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    // The invite stays remembered until the user joins or declines, so leaving this page
    // without clicking Join does not lose it (the app shows a banner until it is resolved)
    setPendingInvite(token)
    groupService.previewInvite(token)
      .then(data => {
        if (data.already_member) clearPendingInvite()
        setInvite(data)
      })
      .catch(e => {
        clearPendingInvite() // invalid or reset links cannot be joined later either
        setError(e.message || 'This invite link is invalid.')
      })
  }, [token])

  const join = async () => {
    setJoining(true)
    try {
      const group = await groupService.join(token)
      clearPendingInvite()
      toast({ message: `You joined ${group.name}.`, type: 'success' })
      navigate(`/groups/${group.id}`, { replace: true })
    } catch (e) {
      toast({ message: e.message || 'Unable to join group.', type: 'error' })
      setJoining(false)
    }
  }

  if (error) return (
    <div className="max-w-md mx-auto py-16 text-center">
      <p className="text-sm font-medium text-[var(--color-text-primary)]">Invite not available</p>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">{error}</p>
      <Link to="/groups"><Button variant="secondary" className="mt-5">Go to groups</Button></Link>
    </div>
  )

  if (!invite) return (
    <div className="max-w-md mx-auto py-16 flex flex-col gap-3">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-10 w-32 mt-4" />
    </div>
  )

  return (
    <div className="max-w-md mx-auto py-16">
      <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-widest mb-4">Group invite</p>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">{invite.name}</h1>
      {invite.description && <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{invite.description}</p>}
      <p className="mt-3 flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
        <Users size={13} /> {invite.member_count} {invite.member_count === 1 ? 'member' : 'members'} · created by {invite.owner_name}
      </p>
      <div className="mt-8 flex gap-2">
        {invite.already_member ? (
          <Button onClick={() => navigate(`/groups/${invite.id}`, { replace: true })}>Open group</Button>
        ) : (
          <>
            <Button onClick={join} loading={joining}>Join group</Button>
            <Link to="/groups" onClick={clearPendingInvite}><Button variant="secondary">Not now</Button></Link>
          </>
        )}
      </div>
    </div>
  )
}

export default function JoinGroup() {
  const { token } = useParams()
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <span className="w-5 h-5 border-2 border-[var(--color-border)] border-t-[var(--color-text-primary)] rounded-full animate-spin" />
    </div>
  )

  if (!user) {
    // Remember the invite so login/register can bring the user straight back here
    setPendingInvite(token)
    return <Navigate to="/login" replace />
  }

  return <AppLayout><JoinContent token={token} /></AppLayout>
}
