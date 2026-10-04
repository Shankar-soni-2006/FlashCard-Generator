import { generateJSON } from './geminiClient.js'

export async function generateVocabularyCards({ word, count = 10 }) {
  const prompt = `Generate ${count} vocabulary flashcards for: "${word}".
If this is a single word, generate cards for related words in the same domain.
If this is a topic (e.g. "GRE vocabulary"), generate ${count} relevant words.

Return a JSON object:
{
  "cards": [
    {
      "word": "string",
      "definition": "string",
      "part_of_speech": "noun|verb|adjective|adverb|etc",
      "pronunciation": "string (optional)",
      "example_sentence": "string",
      "synonyms": ["string"],
      "antonyms": ["string"],
      "difficulty": "easy|medium|hard",
      "tags": ["vocabulary"],
      "source_type": "vocabulary"
    }
  ]
}

Return only valid JSON.`

  const data = await generateJSON(prompt)
  return (data.cards || [])
    .filter(c => c.word && c.definition)
    .map(c => ({
      word: String(c.word).slice(0, 100),
      definition: String(c.definition).slice(0, 500),
      part_of_speech: c.part_of_speech ? String(c.part_of_speech).slice(0, 50) : null,
      pronunciation: c.pronunciation ? String(c.pronunciation).slice(0, 100) : null,
      example_sentence: c.example_sentence ? String(c.example_sentence).slice(0, 500) : null,
      synonyms: Array.isArray(c.synonyms) ? c.synonyms.slice(0, 5).map(String) : [],
      antonyms: Array.isArray(c.antonyms) ? c.antonyms.slice(0, 5).map(String) : [],
      difficulty: ['easy', 'medium', 'hard'].includes(c.difficulty) ? c.difficulty : 'medium',
      tags: Array.isArray(c.tags) ? c.tags.slice(0, 5).map(String) : ['vocabulary'],
      question: `What does "${c.word}" mean?`,
      answer: String(c.definition).slice(0, 500),
      source_type: 'vocabulary',
    }))
}
