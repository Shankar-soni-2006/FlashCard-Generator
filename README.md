# AI Smart Flashcards

An AI-powered learning platform combining Gemini AI, spaced repetition (SM-2), and persistent flashcard decks.

## Stack

- **Frontend** — React 19, Vite 5, Tailwind CSS 3, React Router v7
- **Backend** — Node.js, Express.js (ESM)
- **Database** — Supabase PostgreSQL
- **Auth** — Supabase Auth (email + Google OAuth)
- **AI** — Google Gemini API (text + multimodal)
- **Scheduling** — SM-2 spaced repetition

---

## Project Structure

```
Flash-Card-Generator/
├── client/          # React frontend
├── server/          # Express backend
├── database/        # SQL schema + RLS policies
└── docs/
```

---

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `database/schema.sql` in the SQL editor
3. Run `database/rls.sql` in the SQL editor
4. Enable Google OAuth in Authentication → Providers
5. Copy your project URL, anon key, and service role key

### 2. Gemini API

1. Get an API key from [Google AI Studio](https://aistudio.google.com)

### 3. Backend

```bash
cd server
cp .env.example .env
# Fill in your keys in .env
npm install
npm run dev
```

### 4. Frontend

```bash
cd client
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`  
Backend runs on `http://localhost:5000`

---

## Environment Variables

### server/.env

```
PORT=5000
CLIENT_URL=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
```

### client/.env

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Features

- **5 AI generation modes** — Topic, Notes, Programming, Vocabulary, Image/Diagram
- **SM-2 spaced repetition** — Again / Hard / Good / Easy ratings
- **Due-today review queue** — Prioritized by overdue cards
- **Deck management** — Create, edit, delete, share
- **Keyboard shortcuts** — Space to reveal, 1–4 to rate
- **Statistics** — Reviews per day, rating distribution, streak, accuracy
- **Deck sharing** — Public share links via secure token
- **Responsive** — Desktop sidebar + mobile bottom nav

---

## Deployment

- **Frontend** → Vercel (`cd client && npm run build`)
- **Backend** → Render or Railway (set env vars, `npm start`)
- **Database** → Supabase (already hosted)
