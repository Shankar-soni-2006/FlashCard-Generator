import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { deckService } from '../services'
import { supabase } from '../lib/supabase'
import { Button } from '../components/common/Button'
import { Input, Select } from '../components/common/Input'
import { Dialog } from '../components/common/Dialog'
import { SegmentedControl } from '../components/common/SegmentedControl'
import { Skeleton } from '../components/common/Skeleton'
import { useToast } from '../components/common/Toast'
import { CARD_COUNT_OPTIONS, DIFFICULTY_OPTIONS, DAILY_NEW_OPTIONS, getSettings } from '../utils/settings'
import { Copy, Download, Link2Off } from 'lucide-react'

function Section({ title, description, children }) {
  return (
    <section className="flex flex-col gap-4 pb-8 border-b border-[var(--color-border-subtle)]">
      <div>
        <h2 className="text-sm font-medium text-[var(--color-text-primary)]">{title}</h2>
        {description && <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{description}</p>}
      </div>
      {children}
    </section>
  )
}

export default function Settings() {
  const { user } = useAuth()
  const { mode, setMode } = useTheme()
  const toast = useToast()

  // Study preferences
  const [prefs, setPrefs] = useState(() => getSettings(user))
  const [savingPrefs, setSavingPrefs] = useState(false)

  // Password (only for accounts that sign in with email and password)
  const canChangePassword = user?.identities?.some(i => i.provider === 'email') ?? false
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  // Export
  const [exporting, setExporting] = useState('')

  // Shared links
  const [shared, setShared] = useState(null)
  const [unshareTarget, setUnshareTarget] = useState(null)

  useEffect(() => {
    deckService.sharedLinks()
      .then(setShared)
      .catch(() => { setShared([]); toast({ message: 'Failed to load shared links.', type: 'error' }) })
  }, [])

  const savePrefs = async () => {
    setSavingPrefs(true)
    const { error } = await supabase.auth.updateUser({ data: { settings: prefs } })
    setSavingPrefs(false)
    if (error) return toast({ message: error.message, type: 'error' })
    toast({ message: 'Preferences saved.', type: 'success' })
  }

  const changePassword = async () => {
    if (password.length < 8) return toast({ message: 'Password must be at least 8 characters.', type: 'error' })
    if (password !== confirmPassword) return toast({ message: 'Passwords do not match.', type: 'error' })
    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password })
    setSavingPassword(false)
    if (error) return toast({ message: error.message, type: 'error' })
    setPassword('')
    setConfirmPassword('')
    toast({ message: 'Password updated.', type: 'success' })
  }

  const exportDecks = async (format) => {
    setExporting(format)
    try {
      await deckService.export(format)
      toast({ message: `Exported your decks as ${format.toUpperCase()}.`, type: 'success' })
    } catch (e) {
      toast({ message: e.message || 'Export failed.', type: 'error' })
    } finally {
      setExporting('')
    }
  }

  const shareUrl = (token) => `${window.location.origin}/shared/${token}`

  const copyLink = async (token) => {
    try {
      await navigator.clipboard.writeText(shareUrl(token))
      toast({ message: 'Link copied.', type: 'success' })
    } catch {
      document.getElementById(`share-${token}`)?.select()
      toast({ message: 'Press Ctrl+C to copy the selected link.', type: 'default' })
    }
  }

  const unshare = async () => {
    const deck = unshareTarget
    try {
      await deckService.unshare(deck.id)
      setShared(list => list.filter(d => d.id !== deck.id))
      toast({ message: `${deck.title} is no longer shared.`, type: 'success' })
    } catch (e) {
      toast({ message: e.message || 'Unable to unshare deck.', type: 'error' })
    } finally {
      setUnshareTarget(null)
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">Settings</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Application preferences.</p>
      </div>

      <Section title="Study" description="Defaults for generating and reviewing flashcards.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Select label="Cards per generation" value={prefs.default_card_count} onChange={e => setPrefs(p => ({ ...p, default_card_count: Number(e.target.value) }))}>
            {CARD_COUNT_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
          </Select>
          <Select label="Default difficulty" value={prefs.default_difficulty} onChange={e => setPrefs(p => ({ ...p, default_difficulty: e.target.value }))}>
            {DIFFICULTY_OPTIONS.map(d => <option key={d} value={d}>{d[0].toUpperCase() + d.slice(1)}</option>)}
          </Select>
          <Select label="New cards per day" value={prefs.daily_new_limit} onChange={e => setPrefs(p => ({ ...p, daily_new_limit: Number(e.target.value) }))}>
            {DAILY_NEW_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
          </Select>
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">
          New cards per day limits how many cards you have never reviewed appear in a review session. Cards that are due always appear.
        </p>
        <Button onClick={savePrefs} loading={savingPrefs} className="self-start">Save preferences</Button>
      </Section>

      <Section title="Appearance" description="Applies to this browser.">
        <SegmentedControl
          options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }, { value: 'system', label: 'System' }]}
          value={mode}
          onChange={setMode}
        />
      </Section>

      <Section title="Password" description={canChangePassword ? 'Choose a new password for your account.' : 'You sign in with Google, so there is no password to change here.'}>
        {canChangePassword && (
          <div className="flex flex-col gap-4 max-w-sm">
            <Input label="New password" type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} />
            <Input label="Confirm new password" type="password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && changePassword()} />
            <Button onClick={changePassword} loading={savingPassword} className="self-start">Update password</Button>
          </div>
        )}
      </Section>

      <Section title="Your data" description="Download all of your decks and cards. Review history is not included.">
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => exportDecks('json')} loading={exporting === 'json'}>
            <Download size={13} /> Export JSON
          </Button>
          <Button variant="secondary" size="sm" onClick={() => exportDecks('csv')} loading={exporting === 'csv'}>
            <Download size={13} /> Export CSV
          </Button>
        </div>
      </Section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-medium text-[var(--color-text-primary)]">Shared links</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Decks anyone with the link can view. Unsharing makes the link stop working.</p>
        </div>
        {shared === null ? (
          <Skeleton className="h-12 w-full" />
        ) : shared.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">You are not sharing any decks.</p>
        ) : (
          <div className="flex flex-col">
            {shared.map(d => (
              <div key={d.id} className="flex flex-col gap-2 py-3 border-b border-[var(--color-border-subtle)]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-[var(--color-text-primary)] truncate">{d.title} <span className="text-[var(--color-text-muted)]">· {d.card_count} cards</span></p>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="secondary" size="sm" onClick={() => copyLink(d.share_token)}><Copy size={13} /> Copy</Button>
                    <Button variant="secondary" size="sm" onClick={() => setUnshareTarget(d)}><Link2Off size={13} /> Unshare</Button>
                  </div>
                </div>
                <input
                  id={`share-${d.share_token}`}
                  readOnly
                  value={shareUrl(d.share_token)}
                  onFocus={e => e.target.select()}
                  className="w-full rounded border border-[var(--color-border)] bg-transparent px-3 py-1.5 text-xs text-[var(--color-text-secondary)]"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <Dialog open={!!unshareTarget} onClose={() => setUnshareTarget(null)} title="Stop sharing deck">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Stop sharing <span className="font-medium text-[var(--color-text-primary)]">{unshareTarget?.title}</span>? The current link will stop working for everyone.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" size="sm" onClick={() => setUnshareTarget(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={unshare}>Unshare</Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
