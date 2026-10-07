import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, openedFromRecoveryLink } from '../lib/supabase'
import { useToast } from '../components/common/Toast'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { ThemeToggle } from '../components/common/ThemeToggle'

// Opened from the link in the reset email. Supabase puts a temporary recovery session in the URL;
// once it is detected the user can choose a new password.
export default function ResetPassword() {
  const navigate = useNavigate()
  const toast = useToast()
  const [status, setStatus] = useState('checking') // checking | ready | invalid
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let settled = false
    const ready = () => { settled = true; setStatus('ready') }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') ready()
    })

    // The recovery event may already have fired before this page mounted
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && openedFromRecoveryLink) ready()
    })

    const timer = setTimeout(() => { if (!settled) setStatus('invalid') }, 4000)
    return () => { subscription.unsubscribe(); clearTimeout(timer) }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (password !== confirm) return setError('Passwords do not match.')
    setSaving(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    setSaving(false)
    if (err) return setError(err.message)
    toast({ message: 'Password updated. You are signed in.', type: 'success' })
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="fixed top-4 right-4"><ThemeToggle /></div>
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-widest mb-3">Flashcards</p>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] tracking-tight">Choose a new password</h1>
        </div>

        {status === 'checking' && (
          <p className="text-sm text-[var(--color-text-muted)]">Checking your reset link...</p>
        )}

        {status === 'invalid' && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[var(--color-text-primary)]">
              This reset link is invalid or has expired. Reset links can only be used once.
            </p>
            <Link to="/forgot-password">
              <Button size="lg" className="w-full">Request a new link</Button>
            </Link>
          </div>
        )}

        {status === 'ready' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="New password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
              required
            />
            <Input
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
            {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
            <Button type="submit" size="lg" loading={saving} className="w-full mt-1">
              Update password
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
