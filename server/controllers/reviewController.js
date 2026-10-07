import { supabase } from '../config/supabase.js'
import { sm2 } from '../services/scheduler/sm2.js'
import { ok, fail } from '../utils/response.js'
import { getStudyableDeckIds, canStudyCard } from '../services/access/access.js'

export async function getDueCards(req, res, next) {
  try {
    // Get all card_progress for user where due_date <= now
    const { data: progress, error } = await supabase
      .from('card_progress')
      .select('*, cards(*)')
      .eq('user_id', req.user.id)
      .lte('due_date', new Date().toISOString())
      .order('due_date', { ascending: true })
    if (error) throw error

    // Also include cards with no progress record (never reviewed)
    const { data: allCards } = await supabase
      .from('cards')
      .select('*, decks!inner(user_id)')
      .eq('decks.user_id', req.user.id)

    const reviewedIds = new Set((progress || []).map(p => p.card_id))
    const newCards = (allCards || []).filter(c => !reviewedIds.has(c.id))

    // Progress can exist for cards in group decks; drop any the user can no longer access (e.g. after leaving a group)
    const studyable = await getStudyableDeckIds(req.user.id)
    const dueFromProgress = (progress || [])
      .filter(p => p.cards && studyable.has(p.cards.deck_id))
      .map(p => ({ ...p.cards, deck_id: p.cards.deck_id }))
    const queue = [...dueFromProgress, ...newCards.slice(0, 50)]

    ok(res, queue)
  } catch (e) { next(e) }
}

export async function submitRating(req, res, next) {
  try {
    const { rating } = req.body
    const { cardId } = req.params
    if (!['again', 'hard', 'good', 'easy'].includes(rating)) {
      return fail(res, 'Invalid rating.')
    }

    if (!(await canStudyCard(req.user.id, cardId))) return fail(res, 'Card not found.', 404)

    // Get existing progress
    const { data: existing } = await supabase
      .from('card_progress')
      .select('*')
      .eq('card_id', cardId)
      .eq('user_id', req.user.id)
      .single()

    const newProgress = sm2(existing || {}, rating)

    // Upsert card_progress
    const progressData = {
      user_id: req.user.id,
      card_id: cardId,
      ...newProgress,
      [`${rating}_count`]: (existing?.[`${rating}_count`] || 0) + 1,
    }

    const { error: upsertError } = await supabase
      .from('card_progress')
      .upsert(progressData, { onConflict: 'user_id,card_id' })
    if (upsertError) throw upsertError

    // Insert review history
    await supabase.from('reviews').insert({
      user_id: req.user.id,
      card_id: cardId,
      rating,
      previous_interval: existing?.interval ?? 0,
      new_interval: newProgress.interval,
      previous_ease_factor: existing?.ease_factor ?? 2.5,
      new_ease_factor: newProgress.ease_factor,
    })

    ok(res, { ...newProgress, rating })
  } catch (e) { next(e) }
}

export async function getHistory(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, cards(question, deck_id)')
      .eq('user_id', req.user.id)
      .order('reviewed_at', { ascending: false })
      .limit(100)
    if (error) throw error
    ok(res, data || [])
  } catch (e) { next(e) }
}
