import { Router } from 'express'
import { getStatistics } from '../controllers/statisticsController.js'

const router = Router()
router.get('/', getStatistics)
export default router
