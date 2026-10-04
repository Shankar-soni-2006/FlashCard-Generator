import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { useToast } from '../components/common/Toast'
import { supabase } from '../lib/supabase'

export default function Profile() {
  const { user } = useAuth()
  const toast = useToast()
  const [name, setName] = useState(user?.user_metadata?.name || '')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ data: { name } })
    setSaving(false)
    if (error) return toast({ message: error.message, type: 'error' })
    toast({ message: 'Profile updated.', type: 'success' })
  }

  return (
    <div className="flex flex-col gap-8 max-w-sm">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">Profile</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Manage your account details.</p>
      </div>

      <div className="flex flex-col gap-4">
        <Input label="Name" value={name} onChange={e => setName(e.target.value)} />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">Email</label>
          <p className="text-sm text-[var(--color-text-muted)]">{user?.email}</p>
        </div>
        <Button onClick={save} loading={saving} className="self-start">Save changes</Button>
      </div>
    </div>
  )
}
