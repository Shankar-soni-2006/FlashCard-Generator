import { supabase } from '../config/supabase.js'
import { ok } from '../utils/response.js'

export async function getStatistics(req, res, next) {
  try {
    const userId = req.user.id

    const [
      { count: total_decks },
      { count: total_cards },
      { count: total_reviews },
      { data: progress },
      { data: recentReviews },
    ] = await Promise.all([
      supabase.from('decks').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('cards').select('*, decks!inner(user_id)', { count: 'exact', head: true }).eq('decks.user_id', userId),
      supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('card_progress').select('*').eq('user_id', userId),
      supabase.from('reviews').select('rating, reviewed_at').eq('user_id', userId).order('reviewed_at', { ascending: false }).limit(500),
    ])

    const now = new Date()
    const cards_due = (progress || []).filter(p => new Date(p.due_date) <= now).length
    const cards_mastered = (progress || []).filter(p => p.interval >= 21).length
    const cards_reviewed = (progress || []).filter(p => p.last_reviewed).length

    // Accuracy
    const goodEasy = (recentReviews || []).filter(r => r.rating === 'good' || r.rating === 'easy').length
    const accuracy = recentReviews?.length > 0 ? Math.round((goodEasy / recentReviews.length) * 100) : 0

    // Streak — count consecutive days with at least one review
    const reviewDays = new Set((recentReviews || []).map(r => r.reviewed_at?.slice(0, 10)))
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      if (reviewDays.has(d.toISOString().slice(0, 10))) streak++
      else break
    }

    // Reviews per day (last 14 days)
    const reviews_per_day = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      const count = (recentReviews || []).filter(r => r.reviewed_at?.slice(0, 10) === dateStr).length
      reviews_per_day.push({ date: dateStr.slice(5), count })
    }

    // Rating distribution
    const rating_distribution = { again: 0, hard: 0, good: 0, easy: 0 }
    ;(recentReviews || []).forEach(r => { if (rating_distribution[r.rating] !== undefined) rating_distribution[r.rating]++ })

    ok(res, {
      total_decks: total_decks ?? 0,
      total_cards: total_cards ?? 0,
      total_reviews: total_reviews ?? 0,
      cards_due,
      cards_mastered,
      cards_reviewed,
      accuracy,
      streak,
      reviews_per_day,
      rating_distribution,
    })
  } catch (e) { next(e) }
}
