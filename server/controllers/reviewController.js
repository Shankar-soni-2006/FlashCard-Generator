import { supabase } from '../config/supabase.js'
import { sm2 } from '../services/scheduler/sm2.js'
import { ok, fail } from '../utils/response.js'
import { getStudyableDeckIds, canStudyCard } from '../services/access/access.js'

export async function getDueCards(req, res, next) {
  try {
    const deckId = req.query.deck || null

    // Cards the user has reviewed before whose due date has arrived
    const { data: progress, error } = await supabase
      .from('card_progress')
      .select('*, cards(*)')
      .eq('user_id', req.user.id)
      .lte('due_date', new Date().toISOString())
      .order('due_date', { ascending: true })
    if (error) throw error

    // Every card the user has ever reviewed, due or not. Only cards with no progress at all are new.
    const { data: allProgress } = await supabase
      .from('card_progress')
      .select('card_id')
      .eq('user_id', req.user.id)
    const reviewedIds = new Set((allProgress || []).map(p => p.card_id))

    let newCardsQuery = supabase
      .from('cards')
      .select('*, decks!inner(user_id)')
      .eq('decks.user_id', req.user.id)
    if (deckId) newCardsQuery = newCardsQuery.eq('deck_id', deckId)
    const { data: allCards } = await newCardsQuery
    const newCards = (allCards || []).filter(c => !reviewedIds.has(c.id))

    // Progress can exist for cards in group decks; drop any the user can no longer access (e.g. after leaving a group)
    const studyable = await getStudyableDeckIds(req.user.id)
    const dueFromProgress = (progress || [])
      .filter(p => p.cards && studyable.has(p.cards.deck_id) && (!deckId || p.cards.deck_id === deckId))
      .map(p => ({ ...p.cards, deck_id: p.cards.deck_id }))
    // Daily new-card limit (user setting, default 50), minus new cards already started today (UTC day)
    const setting = Number(req.user.user_metadata?.settings?.daily_new_limit)
    const dailyLimit = Number.isFinite(setting) && setting >= 0 ? Math.min(Math.floor(setting), 500) : 50
    const startOfDay = new Date()
    startOfDay.setUTCHours(0, 0, 0, 0)
    const { count: startedToday } = await supabase
      .from('card_progress').select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id).gte('created_at', startOfDay.toISOString())
    const newAllowance = Math.max(0, dailyLimit - (startedToday || 0))
    const queue = [...dueFromProgress, ...newCards.slice(0, newAllowance)]

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
    const { error: reviewError } = await supabase.from('reviews').insert({
      user_id: req.user.id,
      card_id: cardId,
      rating,
      previous_interval: existing?.interval ?? 0,
      new_interval: newProgress.interval,
      previous_ease_factor: existing?.ease_factor ?? 2.5,
      new_ease_factor: newProgress.ease_factor,
    })
    // The review row is what earns XP, so a failed insert must not look like success
    if (reviewError) throw reviewError

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
