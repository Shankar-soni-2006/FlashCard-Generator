import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { ThemeToggle } from '../components/common/ThemeToggle'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await resetPassword(email.trim())
    setLoading(false)
    if (err) return setError(err.message)
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="fixed top-4 right-4"><ThemeToggle /></div>
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-widest mb-3">Flashcards</p>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] tracking-tight">Reset your password</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Enter your email and we will send you a link to choose a new password.
          </p>
        </div>

        {sent ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[var(--color-text-primary)]">
              If an account exists for <span className="font-medium">{email}</span>, a reset link is on its way. Check your inbox and spam folder.
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              Signed up with Google? Use "Continue with Google" on the login page instead. There is no password to reset.
            </p>
            <Button variant="secondary" size="lg" className="w-full" onClick={() => setSent(false)}>
              Use a different email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
              required
            />
            {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
            <Button type="submit" size="lg" loading={loading} className="w-full mt-1">
              Send reset link
            </Button>
          </form>
        )}

        <div className="mt-5 text-xs text-[var(--color-text-muted)]">
          <Link to="/login" className="hover:text-[var(--color-text-primary)] transition-colors">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
