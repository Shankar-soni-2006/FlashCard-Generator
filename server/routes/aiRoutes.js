import { Router } from 'express'
import { generateTopic, generateNotes, generateProgramming, generateVocabulary, generateImage } from '../controllers/aiController.js'
import { upload } from '../middleware/uploadMiddleware.js'

const router = Router()
router.post('/generate-topic', generateTopic)
router.post('/generate-notes', generateNotes)
router.post('/generate-programming', generateProgramming)
router.post('/generate-vocabulary', generateVocabulary)
router.post('/generate-image', upload.single('image'), generateImage)
export default router
