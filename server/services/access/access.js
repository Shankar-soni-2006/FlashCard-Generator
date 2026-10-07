import { supabase } from '../../config/supabase.js'

// Ids of decks the user may study: their own plus decks shared into groups they belong to.
export async function getStudyableDeckIds(userId) {
  const { data: own } = await supabase.from('decks').select('id').eq('user_id', userId)
  const ids = new Set((own || []).map(d => d.id))

  const { data: memberships } = await supabase.from('group_members').select('group_id').eq('user_id', userId)
  const groupIds = (memberships || []).map(m => m.group_id)
  if (groupIds.length) {
    const { data: shared } = await supabase.from('group_decks').select('deck_id').in('group_id', groupIds)
    ;(shared || []).forEach(d => ids.add(d.deck_id))
  }
  return ids
}

export async function canStudyCard(userId, cardId) {
  const { data: card } = await supabase.from('cards').select('deck_id').eq('id', cardId).maybeSingle()
  if (!card) return false
  const ids = await getStudyableDeckIds(userId)
  return ids.has(card.deck_id)
}
