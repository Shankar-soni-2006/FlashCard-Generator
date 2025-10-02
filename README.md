# Flashcard Generator

A React-based web application that generates interactive flashcards on any topic using AI.

## Features

- **Topic Input**: Enter any topic to generate 15 comprehensive flashcards
- **Interactive Cards**: Click to flip between question and answer
- **Modern UI**: Clean, responsive design with animations
- **Loading States**: Visual feedback during generation
- **Error Handling**: Graceful error management

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173`

## API Integration

The app is structured to work with a backend API. To integrate with your LLM service:

1. **Update the API endpoint** in `src/api.js`:
   ```javascript
   const response = await fetch('YOUR_BACKEND_URL/api/generate-flashcards', {
     // ... configuration
   });
   ```

2. **Backend should expect:**
   ```json
   {
     "topic": "user entered topic"
   }
   ```

3. **Backend should return:**
   ```json
   {
     "flashcards": [
       {
         "id": 1,
         "question": "Question text",
         "answer": "Answer text"
       }
       // ... 14 more flashcards (15 total)
     ]
   }
   ```

## Project Structure

```
src/
├── App.jsx          # Main application component
├── Flashcard.jsx    # Individual flashcard component
├── Quiz.jsx         # Quiz component with multiple question types
├── api.js           # API service layer
├── index.css        # Global styles
└── main.jsx         # React entry point
```

## Technologies Used

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **CSS3** - Styling with animations
- **Fetch API** - HTTP requests

## Development Notes

- Currently uses mock data for development (15 flashcards)
- Replace API endpoint with your actual backend
- Flashcards flip on click with CSS animations
- Responsive grid layout adapts to screen size
