import { supabase } from '../config/supabase.js'
import { ok, fail } from '../utils/response.js'

export async function listCards(req, res, next) {
  try {
    // Verify deck ownership
    const { data: deck } = await supabase
      .from('decks').select('id').eq('id', req.params.deckId).eq('user_id', req.user.id).single()
    if (!deck) return fail(res, 'Deck not found.', 404)

    const { data, error } = await supabase
      .from('cards')
      .select('*, card_progress(due_date, last_reviewed, ease_factor, interval, repetitions)')
      .eq('deck_id', req.params.deckId)
      .order('created_at', { ascending: true })
    if (error) throw error

    const cards = (data || []).map(c => ({
      ...c,
      last_reviewed: c.card_progress?.[0]?.last_reviewed ?? null,
      card_progress: undefined,
    }))
    ok(res, cards)
  } catch (e) { next(e) }
}

export async function createCard(req, res, next) {
  try {
    const { data: deck } = await supabase
      .from('decks').select('id').eq('id', req.params.deckId).eq('user_id', req.user.id).single()
    if (!deck) return fail(res, 'Deck not found.', 404)

    const { data, error } = await supabase
      .from('cards')
      .insert({ ...req.body, deck_id: req.params.deckId })
      .select()
      .single()
    if (error) throw error
    ok(res, data)
  } catch (e) { next(e) }
}

export async function updateCard(req, res, next) {
  try {
    // Verify ownership via deck
    const { data: card } = await supabase
      .from('cards').select('id, deck_id').eq('id', req.params.cardId).single()
    if (!card) return fail(res, 'Card not found.', 404)

    const { data: deck } = await supabase
      .from('decks').select('id').eq('id', card.deck_id).eq('user_id', req.user.id).single()
    if (!deck) return fail(res, 'Unauthorized.', 403)

    const { data, error } = await supabase
      .from('cards')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.cardId)
      .select()
      .single()
    if (error) throw error
    ok(res, data)
  } catch (e) { next(e) }
}

export async function deleteCard(req, res, next) {
  try {
    const { data: card } = await supabase
      .from('cards').select('id, deck_id').eq('id', req.params.cardId).single()
    if (!card) return fail(res, 'Card not found.', 404)

    const { data: deck } = await supabase
      .from('decks').select('id').eq('id', card.deck_id).eq('user_id', req.user.id).single()
    if (!deck) return fail(res, 'Unauthorized.', 403)

    const { error } = await supabase.from('cards').delete().eq('id', req.params.cardId)
    if (error) throw error
    ok(res, { deleted: true })
  } catch (e) { next(e) }
}
