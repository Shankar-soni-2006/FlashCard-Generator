import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const MODEL = 'qwen/qwen3.8-27b'

function friendly(e) {
  const status = e.status === 429 ? 429 : 502
  const message = e.status === 429
    ? 'AI rate limit reached. Please wait a moment and try again.'
    : 'The AI could not generate flashcards. Please try again.'
  console.error('Groq error', e.status, e.message)
  return Object.assign(new Error(message), { statusCode: status })
}

// Groq rate limits (tokens/minute) are tracked per model, so fall back to the next one on a 429
const FALLBACK_MODELS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b']
const MODELS = [MODEL, ...FALLBACK_MODELS]

async function completeJSON(model, prompt) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      })
      return JSON.parse(completion.choices[0].message.content)
    } catch (e) {
      // The model occasionally emits a malformed/tool-call reply; one retry usually fixes it
      const retryable = (e.status === 400 && /json_validate_failed/.test(e.message || '')) || e instanceof SyntaxError
      if (retryable && attempt === 0) continue
      throw e
    }
  }
}

export async function generateJSON(prompt) {
  let lastError
  for (const model of MODELS) {
    try {
      return await completeJSON(model, prompt)
    } catch (e) {
      lastError = e
      if (e.status !== 429) break
      console.warn(`Rate limited on ${model}, trying next model`)
    }
  }
  throw friendly(lastError)
}

export { MODEL }
