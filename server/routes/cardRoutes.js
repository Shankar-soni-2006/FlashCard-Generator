import { Router } from 'express'
import { listCards, createCard, updateCard, deleteCard } from '../controllers/cardController.js'

const router = Router({ mergeParams: true })
router.get('/', listCards)
router.post('/', createCard)
router.put('/:cardId', updateCard)
router.delete('/:cardId', deleteCard)
export default router
