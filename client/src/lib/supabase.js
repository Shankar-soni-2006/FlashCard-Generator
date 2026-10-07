import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Supabase removes the recovery tokens from the URL as soon as it reads them, which can happen before any
// React component mounts. Remember here, before the client starts, that this page load came from a reset link.
export const openedFromRecoveryLink =
  typeof window !== 'undefined' && /type=recovery/.test(window.location.hash + window.location.search)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
