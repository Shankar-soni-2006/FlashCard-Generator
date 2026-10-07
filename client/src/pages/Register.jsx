import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { postLoginPath } from '../utils/invite'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { ThemeToggle } from '../components/common/ThemeToggle'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) return setError('Passwords do not match.')
    if (form.password.length < 8) return setError('Password must be at least 8 characters.')
    setLoading(true)
    const { error: err } = await signUp(form.email, form.password, form.name)
    setLoading(false)
    if (err) return setError(err.message)
    navigate(postLoginPath())
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="fixed top-4 right-4"><ThemeToggle /></div>
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-widest mb-3">Flashcards</p>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] tracking-tight">Create account</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Start learning smarter today.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Name" type="text" placeholder="Your name" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <Input label="Email" type="email" placeholder="you@example.com" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          <Input label="Password" type="password" placeholder="Min. 8 characters" value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          <Input label="Confirm password" type="password" placeholder="Repeat password" value={form.confirm}
            onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} required />

          {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}

          <Button type="submit" size="lg" loading={loading} className="w-full mt-1">
            Create account
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-[var(--color-text-muted)]">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
