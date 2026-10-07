import { generateJSON } from './groqClient.js'

export async function generateNotesCards({ notes, count = 10 }) {
  const prompt = `You are a study assistant. Extract key concepts from the following notes and generate ${count} flashcards.
Stay grounded in the provided notes — do not add external information.

NOTES:
${notes.slice(0, 8000)}

Return a JSON object:
{
  "cards": [
    {
      "question": "string",
      "answer": "string",
      "explanation": "string",
      "difficulty": "easy|medium|hard",
      "tags": ["string"],
      "source_type": "notes"
    }
  ]
}

Return only valid JSON.`

  const data = await generateJSON(prompt)
  return (data.cards || [])
    .filter(c => c.question && c.answer)
    .map(c => ({
      question: String(c.question).slice(0, 500),
      answer: String(c.answer).slice(0, 1000),
      explanation: c.explanation ? String(c.explanation).slice(0, 1000) : null,
      difficulty: ['easy', 'medium', 'hard'].includes(c.difficulty) ? c.difficulty : 'medium',
      tags: Array.isArray(c.tags) ? c.tags.slice(0, 5).map(String) : [],
      code_example: null,
      code_language: null,
      source_type: 'notes',
    }))
}
