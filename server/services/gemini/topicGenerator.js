import { generateJSON } from './geminiClient.js'

export async function generateTopicCards({ topic, count = 10, difficulty = 'auto' }) {
  const difficultyInstruction = difficulty === 'auto'
    ? 'Mix easy, medium, and hard difficulties appropriately.'
    : `All cards should be ${difficulty} difficulty.`

  const prompt = `Generate ${count} high-quality flashcards about "${topic}".
${difficultyInstruction}

Return a JSON object with this exact structure:
{
  "cards": [
    {
      "question": "string",
      "answer": "string",
      "explanation": "string",
      "difficulty": "easy|medium|hard",
      "tags": ["string"],
      "code_example": null,
      "code_language": null,
      "source_type": "topic"
    }
  ]
}

Rules:
- Questions must be clear and specific
- Answers must be concise but complete
- Explanations add context beyond the answer
- Tags should be 1-3 relevant keywords
- Return only valid JSON`

  const data = await generateJSON(prompt)
  return validateCards(data.cards || [])
}

function validateCards(cards) {
  return cards
    .filter(c => c.question && c.answer)
    .map(c => ({
      question: String(c.question).slice(0, 500),
      answer: String(c.answer).slice(0, 1000),
      explanation: c.explanation ? String(c.explanation).slice(0, 1000) : null,
      difficulty: ['easy', 'medium', 'hard'].includes(c.difficulty) ? c.difficulty : 'medium',
      tags: Array.isArray(c.tags) ? c.tags.slice(0, 5).map(String) : [],
      code_example: null,
      code_language: null,
      source_type: 'topic',
    }))
}
