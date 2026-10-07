import { generateJSON } from './groqClient.js'

const VISION_MODEL = process.env.CF_VISION_MODEL || '@cf/meta/llama-3.2-11b-vision-instruct'

function runUrl() {
  return `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID.trim()}/ai/run/${VISION_MODEL}`
}

async function runModel(body) {
  return fetch(runUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.CF_API_TOKEN.trim()}` },
    body: JSON.stringify(body),
  })
}

// Step 1: the vision model only reads the image and answers in plain text. Asking it for strict JSON is
// unreliable (it often replies in prose), so the flashcard JSON is produced separately by the text model.
async function readImage(imageBuffer, mimeType) {
  const body = {
    max_tokens: 1200,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'Transcribe all readable text in this image exactly, and briefly describe any diagram, chart or figure '
            + '(its parts and how they relate). Reply with plain text only. If the image has no readable text or study '
            + 'content, reply with exactly: NO CONTENT',
        },
        { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBuffer.toString('base64')}` } },
      ],
    }],
  }

  let res = await runModel(body)
  // Llama 3.2 Vision needs a one-time license acceptance per Cloudflare account
  if (res.status === 403 && /agree/i.test(await res.clone().text())) {
    await runModel({ prompt: 'agree' })
    res = await runModel(body)
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    console.error('Cloudflare vision error', res.status, detail)
    const message = res.status === 401 || res.status === 403
      ? 'Image AI credentials are invalid. Check CF_ACCOUNT_ID and CF_API_TOKEN on the server.'
      : res.status === 429
        ? 'Daily image AI limit reached. Please try again later.'
        : 'Unable to read the image. Please try again.'
    throw Object.assign(new Error(message), { statusCode: res.status === 429 ? 429 : 502 })
  }

  const json = await res.json()
  const raw = json.result?.response ?? json.result?.choices?.[0]?.message?.content
  return typeof raw === 'string' ? raw.trim() : ''
}

export async function generateImageCards({ imageBuffer, mimeType, count = 10 }) {
  if (!process.env.CF_ACCOUNT_ID?.trim() || !process.env.CF_API_TOKEN?.trim()) {
    throw Object.assign(new Error('Image mode is not configured. Set CF_ACCOUNT_ID and CF_API_TOKEN on the server.'), { statusCode: 500 })
  }

  const extracted = await readImage(imageBuffer, mimeType)
  if (extracted.length < 20 || /^NO CONTENT\b/i.test(extracted)) {
    throw Object.assign(new Error('No study content found in this image. Try a clearer image.'), { statusCode: 400 })
  }

  const prompt = `You are a study assistant. Below is the text and description extracted from an image (notes, a diagram, a textbook page or a slide).
Generate ${count} flashcards from it. Stay grounded in the extracted content and do not add outside information.

EXTRACTED CONTENT:
${extracted.slice(0, 6000)}

Return a JSON object:
{
  "cards": [
    {
      "question": "string",
      "answer": "string",
      "explanation": "string",
      "difficulty": "easy|medium|hard",
      "tags": ["string"]
    }
  ]
}

Return only valid JSON.`

  const data = await generateJSON(prompt)
  const cards = (data.cards || [])
    .filter(c => c.question && c.answer)
    .map(c => ({
      question: String(c.question).slice(0, 500),
      answer: String(c.answer).slice(0, 1000),
      explanation: c.explanation ? String(c.explanation).slice(0, 1000) : null,
      difficulty: ['easy', 'medium', 'hard'].includes(c.difficulty) ? c.difficulty : 'medium',
      tags: Array.isArray(c.tags) ? c.tags.slice(0, 5).map(String) : [],
      code_example: null,
      code_language: null,
      source_type: 'image',
    }))

  if (!cards.length) {
    throw Object.assign(new Error('No study content found in this image. Try a clearer image.'), { statusCode: 400 })
  }
  return cards
}
