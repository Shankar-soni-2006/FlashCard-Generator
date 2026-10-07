import { generateJSON } from './groqClient.js'

export async function generateProgrammingCards({ language, topic, count = 10 }) {
  const prompt = `Generate ${count} programming flashcards for ${language}${topic ? ` on the topic: "${topic}"` : ''}.

Each card must include a practical code example.

Return a JSON object:
{
  "cards": [
    {
      "question": "string",
      "answer": "string",
      "explanation": "string",
      "code_example": "string (valid ${language} code)",
      "code_language": "${language.toLowerCase()}",
      "difficulty": "easy|medium|hard",
      "tags": ["string"],
      "source_type": "programming"
    }
  ]
}

Rules:
- Code examples must be syntactically correct
- Keep code examples concise (under 20 lines)
- Return only valid JSON`

  const data = await generateJSON(prompt)
  return (data.cards || [])
    .filter(c => c.question && c.answer)
    .map(c => ({
      question: String(c.question).slice(0, 500),
      answer: String(c.answer).slice(0, 1000),
      explanation: c.explanation ? String(c.explanation).slice(0, 1000) : null,
      code_example: c.code_example ? String(c.code_example).slice(0, 2000) : null,
      code_language: c.code_language ? String(c.code_language).slice(0, 50) : language.toLowerCase(),
      difficulty: ['easy', 'medium', 'hard'].includes(c.difficulty) ? c.difficulty : 'medium',
      tags: Array.isArray(c.tags) ? c.tags.slice(0, 5).map(String) : [],
      source_type: 'programming',
    }))
}
