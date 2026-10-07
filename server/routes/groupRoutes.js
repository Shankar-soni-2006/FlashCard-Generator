import { Router } from 'express'
import {
  listGroups, createGroup, getGroup, deleteGroup, regenerateInvite,
  previewInvite, joinGroup, removeMember, addDeck, removeDeck, getGroupDeck, getLeaderboard, copyGroupDeck,
} from '../controllers/groupController.js'

const router = Router()
router.get('/', listGroups)
router.post('/', createGroup)
router.get('/invite/:token', previewInvite)
router.post('/join/:token', joinGroup)
router.get('/:id', getGroup)
router.delete('/:id', deleteGroup)
router.get('/:id/leaderboard', getLeaderboard)
router.post('/:id/invite/regenerate', regenerateInvite)
router.delete('/:id/members/:userId', removeMember)
router.post('/:id/decks', addDeck)
router.get('/:id/decks/:deckId', getGroupDeck)
router.post('/:id/decks/:deckId/copy', copyGroupDeck)
router.delete('/:id/decks/:deckId', removeDeck)
export default router
