# AI Smart Flashcards

An AI-powered learning platform combining LLM-generated flashcards, spaced repetition (SM-2), study groups with leaderboards, and persistent decks.

## Stack

- **Frontend** — React 19, Vite 5, Tailwind CSS 3, React Router v7
- **Backend** — Node.js, Express.js (ESM)
- **Database** — Supabase PostgreSQL
- **Auth** — Supabase Auth (email + Google OAuth)
- **AI (text)** — [Groq](https://groq.com) — topic, notes, programming and vocabulary generation
- **AI (images)** — [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) — reads uploaded images to generate cards
- **Scheduling** — SM-2 spaced repetition

---

## Project Structure

```
FlashCard-Generator/
├── client/          # React frontend
├── server/          # Express backend
└── database/        # SQL schema, RLS policies and migrations
```

---

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run these in the SQL editor, in order:
   1. `database/schema.sql`
   2. `database/rls.sql`
   3. `database/fix_auth.sql` (signup trigger and policy fixes)
   4. `database/groups.sql` (study groups, invites and shared group decks)
3. Enable Google OAuth in Authentication → Providers
4. Copy your project URL, anon key, and service role key

### 2. Groq (text generation)

1. Create an API key at [console.groq.com](https://console.groq.com)
2. The free tier is rate limited per model (tokens per minute). The server tries `qwen/qwen3.8-27b` first and falls back to `openai/gpt-oss-120b` and `openai/gpt-oss-20b` when a model is rate limited.

### 3. Cloudflare Workers AI (image generation)

Image mode is optional. Without these variables the Image tab returns a "not configured" error and every other mode still works.

1. Sign up at [dash.cloudflare.com](https://dash.cloudflare.com)
2. Find your **Account ID**: it is the 32-character string in the dashboard URL (`dash.cloudflare.com/<account-id>/...`), and on the Workers AI page under "Use REST API"
3. Create an API token: My Profile → API Tokens → Create Token → use the **Workers AI** template
4. The free allowance is 10,000 neurons per day. The model is `@cf/meta/llama-3.2-11b-vision-instruct`, which needs a one-time license acceptance; the server does that automatically on first use. Override the model with `CF_VISION_MODEL`.

### 4. Backend

```bash
cd server
cp .env.example .env
# Fill in your keys in .env
npm install
npm run dev
```

### 5. Frontend

```bash
cd client
cp .env.example .env
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY and VITE_API_URL
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
GROQ_API_KEY=your-groq-api-key

# Image mode (optional)
CF_ACCOUNT_ID=your-cloudflare-account-id
CF_API_TOKEN=your-cloudflare-workers-ai-token
```

The server refuses to start if any of the Supabase variables or `GROQ_API_KEY` is missing. `CLIENT_URL` is the exact origin of the frontend (no trailing slash) and is used for CORS.

### client/.env

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:5000
```

`VITE_API_URL` is the backend origin. For a deployed frontend, set it to your backend URL (no trailing slash).

---

## Features

- **5 AI generation modes** — Topic, Notes, Programming, Vocabulary, Image/Diagram
- **SM-2 spaced repetition** — Again / Hard / Good / Easy ratings
- **Due-today review queue** — overdue cards first, with a configurable daily limit for new cards
- **Deck management** — create, edit, delete, share, and copy
- **Deck sharing** — public share links via secure token, with a list of shared links you can revoke in Settings
- **Study groups** — create a group, invite people with a link, share decks into it, and study each other's decks
- **Group leaderboards** — each group ranks members by XP earned from reviewing that group's decks (This week / All time). Again 2, Hard 5, Good 10, Easy 15 XP; each card counts once per day
- **Copy to my decks** — copy a group deck into your own account
- **Settings** — default card count and difficulty, new cards per day, light/dark/system theme, password change, and export of all decks as JSON or CSV
- **Keyboard shortcuts** — Space to reveal, 1–4 to rate
- **Statistics** — reviews per day, rating distribution, streak, accuracy
- **Responsive** — desktop sidebar and mobile navigation

---

## Deployment

The project is deployed as two Vercel projects:

- **Frontend** (`client/`) — build command `npm run build`. `client/vercel.json` rewrites all paths to `index.html` so deep links such as `/login` work on refresh. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` and `VITE_API_URL`.
- **Backend** (`server/`) — set every variable from `server/.env`, including `CLIENT_URL` set to the frontend's exact origin. Redeploy after changing environment variables.
- **Database** — Supabase (already hosted). Run the SQL files above once per project.

Notes for serverless hosting: request bodies are limited to roughly 4.5 MB (image uploads are capped at 4 MB for this reason), and image generation with the free vision model can take 15 to 30 seconds.
