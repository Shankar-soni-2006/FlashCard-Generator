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

export async function generateImageCards({ imageBuffer, mimeType, count = 10 }) {
  if (!process.env.CF_ACCOUNT_ID?.trim() || !process.env.CF_API_TOKEN?.trim()) {
    throw Object.assign(new Error('Image mode is not configured. Set CF_ACCOUNT_ID and CF_API_TOKEN on the server.'), { statusCode: 500 })
  }

  const prompt = `You are a study assistant. Look at this image (notes, a diagram, a textbook page or a slide) and generate ${count} flashcards from its content.
Stay grounded in what the image shows. If it has no readable study content, return {"cards": []}.

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

  const body = {
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: prompt },
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
  const raw = json.result?.response
  let data
  try {
    data = typeof raw === 'object' && raw !== null ? raw : JSON.parse(String(raw).replace(/^```(?:json)?\s*|\s*```$/g, '').trim())
  } catch {
    throw Object.assign(new Error('Could not understand the AI response. Please try again.'), { statusCode: 502 })
  }

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
