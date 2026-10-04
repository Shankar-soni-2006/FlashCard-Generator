import { Router } from 'express'
import { getDueCards, submitRating, getHistory } from '../controllers/reviewController.js'

const router = Router()
router.get('/due', getDueCards)
router.get('/history', getHistory)
router.post('/:cardId', submitRating)
export default router
