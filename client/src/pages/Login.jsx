import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { postLoginPath } from '../utils/invite'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { ThemeToggle } from '../components/common/ThemeToggle'

export default function Login() {
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await signIn(form.email, form.password)
    setLoading(false)
    if (err) return setError(err.message)
    navigate(postLoginPath())
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    await signInWithGoogle()
    setGoogleLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="fixed top-4 right-4"><ThemeToggle /></div>
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-widest mb-3">Flashcards</p>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Continue your learning journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            required
          />

          {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}

          <Button type="submit" size="lg" loading={loading} className="w-full mt-1">
            Continue
          </Button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[var(--color-border)]" />
          <span className="text-xs text-[var(--color-text-muted)]">or</span>
          <div className="flex-1 h-px bg-[var(--color-border)]" />
        </div>

        <Button variant="secondary" size="lg" className="w-full" onClick={handleGoogle} loading={googleLoading}>
          Continue with Google
        </Button>

        <div className="mt-5 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
          <Link to="/forgot-password" className="hover:text-[var(--color-text-primary)] transition-colors">
            Forgot password?
          </Link>
          <Link to="/register" className="hover:text-[var(--color-text-primary)] transition-colors">
            Create account
          </Link>
        </div>
      </div>
    </div>
  )
}
