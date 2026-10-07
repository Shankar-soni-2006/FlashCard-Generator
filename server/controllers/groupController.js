import { randomBytes } from 'crypto'
import { supabase } from '../config/supabase.js'
import { ok, fail } from '../utils/response.js'

const newInviteToken = () => randomBytes(16).toString('hex')

async function getMembership(groupId, userId) {
  const { data } = await supabase
    .from('group_members').select('role')
    .eq('group_id', groupId).eq('user_id', userId).maybeSingle()
  return data
}

const displayName = (profile, fallback) => profile?.name || profile?.email?.split('@')[0] || fallback

export async function listGroups(req, res, next) {
  try {
    const { data: mine, error } = await supabase
      .from('group_members')
      .select('role, groups(id, name, description, created_at)')
      .eq('user_id', req.user.id)
    if (error) throw error

    const groups = (mine || []).filter(m => m.groups)
    const ids = groups.map(m => m.groups.id)
    const counts = {}
    if (ids.length) {
      const { data: all } = await supabase.from('group_members').select('group_id').in('group_id', ids)
      ;(all || []).forEach(r => { counts[r.group_id] = (counts[r.group_id] || 0) + 1 })
    }
    ok(res, groups
      .map(m => ({ ...m.groups, role: m.role, member_count: counts[m.groups.id] || 1 }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
  } catch (e) { next(e) }
}

export async function createGroup(req, res, next) {
  try {
    const name = req.body.name?.trim()
    if (!name) return fail(res, 'Group name is required.')
    if (name.length > 80) return fail(res, 'Group name must be 80 characters or fewer.')
    const description = req.body.description?.trim().slice(0, 300) || null

    const { data: group, error } = await supabase
      .from('groups')
      .insert({ owner_id: req.user.id, name, description, invite_token: newInviteToken() })
      .select().single()
    if (error) throw error

    const { error: memberError } = await supabase
      .from('group_members').insert({ group_id: group.id, user_id: req.user.id, role: 'owner' })
    if (memberError) {
      await supabase.from('groups').delete().eq('id', group.id)
      throw memberError
    }
    ok(res, { ...group, role: 'owner', member_count: 1 })
  } catch (e) { next(e) }
}

export async function getGroup(req, res, next) {
  try {
    const membership = await getMembership(req.params.id, req.user.id)
    if (!membership) return fail(res, 'Group not found.', 404)

    const { data: group, error } = await supabase
      .from('groups').select('id, name, description, invite_token, created_at')
      .eq('id', req.params.id).single()
    if (error || !group) return fail(res, 'Group not found.', 404)

    const { data: memberRows } = await supabase
      .from('group_members').select('user_id, role, joined_at, profiles(name, email)')
      .eq('group_id', group.id).order('joined_at')
    const members = (memberRows || []).map(m => ({
      user_id: m.user_id,
      role: m.role,
      joined_at: m.joined_at,
      name: displayName(m.profiles, 'Member'),
      is_you: m.user_id === req.user.id,
    }))

    const { data: deckRows } = await supabase
      .from('group_decks').select('deck_id, added_by, added_at, decks(id, title, description, deck_type, cards(count))')
      .eq('group_id', group.id).order('added_at', { ascending: false })
    const names = Object.fromEntries(members.map(m => [m.user_id, m.name]))
    const decks = (deckRows || []).filter(d => d.decks).map(d => ({
      id: d.decks.id,
      title: d.decks.title,
      description: d.decks.description,
      deck_type: d.decks.deck_type,
      card_count: d.decks.cards?.[0]?.count ?? 0,
      added_by: d.added_by,
      added_by_name: names[d.added_by] || 'Member',
      can_remove: membership.role === 'owner' || d.added_by === req.user.id,
    }))

    ok(res, { group, role: membership.role, members, decks })
  } catch (e) { next(e) }
}

export async function deleteGroup(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('groups').delete().eq('id', req.params.id).eq('owner_id', req.user.id).select('id')
    if (error) throw error
    if (!data?.length) return fail(res, 'Only the group owner can delete this group.', 403)
    ok(res, { deleted: true })
  } catch (e) { next(e) }
}

export async function regenerateInvite(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('groups').update({ invite_token: newInviteToken() })
      .eq('id', req.params.id).eq('owner_id', req.user.id).select('invite_token')
    if (error) throw error
    if (!data?.length) return fail(res, 'Only the group owner can reset the invite link.', 403)
    ok(res, { invite_token: data[0].invite_token })
  } catch (e) { next(e) }
}

// Preview shown on the join page. Only a logged-in holder of the token sees the name, owner and size.
export async function previewInvite(req, res, next) {
  try {
    const { data: group } = await supabase
      .from('groups').select('id, name, description, owner:owner_id(name, email)')
      .eq('invite_token', req.params.token).maybeSingle()
    if (!group) return fail(res, 'This invite link is invalid or has been reset.', 404)

    const { count } = await supabase
      .from('group_members').select('*', { count: 'exact', head: true }).eq('group_id', group.id)
    const membership = await getMembership(group.id, req.user.id)
    ok(res, {
      id: group.id,
      name: group.name,
      description: group.description,
      owner_name: displayName(group.owner, 'Someone'),
      member_count: count || 1,
      already_member: !!membership,
    })
  } catch (e) { next(e) }
}

export async function joinGroup(req, res, next) {
  try {
    const { data: group } = await supabase
      .from('groups').select('id, name').eq('invite_token', req.params.token).maybeSingle()
    if (!group) return fail(res, 'This invite link is invalid or has been reset.', 404)

    const { error } = await supabase
      .from('group_members')
      .upsert({ group_id: group.id, user_id: req.user.id, role: 'member' }, { onConflict: 'group_id,user_id', ignoreDuplicates: true })
    if (error) throw error
    ok(res, { id: group.id, name: group.name })
  } catch (e) { next(e) }
}

// A member can leave; the owner can remove anyone else. The owner cannot leave (delete the group instead).
export async function removeMember(req, res, next) {
  try {
    const { id, userId } = req.params
    const me = await getMembership(id, req.user.id)
    if (!me) return fail(res, 'Group not found.', 404)

    const target = await getMembership(id, userId)
    if (!target) return fail(res, 'Member not found.', 404)
    if (target.role === 'owner') return fail(res, 'The owner cannot leave. Delete the group instead.', 400)
    if (userId !== req.user.id && me.role !== 'owner') return fail(res, 'Only the owner can remove members.', 403)

    const { error } = await supabase.from('group_members').delete().eq('group_id', id).eq('user_id', userId)
    if (error) throw error
    // Decks a departing member added no longer belong in the group
    await supabase.from('group_decks').delete().eq('group_id', id).eq('added_by', userId)
    ok(res, { removed: true })
  } catch (e) { next(e) }
}

export async function addDeck(req, res, next) {
  try {
    const me = await getMembership(req.params.id, req.user.id)
    if (!me) return fail(res, 'Group not found.', 404)
    const { deck_id } = req.body
    if (!deck_id) return fail(res, 'deck_id is required.')

    const { data: deck } = await supabase
      .from('decks').select('id').eq('id', deck_id).eq('user_id', req.user.id).maybeSingle()
    if (!deck) return fail(res, 'You can only add your own decks.', 403)

    const { error } = await supabase
      .from('group_decks')
      .upsert({ group_id: req.params.id, deck_id, added_by: req.user.id }, { onConflict: 'group_id,deck_id', ignoreDuplicates: true })
    if (error) throw error
    ok(res, { added: true })
  } catch (e) { next(e) }
}

export async function removeDeck(req, res, next) {
  try {
    const { id, deckId } = req.params
    const me = await getMembership(id, req.user.id)
    if (!me) return fail(res, 'Group not found.', 404)

    let query = supabase.from('group_decks').delete().eq('group_id', id).eq('deck_id', deckId)
    if (me.role !== 'owner') query = query.eq('added_by', req.user.id)
    const { data, error } = await query.select('deck_id')
    if (error) throw error
    if (!data?.length) return fail(res, 'Deck not found in this group.', 404)
    ok(res, { removed: true })
  } catch (e) { next(e) }
}

// Read-only view of a deck shared into a group, for any member
export async function getGroupDeck(req, res, next) {
  try {
    const { id, deckId } = req.params
    const me = await getMembership(id, req.user.id)
    if (!me) return fail(res, 'Group not found.', 404)

    const { data: link } = await supabase
      .from('group_decks').select('deck_id').eq('group_id', id).eq('deck_id', deckId).maybeSingle()
    if (!link) return fail(res, 'Deck not found in this group.', 404)

    const { data: deck } = await supabase
      .from('decks').select('id, title, description, deck_type').eq('id', deckId).single()
    const { data: cards } = await supabase
      .from('cards').select('id, question, answer, explanation, difficulty, tags, code_example, code_language, word, definition')
      .eq('deck_id', deckId)
    ok(res, { deck, cards: cards || [] })
  } catch (e) { next(e) }
}
