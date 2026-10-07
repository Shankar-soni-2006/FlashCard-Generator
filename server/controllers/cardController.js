import { supabase } from '../config/supabase.js'
import { ok, fail } from '../utils/response.js'

// Only these columns may be set by clients. Anything else (id, deck_id, timestamps...) is ignored,
// so a request can never move a card into another deck or overwrite protected fields.
const TEXT_FIELDS = [
  'question', 'answer', 'explanation', 'code_example', 'code_language', 'word', 'definition',
  'part_of_speech', 'pronunciation', 'example_sentence', 'source_type',
]
const LIST_FIELDS = ['synonyms', 'antonyms', 'tags']
const DIFFICULTIES = ['easy', 'medium', 'hard']

function pickCardFields(body = {}) {
  const out = {}
  for (const f of TEXT_FIELDS) {
    if (typeof body[f] === 'string') out[f] = body[f].trim().slice(0, 5000)
    else if (body[f] === null) out[f] = null
  }
  for (const f of LIST_FIELDS) {
    if (Array.isArray(body[f])) out[f] = body[f].slice(0, 30).map(v => String(v).slice(0, 100))
  }
  if (DIFFICULTIES.includes(body.difficulty)) out.difficulty = body.difficulty
  return out
}

// A card needs a question and answer, or a vocabulary word and definition
const hasContent = (c) => !!((c.question && c.answer) || (c.word && c.definition))

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

    const fields = pickCardFields(req.body)
    if (!hasContent(fields)) return fail(res, 'A card needs a question and an answer (or a word and a definition).')

    const { data, error } = await supabase
      .from('cards')
      .insert({ ...fields, deck_id: req.params.deckId })
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
      .from('cards').select('id, deck_id, question, answer, word, definition').eq('id', req.params.cardId).single()
    if (!card) return fail(res, 'Card not found.', 404)

    const { data: deck } = await supabase
      .from('decks').select('id').eq('id', card.deck_id).eq('user_id', req.user.id).single()
    if (!deck) return fail(res, 'Unauthorized.', 403)

    const fields = pickCardFields(req.body)
    if (!Object.keys(fields).length) return fail(res, 'Nothing to update.')
    if (!hasContent({ ...card, ...fields })) return fail(res, 'A card needs a question and an answer (or a word and a definition).')

    const { data, error } = await supabase
      .from('cards')
      .update({ ...fields, updated_at: new Date().toISOString() })
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
