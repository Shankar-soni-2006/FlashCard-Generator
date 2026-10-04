import { Router } from 'express'
import { listDecks, getDeck, createDeck, updateDeck, deleteDeck, shareDeck, getSharedDeck } from '../controllers/deckController.js'

const router = Router()
router.get('/shared/:token', getSharedDeck)
router.get('/', listDecks)
router.post('/', createDeck)
router.get('/:id', getDeck)
router.put('/:id', updateDeck)
router.delete('/:id', deleteDeck)
router.post('/:id/share', shareDeck)
export default router
