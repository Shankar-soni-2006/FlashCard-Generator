import { supabase } from '../../config/supabase.js'

// XP per review. Even a missed card earns a little, so effort counts.
export const POINTS = { again: 2, hard: 5, good: 10, easy: 15 }

const PAGE = 1000
const MAX_ROWS = 50000

// Returns { [userId]: { xp, reviews } } for the given users.
// Only the first review of a card on a given day earns XP, so re-reviewing the same card can't be farmed.
export async function getXp(userIds, since = null) {
  const totals = Object.fromEntries(userIds.map(id => [id, { xp: 0, reviews: 0 }]))
  if (!userIds.length) return totals

  const seen = new Set()
  for (let from = 0; from < MAX_ROWS; from += PAGE) {
    let query = supabase
      .from('reviews')
      .select('user_id, card_id, rating, reviewed_at')
      .in('user_id', userIds)
      .order('reviewed_at', { ascending: true })
      .range(from, from + PAGE - 1)
    if (since) query = query.gte('reviewed_at', since.toISOString())
    const { data, error } = await query
    if (error) throw error

    for (const r of data) {
      const key = `${r.user_id}:${r.card_id}:${r.reviewed_at.slice(0, 10)}`
      if (seen.has(key)) continue
      seen.add(key)
      totals[r.user_id].xp += POINTS[r.rating] ?? 0
      totals[r.user_id].reviews += 1
    }
    if (data.length < PAGE) break
  }
  return totals
}
