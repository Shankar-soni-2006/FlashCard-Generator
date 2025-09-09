// Gemini Pro API configuration
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

// API service for generating flashcards
export const generateFlashcards = async (topic) => {
  try {
    // Check if API key is available
    if (!GEMINI_API_KEY) {
      throw new Error('API key not found. Please check your .env file.');
    }

    const prompt = `Generate 15 comprehensive flashcards about "${topic}". Return ONLY a valid JSON array with this exact structure:
[
  {
    "id": 1,
    "question": "Question text here",
    "answer": "Detailed answer here"
  }
]
Make questions progressively challenging from basic to advanced. Include practical examples and real-world applications.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format from API');
    }
    
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Clean and parse the JSON response
    let cleanedText = generatedText
      .replace(/```json|```/g, '')
      .replace(/```/g, '')
      .trim();
    
    // Find JSON array in the response
    const jsonStart = cleanedText.indexOf('[');
    const jsonEnd = cleanedText.lastIndexOf(']') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No valid JSON array found in response');
    }
    
    cleanedText = cleanedText.substring(jsonStart, jsonEnd);
    
    try {
      const flashcards = JSON.parse(cleanedText);
      if (!Array.isArray(flashcards) || flashcards.length === 0) {
        throw new Error('Invalid flashcards format');
      }
      return flashcards;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw text:', generatedText);
      throw new Error('Failed to parse AI response');
    }
  } catch (error) {
    console.error('Failed to generate flashcards:', error);
    
    // Provide more specific error messages
    if (error.message.includes('API key')) {
      throw new Error('Invalid API key. Please check your Gemini Pro API key.');
    } else if (error.message.includes('403')) {
      throw new Error('API key access denied. Please verify your Gemini Pro API key permissions.');
    } else if (error.message.includes('429')) {
      throw new Error('API rate limit exceeded. Please try again in a few minutes.');
    } else if (error.message.includes('JSON')) {
      throw new Error('Failed to parse AI response. Please try again.');
    } else {
      throw new Error(`Unable to generate flashcards: ${error.message}`);
    }
  }
};



