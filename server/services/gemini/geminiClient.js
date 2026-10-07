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

export async function generateJSON(prompt) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      })
      return JSON.parse(completion.choices[0].message.content)
    } catch (e) {
      // The model occasionally emits a malformed/tool-call reply; one retry usually fixes it
      const retryable = e.status === 400 && /json_validate_failed/.test(e.message || '')
      if (retryable && attempt === 0) continue
      throw friendly(e)
    }
  }
}

export { MODEL }
