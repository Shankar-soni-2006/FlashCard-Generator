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

const EXPORT_CARD_FIELDS = [
  'question', 'answer', 'explanation', 'code_example', 'code_language', 'word', 'definition',
  'part_of_speech', 'pronunciation', 'example_sentence', 'synonyms', 'antonyms', 'difficulty', 'tags', 'source_type',
]

const csvCell = (v) => {
  if (v === null || v === undefined) return ''
  const s = Array.isArray(v) ? v.join('; ') : String(v)
  // Prefix formula-looking text so spreadsheets do not execute it
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

// All of the user's decks and cards, as JSON or CSV (?format=json|csv)
export async function exportDecks(req, res, next) {
  try {
    const { data: decks, error } = await supabase
      .from('decks').select('id, title, description, deck_type, created_at')
      .eq('user_id', req.user.id).order('created_at')
    if (error) throw error

    const ids = (decks || []).map(d => d.id)
    const cardsByDeck = {}
    if (ids.length) {
      const { data: cards, error: cardError } = await supabase
        .from('cards').select(['deck_id', ...EXPORT_CARD_FIELDS].join(', ')).in('deck_id', ids).order('created_at')
      if (cardError) throw cardError
      ;(cards || []).forEach(c => { (cardsByDeck[c.deck_id] ||= []).push(c) })
    }

    const stamp = new Date().toISOString().slice(0, 10)
    if (req.query.format === 'csv') {
      const header = ['deck', ...EXPORT_CARD_FIELDS]
      const rows = [header.join(',')]
      for (const d of decks) {
        for (const c of cardsByDeck[d.id] || []) {
          rows.push([d.title, ...EXPORT_CARD_FIELDS.map(f => c[f])].map(csvCell).join(','))
        }
      }
      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="flashcards-${stamp}.csv"`)
      return res.send('﻿' + rows.join('\r\n'))
    }

    const payload = {
      exported_at: new Date().toISOString(),
      decks: decks.map(d => ({
        title: d.title,
        description: d.description,
        deck_type: d.deck_type,
        created_at: d.created_at,
        cards: (cardsByDeck[d.id] || []).map(({ deck_id, ...card }) => card),
      })),
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="flashcards-${stamp}.json"`)
    res.send(JSON.stringify(payload, null, 2))
  } catch (e) { next(e) }
}

// Decks the user currently shares through a public link
export async function listSharedDecks(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('decks').select('id, title, share_token, updated_at, cards(count)')
      .eq('user_id', req.user.id).eq('visibility', 'public').not('share_token', 'is', null)
      .order('updated_at', { ascending: false })
    if (error) throw error
    ok(res, (data || []).map(d => ({
      id: d.id, title: d.title, share_token: d.share_token, card_count: d.cards?.[0]?.count ?? 0,
    })))
  } catch (e) { next(e) }
}

export async function unshareDeck(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('decks').update({ visibility: 'private', share_token: null })
      .eq('id', req.params.id).eq('user_id', req.user.id).select('id')
    if (error) throw error
    if (!data?.length) return fail(res, 'Deck not found.', 404)
    ok(res, { unshared: true })
  } catch (e) { next(e) }
}