// Generate quiz questions based on topic using Gemini Pro
export const generateQuizQuestions = async (topic) => {
  try {
    const prompt = `Generate 8 simple quiz questions about "${topic}". Return ONLY valid JSON:
[
  {
    "id": 1,
    "type": "mcq",
    "question": "What is ${topic}?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0
  },
  {
    "id": 2,
    "type": "fill",
    "question": "${topic} uses _____ for functionality.",
    "correct": "answer",
    "options": ["answer", "wrong"]
  },
  {
    "id": 3,
    "type": "boolean",
    "question": "${topic} is useful for development.",
    "correct": true
  }
]

Rules:
- Use simple language
- Make questions about basic ${topic} concepts
- Keep options short (1-2 words)
- Mix question types
- Return valid JSON only`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate quiz questions');
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format from API');
    }
    
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Clean and parse the JSON response
    let cleanedText = generatedText
      .replace(/```json|```/g, '')
      .replace(/```/g, '')
      .trim();
    
    // Find JSON array in the response
    const jsonStart = cleanedText.indexOf('[');
    const jsonEnd = cleanedText.lastIndexOf(']') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No valid JSON array found in response');
    }
    
    cleanedText = cleanedText.substring(jsonStart, jsonEnd);
    
    try {
      const questions = JSON.parse(cleanedText);
      if (!Array.isArray(questions) || questions.length === 0) {
        console.warn('Invalid questions format, using mock data');
        return generateMockQuizQuestions(topic);
      }
      return questions;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw text:', generatedText);
      console.warn('Parse failed, using mock data');
      return generateMockQuizQuestions(topic);
    }
  } catch (error) {
    console.warn('API failed, using mock quiz data. Error:', error.message);
    // Always return mock data if API fails
    return generateMockQuizQuestions(topic);
  }
};

// Mock quiz questions fallback - systematically related questions and options
const generateMockQuizQuestions = (topic) => {
  // Create topic-specific questions based on common technical concepts
  const topicLower = topic.toLowerCase();
  
  if (topicLower.includes('react')) {
    return [
      {
        id: 1,
        type: 'mcq',
        question: `What is used to store data in ${topic}?`,
        options: ['useState', 'useEffect', 'useContext', 'useCallback'],
        correct: 0
      },
      {
        id: 2,
        type: 'fill',
        question: `The _____ hook is used to add state to React components.`,
        correct: 'useState',
        options: ['useState', 'useEffect']
      },
      {
        id: 3,
        type: 'boolean',
        question: `React components can have state.`,
        correct: true
      },
      {
        id: 4,
        type: 'mcq',
        question: `What creates a React app?`,
        options: ['JSX', 'HTML', 'CSS', 'PHP'],
        correct: 0
      },
      {
        id: 5,
        type: 'fill',
        question: `React uses _____ to describe the UI.`,
        correct: 'JSX',
        options: ['JSX', 'HTML']
      },
      {
        id: 6,
        type: 'boolean',
        question: `React is a JavaScript library.`,
        correct: true
      },
      {
        id: 7,
        type: 'mcq',
        question: `What handles events in React?`,
        options: ['Event handlers', 'CSS', 'HTML', 'Database'],
        correct: 0
      },
      {
        id: 8,
        type: 'fill',
        question: `React components return _____ elements.`,
        correct: 'JSX',
        options: ['JSX', 'CSS']
      }
    ];
  } else if (topicLower.includes('database')) {
    return [
      {
        id: 1,
        type: 'mcq',
        question: `What identifies each row in a ${topic} table?`,
        options: ['Primary key', 'Foreign key', 'Index', 'Column'],
        correct: 0
      },
      {
        id: 2,
        type: 'fill',
        question: `A _____ key connects two tables together.`,
        correct: 'foreign',
        options: ['foreign', 'primary']
      },
      {
        id: 3,
        type: 'boolean',
        question: `Databases store information in tables.`,
        correct: true
      },
      {
        id: 4,
        type: 'mcq',
        question: `What language is used to query databases?`,
        options: ['SQL', 'HTML', 'CSS', 'Python'],
        correct: 0
      },
      {
        id: 5,
        type: 'fill',
        question: `Database tables have rows and _____.`,
        correct: 'columns',
        options: ['columns', 'keys']
      },
      {
        id: 6,
        type: 'boolean',
        question: `A database can have multiple tables.`,
        correct: true
      },
      {
        id: 7,
        type: 'mcq',
        question: `What stores data in a database?`,
        options: ['Tables', 'Functions', 'Variables', 'Classes'],
        correct: 0
      },
      {
        id: 8,
        type: 'fill',
        question: `Each table row represents one _____.`,
        correct: 'record',
        options: ['record', 'column']
      }
    ];
  } else {
    // Generic but systematic fallback with proper format
    return [
      {
        id: 1,
        type: 'mcq',
        question: `What is the main part of ${topic}?`,
        options: ['Core module', 'Helper file', 'Config file', 'Documentation'],
        correct: 0
      },
      {
        id: 2,
        type: 'fill',
        question: `${topic} systems need good _____ management.`,
        correct: 'resource',
        options: ['resource', 'memory']
      },
      {
        id: 3,
        type: 'boolean',
        question: `${topic} needs regular checking to work well.`,
        correct: true
      },
      {
        id: 4,
        type: 'mcq',
        question: `What pattern is often used in ${topic}?`,
        options: ['Simple pattern', 'Complex pattern', 'No pattern', 'Any pattern'],
        correct: 0
      },
      {
        id: 5,
        type: 'fill',
        question: `Good ${topic} code follows basic _____ rules.`,
        correct: 'design',
        options: ['design', 'complex']
      },
      {
        id: 6,
        type: 'mcq',
        question: `How do you test ${topic} code?`,
        options: ['Unit testing', 'No testing', 'Manual only', 'Complex testing'],
        correct: 0
      },
      {
        id: 7,
        type: 'boolean',
        question: `${topic} should be secure from the start.`,
        correct: true
      },
      {
        id: 8,
        type: 'fill',
        question: `${topic} can grow using good _____ design.`,
        correct: 'system',
        options: ['system', 'complex']
      }
    ];
  }
};