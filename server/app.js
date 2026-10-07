import express from 'express'
import cors from 'cors'
import { authMiddleware } from './middleware/authMiddleware.js'
import { errorMiddleware } from './middleware/errorMiddleware.js'
import { getSharedDeck } from './controllers/deckController.js'
import aiRoutes from './routes/aiRoutes.js'
import deckRoutes from './routes/deckRoutes.js'
import cardRoutes from './routes/cardRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import statisticsRoutes from './routes/statisticsRoutes.js'
import groupRoutes from './routes/groupRoutes.js'

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL || 'https://flash-cards-by-shankar.vercel.app', credentials: true }))
app.use(express.json({ limit: '10mb' }))

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }))

// Public route — no auth required
app.get('/api/shared/:token', getSharedDeck)

// User info
app.get('/api/user/me', authMiddleware, (req, res) => res.json({ success: true, data: req.user }))

// Protected routes
app.use('/api/ai', authMiddleware, aiRoutes)
app.use('/api/decks', authMiddleware, deckRoutes)
app.use('/api/decks/:deckId/cards', authMiddleware, cardRoutes)
app.use('/api/cards', authMiddleware, cardRoutes)
app.use('/api/reviews', authMiddleware, reviewRoutes)
app.use('/api/statistics', authMiddleware, statisticsRoutes)
app.use('/api/groups', authMiddleware, groupRoutes)

app.use(errorMiddleware)

export default app
