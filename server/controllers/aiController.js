import { generateTopicCards } from '../services/ai/topicGenerator.js'
import { generateNotesCards } from '../services/ai/notesGenerator.js'
import { generateProgrammingCards } from '../services/ai/programmingGenerator.js'
import { generateVocabularyCards } from '../services/ai/vocabularyGenerator.js'
import { generateImageCards } from '../services/ai/imageGenerator.js'
import { ok, fail } from '../utils/response.js'

export async function generateTopic(req, res, next) {
  try {
    const { topic, count, difficulty } = req.body
    if (!topic?.trim()) return fail(res, 'Topic is required.')
    const cards = await generateTopicCards({ topic, count: Number(count) || 10, difficulty })
    ok(res, { cards })
  } catch (e) {
    if (e.message?.includes('API_KEY_INVALID') || e.message?.includes('API key not valid')) {
      return fail(res, 'AI API key is invalid. Check your server/.env file.', 500)
    }
    next(e)
  }
}

export async function generateNotes(req, res, next) {
  try {
    const { notes, count } = req.body
    if (!notes?.trim()) return fail(res, 'Notes are required.')
    const cards = await generateNotesCards({ notes, count: Number(count) || 10 })
    ok(res, { cards })
  } catch (e) {
    if (e.message?.includes('API_KEY_INVALID') || e.message?.includes('API key not valid')) {
      return fail(res, 'AI API key is invalid. Check your server/.env file.', 500)
    }
    next(e)
  }
}

export async function generateProgramming(req, res, next) {
  try {
    const { language, topic, count } = req.body
    if (!language?.trim()) return fail(res, 'Language is required.')
    const cards = await generateProgrammingCards({ language, topic, count: Number(count) || 10 })
    ok(res, { cards })
  } catch (e) {
    if (e.message?.includes('API_KEY_INVALID') || e.message?.includes('API key not valid')) {
      return fail(res, 'AI API key is invalid. Check your server/.env file.', 500)
    }
    next(e)
  }
}

export async function generateVocabulary(req, res, next) {
  try {
    const { word, count } = req.body
    if (!word?.trim()) return fail(res, 'Word or topic is required.')
    const cards = await generateVocabularyCards({ word, count: Number(count) || 10 })
    ok(res, { cards })
  } catch (e) {
    if (e.message?.includes('API_KEY_INVALID') || e.message?.includes('API key not valid')) {
      return fail(res, 'AI API key is invalid. Check your server/.env file.', 500)
    }
    next(e)
  }
}

export async function generateImage(req, res, next) {
  try {
    if (!req.file) return fail(res, 'Please upload a valid PNG, JPG, JPEG or WEBP image.')
    const cards = await generateImageCards({
      imageBuffer: req.file.buffer,
      mimeType: req.file.mimetype,
      count: Number(req.body.count) || 10,
    })
    ok(res, { cards })
  } catch (e) {
    if (e.message?.includes('API_KEY_INVALID') || e.message?.includes('API key not valid')) {
      return fail(res, 'AI API key is invalid. Check your server/.env file.', 500)
    }
    next(e)
  }
}
