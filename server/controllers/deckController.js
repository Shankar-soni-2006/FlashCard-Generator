import { supabase } from '../config/supabase.js'
import { ok, fail } from '../utils/response.js'
import { randomUUID } from 'crypto'

export async function listDecks(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('decks')
      .select('*, cards(count)')
      .eq('user_id', req.user.id)
      .order('updated_at', { ascending: false })
    if (error) throw error

    const deckIds = (data || []).map(d => d.id)
    let dueCounts = {}
    if (deckIds.length > 0) {
      const { data: progress } = await supabase
        .from('card_progress')
        .select('card_id, due_date, cards(deck_id)')
        .eq('user_id', req.user.id)
        .lte('due_date', new Date().toISOString())
      ;(progress || []).forEach(p => {
        const deckId = p.cards?.deck_id
        if (deckId) dueCounts[deckId] = (dueCounts[deckId] || 0) + 1
      })
    }

    const decks = (data || []).map(d => ({
      ...d,
      card_count: d.cards?.[0]?.count ?? 0,
      due_count: dueCounts[d.id] || 0,
      cards: undefined,
    }))
    ok(res, decks)
  } catch (e) { next(e) }
}

export async function getDeck(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('decks')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single()
    if (error || !data) return fail(res, 'Deck not found.', 404)
    ok(res, data)
  } catch (e) { next(e) }
}

export async function createDeck(req, res, next) {
  try {
    const { title, description, deck_type } = req.body
    if (!title?.trim()) return fail(res, 'Title is required.')
    const { data, error } = await supabase
      .from('decks')
      .insert({ title, description, deck_type: deck_type || 'topic', user_id: req.user.id, visibility: 'private' })
      .select()
      .single()
    if (error) throw error
    ok(res, data)
  } catch (e) { next(e) }
}

export async function updateDeck(req, res, next) {
  try {
    const { title, description } = req.body
    const { data, error } = await supabase
      .from('decks')
      .update({ title, description, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single()
    if (error || !data) return fail(res, 'Deck not found.', 404)
    ok(res, data)
  } catch (e) { next(e) }
}

export async function deleteDeck(req, res, next) {
  try {
    const { error } = await supabase
      .from('decks')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
    if (error) throw error
    ok(res, { deleted: true })
  } catch (e) { next(e) }
}

export async function shareDeck(req, res, next) {
  try {
    // Reuse an existing token so previously shared links keep working
    const { data: existing } = await supabase
      .from('decks').select('share_token')
      .eq('id', req.params.id).eq('user_id', req.user.id).maybeSingle()
    const share_token = existing?.share_token || randomUUID()
    const { data, error } = await supabase
      .from('decks')
      .update({ visibility: 'public', share_token })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single()
    if (error || !data) return fail(res, 'Deck not found.', 404)
    ok(res, { share_token })
  } catch (e) { next(e) }
}

export async function getSharedDeck(req, res, next) {
  try {
    const { data: deck, error } = await supabase
      .from('decks')
      .select('id, title, description, deck_type, updated_at')
      .eq('share_token', req.params.token)
      .eq('visibility', 'public')
      .single()
    if (error || !deck) return fail(res, 'Deck not found.', 404)
    const { data: cards } = await supabase.from('cards').select('*').eq('deck_id', deck.id)
    ok(res, { deck, cards: cards || [] })
  } catch (e) { next(e) }
}
