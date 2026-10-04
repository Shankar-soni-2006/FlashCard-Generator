# Product Requirements Document (PRD)
# AI Smart Flashcards with Spaced Repetition

**Document Version:** 1.0  
**Product Type:** AI-powered learning and flashcard platform  
**Primary Stack:** React + Vite + Node.js + Express.js + Supabase + Gemini API  
**Database:** Supabase PostgreSQL  
**AI:** Google Gemini API  
**Scheduling:** SM-2 Spaced Repetition Algorithm  

---

## 1. Product Overview

**AI Smart Flashcards** is an AI-powered learning platform that helps students convert topics, study notes, programming concepts, vocabulary, and diagrams into interactive flashcards.

The platform combines:

- Generative AI
- Persistent flashcard decks
- Spaced repetition
- SM-2 scheduling
- Personalized review queues
- AI-generated quizzes
- Programming code examples
- Vocabulary learning
- Image/diagram understanding
- Deck sharing
- Learning analytics

The existing FlashCard Generator project will be upgraded rather than completely rebuilt. Existing flashcard generation, quiz functionality, visual components, and styling should be reused where practical.

---

## 2. Problem Statement

Students often create flashcards manually, which is time-consuming. Even when flashcards are available, students may not know:

- Which cards to review
- When to review them
- Which concepts they are weak at
- How to organize large numbers of cards
- How to convert notes or diagrams into study material

The product solves this by combining **AI content generation** with **spaced-repetition scheduling**.

### Core Learning Cycle

```text
Topic / Notes / Image
        ↓
    Gemini AI
        ↓
   Flashcards
        ↓
      Deck
        ↓
    Study Card
        ↓
Again / Hard / Good / Easy
        ↓
      SM-2
        ↓
Next Review Date
        ↓
   Due Today Queue
        ↓
      Review
```

---

## 3. Product Goals

### Primary Goals

1. Generate high-quality flashcards using Gemini.
2. Persist all user-generated content.
3. Provide an effective spaced-repetition workflow.
4. Automatically calculate review schedules.
5. Support multiple learning content types.
6. Provide a simple dashboard for daily learning.
7. Allow users to share decks.
8. Provide learning statistics.
9. Maintain secure authentication and authorization.
10. Provide a responsive desktop/mobile experience.

### Secondary Goals

- Make programming learning easier with code examples.
- Make vocabulary learning structured.
- Convert visual study material into flashcards.
- Reduce the time required to create study material.

---

## 4. Target Users

### Primary Users

- College students
- Computer science students
- Engineering students
- Programming learners
- Competitive exam students
- Language learners

### Secondary Users

- Teachers
- Tutors
- Trainers
- Technical educators

---

## 5. Core Features

| Feature | Priority |
|---|---|
| User authentication | P0 |
| Topic → Flashcards | P0 |
| Persistent decks | P0 |
| Flashcard review | P0 |
| Again / Hard / Good / Easy | P0 |
| SM-2 scheduling | P0 |
| Due-today queue | P0 |
| Notes → Flashcards | P0 |
| Programming flashcards | P1 |
| Vocabulary decks | P1 |
| Image/diagram → Flashcards | P1 |
| Deck sharing | P1 |
| Quiz mode | P1 |
| Statistics | P1 |
| Search/filter | P2 |
| Advanced analytics | P2 |

---

## 6. Technology Stack

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | React | Application UI |
| Build | Vite | Development/build system |
| Styling | CSS / Tailwind CSS | UI styling |
| Routing | React Router | Client-side routing |
| Backend | Node.js | Server runtime |
| API | Express.js | REST API |
| Database | Supabase PostgreSQL | Persistent data |
| Authentication | Supabase Auth | Login/signup/session |
| Storage | Supabase Storage | Image/diagram storage |
| AI | Gemini API | Content generation |
| AI Vision | Gemini Multimodal | Image/diagram analysis |
| Scheduler | Custom SM-2 | Spaced repetition |
| API communication | REST/JSON | Frontend/backend communication |
| Security | RLS + Auth | Authorization |
| Deployment | Vercel + Render/Railway | Hosting |
| Version Control | Git + GitHub | Source control |

> Although the project uses a MERN-style React/Node/Express architecture, **Supabase PostgreSQL replaces MongoDB** because Supabase is the fixed database requirement.

---

## 7. High-Level System Architecture

```text
                         ┌─────────────────────┐
                         │    React + Vite     │
                         │      Frontend       │
                         └──────────┬──────────┘
                                    │
                              REST API / JSON
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Node.js + Express   │
                         │      Backend        │
                         └──────────┬──────────┘
                                    │
              ┌─────────────────────┼──────────────────────┐
              │                     │                      │
              ▼                     ▼                      ▼
      ┌───────────────┐      ┌───────────────┐      ┌──────────────┐
      │   Supabase    │      │   Gemini API  │      │     SM-2     │
      │  PostgreSQL   │      │               │      │   Scheduler  │
      │               │      │ Topic         │      │              │
      │ Profiles      │      │ Notes         │      │ Interval     │
      │ Decks         │      │ Programming   │      │ Ease Factor  │
      │ Cards         │      │ Vocabulary    │      │ Repetition   │
      │ Progress      │      │ Image         │      │ Due Date     │
      │ Reviews       │      │               │      │              │
      └───────┬───────┘      └───────────────┘      └──────────────┘
              │
              ▼
      ┌────────────────┐
      │ Supabase       │
      │ Storage        │
      │                │
      │ Images         │
      │ Diagrams       │
      └────────────────┘
```

---

## 8. Frontend Architecture

```text
client/
└── src/
    ├── components/
    │   ├── auth/
    │   ├── cards/
    │   ├── decks/
    │   ├── generator/
    │   ├── review/
    │   ├── quiz/
    │   ├── vocabulary/
    │   ├── statistics/
    │   └── common/
    │
    ├── pages/
    │   ├── Login.jsx
    │   ├── Register.jsx
    │   ├── Dashboard.jsx
    │   ├── Generate.jsx
    │   ├── Decks.jsx
    │   ├── DeckDetails.jsx
    │   ├── Review.jsx
    │   ├── SharedDeck.jsx
    │   ├── Statistics.jsx
    │   └── Profile.jsx
    │
    ├── services/
    │   ├── api.js
    │   ├── aiService.js
    │   ├── deckService.js
    │   ├── cardService.js
    │   └── reviewService.js
    │
    ├── context/
    │   └── AuthContext.jsx
    │
    ├── hooks/
    │   ├── useAuth.js
    │   ├── useDecks.js
    │   └── useReview.js
    │
    ├── lib/
    │   └── supabase.js
    │
    ├── utils/
    │   ├── validation.js
    │   └── dateUtils.js
    │
    ├── App.jsx
    └── main.jsx
```

---

## 9. Main Frontend Pages

### 9.1 Landing Page

Contains:

- Product introduction
- AI flashcard generation explanation
- Spaced repetition explanation
- Feature highlights
- Login
- Register

### 9.2 Login

Features:

- Email
- Password
- Login
- Google OAuth
- Forgot password
- Error handling

### 9.3 Register

Fields:

- Name
- Email
- Password
- Confirm password

---

## 10. Dashboard

The dashboard is the main application screen.

```text
┌──────────────────────────────────────────────┐
│ Welcome back, User                           │
│                                              │
│ Today's Review                               │
│ ┌──────────────────────────────────────────┐ │
│ │              18 Cards Due                │ │
│ │            [ Start Review ]              │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ Quick Create                                 │
│                                              │
│ [ Topic ] [ Notes ] [ Image ]               │
│ [ Vocabulary ] [ Programming ]              │
│                                              │
│ My Decks                                     │
│                                              │
│ DBMS Fundamentals       25 cards   8 due    │
│ Java OOP                30 cards   5 due    │
│ English Vocabulary     50 cards  12 due    │
└──────────────────────────────────────────────┘
```

Dashboard metrics:

- Due today
- Total decks
- Total cards
- Cards reviewed
- Cards mastered
- Current streak
- Review accuracy

---

## 11. AI Generation System

The platform has five generation modes:

```text
                 AI GENERATION
                       │
       ┌───────────────┼────────────────┐
       │               │                │
     Topic            Notes            Image
       │               │                │
       └───────────────┼────────────────┘
                       │
             ┌─────────┴─────────┐
             │                   │
       Programming          Vocabulary
```

---

## 12. Topic → Flashcards

### Input

```text
Topic: Database Normalization

Number of cards:
5 / 10 / 15 / 20 / 30
```

### Gemini Output

```json
{
  "cards": [
    {
      "question": "What is database normalization?",
      "answer": "...",
      "explanation": "...",
      "difficulty": "easy",
      "tags": ["DBMS", "Normalization"],
      "codeExample": null,
      "codeLanguage": null,
      "sourceType": "topic"
    }
  ]
}
```

The generated cards should be previewed before final persistence where appropriate.

---

## 13. Notes → Flashcards

Users can paste:

- Lecture notes
- Study material
- Revision notes
- Textbook excerpts
- Personal notes

Gemini should:

1. Extract concepts.
2. Identify important information.
3. Generate questions.
4. Generate answers.
5. Add explanations.
6. Assign difficulty.
7. Generate tags.

The AI should remain grounded in the supplied notes.

---

## 14. Programming Flashcards

Programming mode supports:

- Java
- JavaScript
- Python
- C
- C++
- Data structures
- Algorithms
- OOP
- DBMS
- Operating systems
- Computer networks

Each programming card can contain:

```text
question
answer
explanation
code_example
code_language
difficulty
tags
```

### Example

**Front:**

> What is method overloading in Java?

**Back:**

> Method overloading allows methods to have the same name but different parameter lists.

```java
class Calculator {
    int add(int a, int b) {
        return a + b;
    }

    int add(int a, int b, int c) {
        return a + b + c;
    }
}
```

---

## 15. Vocabulary System

Vocabulary cards contain:

```text
word
definition
part_of_speech
pronunciation
example_sentence
synonyms
antonyms
difficulty
```

Example:

```text
EPHEMERAL

adjective

Existing for a short period of time.

Example:
The beauty of the sunset was ephemeral.

Synonyms:
temporary, fleeting
```

Vocabulary cards use the same SM-2 scheduling engine.

---

## 16. Image/Diagram → Flashcards

### Workflow

```text
Upload Image
      ↓
Validate Image
      ↓
Supabase Storage
      ↓
Express Backend
      ↓
Gemini Multimodal API
      ↓
Analyze Image
      ↓
Extract Concepts
      ↓
Generate Flashcards
      ↓
Validate AI Response
      ↓
Preview
      ↓
Create Deck
```

Supported content:

- Technical diagrams
- Flowcharts
- UML
- Biology diagrams
- Architecture diagrams
- Network diagrams
- Study notes
- Readable handwritten notes

---

## 17. Flashcard System

Each card supports:

### Front

```text
Question
```

### Interaction

```text
[ Show Answer ]
```

### Back

```text
Answer
Explanation

Code example if available
```

### Rating

```text
[ Again ] [ Hard ] [ Good ] [ Easy ]
```

The card is scheduled only after the user provides a rating.

---

## 18. Spaced Repetition

The platform uses **SM-2**.

### Rating Mapping

| User Rating | SM-2 Quality |
|---|---:|
| Again | 0 |
| Hard | 3 |
| Good | 4 |
| Easy | 5 |

The scheduler maintains:

- Ease factor
- Interval
- Repetitions
- Last reviewed
- Next due date

---

## 19. SM-2 Flow

```text
Review Card
     ↓
User Rating
     ↓
SM-2
     ↓
Calculate:
 ├── Ease Factor
 ├── Interval
 ├── Repetitions
 └── Due Date
     ↓
Save card_progress
     ↓
Save review history
```

The actual interval must be calculated by the implementation rather than hardcoded.

---

## 20. Due Today Queue

Query cards where:

```sql
due_date <= NOW()
```

and the authenticated user owns the corresponding progress record.

The queue should prioritize overdue cards.

### Review Session

```text
Card 1
 ↓
Rating
 ↓
Card 2
 ↓
Rating
 ↓
Card 3
 ↓
...
 ↓
Complete
```

---

## 21. Review Completion

At the end:

```text
Review Complete

18 Cards Reviewed

Again     3
Hard      4
Good      8
Easy      3

Accuracy: 82%

[Back to Dashboard]
```

---

## 22. Deck Management

Users can:

- Create deck
- Edit deck
- Delete deck
- Rename deck
- Add cards
- Edit cards
- Delete cards
- Study deck
- Review deck
- Practice quiz
- Share deck

---

## 23. Deck Sharing

Each deck has:

```text
visibility:
    private
    public
```

A share token is generated for public sharing.

Example:

```text
/shared/deck/<secure-token>
```

The owner can:

```text
[ Share Deck ]
[ Copy Link ]
```

Private decks must never be accessible through the public route.

---

## 24. Quiz System

The existing project quiz functionality should be retained and integrated.

Supported question types:

### Multiple Choice

```text
What is normalization?

A. ...
B. ...
C. ...
D. ...
```

### True/False

```text
Normalization reduces data redundancy.

True / False
```

### Fill in the Blank

```text
The process of organizing data to reduce redundancy is ______.
```

Quiz results:

- Correct answers
- Incorrect answers
- Score
- Percentage
- Completion status

---

## 25. Database Schema

### Entity Relationship

```text
auth.users
     │
     ▼
profiles
     │
     │ 1:N
     ▼
decks
     │
     │ 1:N
     ▼
cards
     │
     │ 1:1
     ▼
card_progress
     │
     ▼
reviews
```

### `profiles`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, auth.users reference |
| name | TEXT | Nullable |
| email | TEXT | Required |
| avatar_url | TEXT | Nullable |
| created_at | TIMESTAMPTZ | Default now() |
| updated_at | TIMESTAMPTZ | Default now() |

### `decks`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → profiles |
| title | TEXT | Required |
| description | TEXT | Nullable |
| deck_type | TEXT | Required |
| visibility | TEXT | private/public |
| share_token | TEXT | Unique |
| created_at | TIMESTAMPTZ | Default now() |
| updated_at | TIMESTAMPTZ | Default now() |

### `cards`

| Column | Type | Purpose |
|---|---|---|
| id | UUID | Primary key |
| deck_id | UUID | Parent deck |
| question | TEXT | Front |
| answer | TEXT | Back |
| explanation | TEXT | Detailed explanation |
| code_example | TEXT | Programming example |
| code_language | TEXT | Programming language |
| word | TEXT | Vocabulary word |
| definition | TEXT | Vocabulary definition |
| part_of_speech | TEXT | Grammar category |
| pronunciation | TEXT | Pronunciation |
| example_sentence | TEXT | Usage |
| synonyms | JSONB | Synonyms |
| antonyms | JSONB | Antonyms |
| difficulty | TEXT | Difficulty |
| tags | JSONB | Categorization |
| source_type | TEXT | topic/notes/image/etc. |
| created_at | TIMESTAMPTZ | Creation |
| updated_at | TIMESTAMPTZ | Update |

### `card_progress`

| Column | Type | Purpose |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | User |
| card_id | UUID | Card |
| ease_factor | DECIMAL | SM-2 ease |
| interval | INTEGER | Current interval |
| repetitions | INTEGER | Successful repetitions |
| due_date | TIMESTAMPTZ | Next review |
| last_reviewed | TIMESTAMPTZ | Previous review |
| again_count | INTEGER | Again ratings |
| hard_count | INTEGER | Hard ratings |
| good_count | INTEGER | Good ratings |
| easy_count | INTEGER | Easy ratings |
| created_at | TIMESTAMPTZ | Creation |
| updated_at | TIMESTAMPTZ | Update |

### `reviews`

| Column | Type | Purpose |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | Reviewer |
| card_id | UUID | Reviewed card |
| rating | TEXT | Again/Hard/Good/Easy |
| previous_interval | INTEGER | Previous interval |
| new_interval | INTEGER | New interval |
| previous_ease_factor | DECIMAL | Previous ease |
| new_ease_factor | DECIMAL | New ease |
| reviewed_at | TIMESTAMPTZ | Review timestamp |

---

## 26. Database Relationships

```text
profiles
   │
   │ 1:N
   ▼
decks
   │
   │ 1:N
   ▼
cards
   │
   ├───────────────┐
   │               │
   ▼               ▼
card_progress    reviews
```

---

## 27. Recommended Database Indexes

Create indexes for:

- `decks.user_id`
- `decks.share_token`
- `cards.deck_id`
- `card_progress.user_id`
- `card_progress.card_id`
- `card_progress.due_date`
- `reviews.user_id`
- `reviews.card_id`
- `reviews.reviewed_at`

These are important for review-queue and dashboard performance.

---

## 28. Row Level Security

Enable Supabase Row Level Security.

Users can:

- Read their own profile.
- Update their own profile.
- Read their own decks.
- Create their own decks.
- Update their own decks.
- Delete their own decks.
- Access cards belonging to their decks.
- Access their own card progress.
- Access their own review history.

Public shared decks receive a controlled read policy.

---

## 29. Supabase Storage

Create a storage bucket:

```text
flashcard-images/
```

Structure:

```text
user-id/
deck-id/
image-file
```

Supported formats:

- PNG
- JPG
- JPEG
- WEBP

Validate MIME type and file size before upload.

---

## 30. Backend API

### User

```http
GET /api/user/me
```

### AI

```http
POST /api/ai/generate-topic
POST /api/ai/generate-notes
POST /api/ai/generate-programming
POST /api/ai/generate-vocabulary
POST /api/ai/generate-image
```

### Decks

```http
GET    /api/decks
POST   /api/decks
GET    /api/decks/:id
PUT    /api/decks/:id
DELETE /api/decks/:id
POST   /api/decks/:id/share
GET    /api/decks/shared/:token
```

### Cards

```http
GET    /api/decks/:deckId/cards
POST   /api/decks/:deckId/cards
PUT    /api/cards/:cardId
DELETE /api/cards/:cardId
```

### Reviews

```http
GET  /api/reviews/due
POST /api/reviews/:cardId
GET  /api/reviews/history
```

### Statistics

```http
GET /api/statistics
```

---

## 31. Backend Folder Architecture

```text
server/
├── config/
│   └── supabase.js
│
├── controllers/
│   ├── aiController.js
│   ├── deckController.js
│   ├── cardController.js
│   ├── reviewController.js
│   ├── quizController.js
│   └── statisticsController.js
│
├── middleware/
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   └── uploadMiddleware.js
│
├── routes/
│   ├── aiRoutes.js
│   ├── deckRoutes.js
│   ├── cardRoutes.js
│   ├── reviewRoutes.js
│   └── statisticsRoutes.js
│
├── services/
│   ├── gemini/
│   │   ├── geminiClient.js
│   │   ├── topicGenerator.js
│   │   ├── notesGenerator.js
│   │   ├── programmingGenerator.js
│   │   ├── vocabularyGenerator.js
│   │   └── imageGenerator.js
│   │
│   └── scheduler/
│       └── sm2.js
│
├── utils/
│   ├── validation.js
│   └── response.js
│
├── app.js
└── server.js
```

---

## 32. AI Service Architecture

```text
services/gemini/
│
├── geminiClient.js
├── topicGenerator.js
├── notesGenerator.js
├── programmingGenerator.js
├── vocabularyGenerator.js
└── imageGenerator.js
```

`geminiClient.js` handles the Gemini API connection.

Individual generators handle specialized prompts and schemas.

---

## 33. AI Output Validation

Never directly insert Gemini output into PostgreSQL.

Pipeline:

```text
Gemini
 ↓
JSON Parse
 ↓
Schema Validation
 ↓
Business Validation
 ↓
Sanitize
 ↓
Supabase
```

Validate:

- Required fields
- Card count
- Text lengths
- Difficulty
- Source type
- Tags
- Programming language
- Malformed JSON

---

## 34. Authentication Flow

```text
User
 ↓
Login
 ↓
Supabase Auth
 ↓
Session
 ↓
React AuthContext
 ↓
Protected Route
 ↓
API Request
 ↓
Backend Auth Verification
 ↓
User-specific Database Access
```

Never accept arbitrary `user_id` from the frontend as proof of ownership.

---

## 35. Security Requirements

The system must:

- Protect Gemini API key.
- Protect Supabase service-role key.
- Use HTTPS in production.
- Validate input.
- Validate uploaded files.
- Implement RLS.
- Verify authentication.
- Verify deck ownership.
- Verify card ownership.
- Prevent unauthorized sharing.
- Rate-limit AI generation where practical.
- Avoid exposing sensitive database information.
- Never execute AI-generated code.
- Sanitize user-generated content where required.

---

## 36. Non-Functional Requirements

### Performance

- Dashboard should load quickly under normal network conditions.
- Avoid unnecessary API requests.
- Paginate large deck/card lists.
- Optimize uploaded images.
- Use database indexes.
- Lazy-load large pages where practical.

### Scalability

The architecture should support increasing:

- Users
- Decks
- Cards
- Reviews
- AI requests

without requiring a complete architecture rewrite.

### Availability

The application should gracefully handle:

- Gemini API failure
- Supabase failure
- Network failure
- Expired sessions
- Invalid AI output
- Invalid uploaded files

### Security

- Authentication required for private resources.
- RLS enabled.
- Secrets stored in environment variables.
- Backend-only AI credentials.
- Secure share tokens.

### Usability

A new user should be able to:

```text
Signup
 ↓
Create deck
 ↓
Generate cards
 ↓
Study
 ↓
Rate
 ↓
Finish
```

without requiring documentation.

### Accessibility

Support:

- Keyboard navigation
- Semantic HTML
- Visible focus
- Accessible labels
- Readable contrast
- Alt text
- Screen-reader-friendly controls

### Maintainability

Use:

- Modular components
- Service layer
- Controllers
- Reusable hooks
- Reusable UI components
- Clear API boundaries
- Centralized error handling

---

## 37. Functional Requirements

### FR-001 Authentication

The system shall allow users to register and log in.

### FR-002 Session Management

The system shall maintain authenticated sessions.

### FR-003 AI Topic Generation

The system shall generate flashcards from a user-provided topic.

### FR-004 Notes Generation

The system shall generate flashcards from user-provided notes.

### FR-005 Programming Generation

The system shall generate programming flashcards containing code examples.

### FR-006 Vocabulary Generation

The system shall generate vocabulary cards containing definitions and examples.

### FR-007 Image Generation

The system shall analyze uploaded diagrams/images and generate flashcards.

### FR-008 Deck Management

Users shall be able to create, edit and delete decks.

### FR-009 Card Management

Users shall be able to create, edit and delete cards.

### FR-010 Persistence

Generated decks/cards shall remain available after browser refresh.

### FR-011 Flashcard Review

Users shall be able to reveal flashcard answers.

### FR-012 Rating

Users shall rate cards as:

- Again
- Hard
- Good
- Easy

### FR-013 Spaced Repetition

The system shall calculate future reviews using SM-2.

### FR-014 Due Queue

The system shall display cards due for review.

### FR-015 Review History

The system shall store review history.

### FR-016 Quiz

Users shall be able to practice decks using quizzes.

### FR-017 Sharing

Users shall be able to generate share links for eligible decks.

### FR-018 Statistics

Users shall be able to view learning statistics.

### FR-019 Search

Users shall be able to search/filter decks.

### FR-020 Responsive Interface

The system shall work on mobile, tablet and desktop.

---

## 38. Error Handling

### Gemini Failure

```text
Unable to generate flashcards.
Please try again.
```

### Supabase Failure

```text
Unable to save your deck.
Please try again.
```

### Invalid Image

```text
Please upload a valid PNG, JPG, JPEG or WEBP image.
```

### Expired Authentication

```text
Your session has expired.
Please log in again.
```

### No Cards Due

```text
You're all caught up!
No cards are due for review.
```

Use consistent API responses:

### Success

```json
{
  "success": true,
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Unable to generate flashcards"
}
```

---

## 39. Loading States

Every asynchronous operation needs a loading state.

Examples:

- Generating flashcards...
- Analyzing diagram...
- Saving deck...
- Loading cards...
- Updating review schedule...
- Loading statistics...

Prevent duplicate requests while an operation is running.

---

## 40. Empty States

### No Decks

```text
You don't have any decks yet.

Create your first AI-powered deck.

[ Create Deck ]
```

### No Cards

```text
This deck doesn't have any cards yet.

[ Generate Cards ]
```

### No Reviews

```text
No review history yet.
Start studying to build your learning history.
```

---

## 41. Statistics

The statistics page should contain:

- Total Decks
- Total Cards
- Cards Reviewed
- Cards Due
- Cards Mastered
- Current Streak
- Review Accuracy
- Total Reviews

Possible charts:

- Reviews per day
- Rating distribution
- Cards by deck
- Learning progress
- Due cards trend

All values must come from actual database records.

---

## 42. User Journey

```text
Landing Page
     ↓
Register / Login
     ↓
Dashboard
     ↓
Choose Generation Method
     │
     ├── Topic
     ├── Notes
     ├── Programming
     ├── Vocabulary
     └── Image
     ↓
Gemini
     ↓
Preview
     ↓
Save Deck
     ↓
Study
     ↓
Show Answer
     ↓
Again / Hard / Good / Easy
     ↓
SM-2
     ↓
Next Review Date
     ↓
Due Today
     ↓
Review Again
```

---

## 43. Complete Project Structure

```text
AI-Smart-Flashcards/
│
├── client/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── app.js
│   └── server.js
│
├── database/
│   ├── schema.sql
│   ├── rls.sql
│   └── seed.sql
│
├── docs/
│   ├── architecture.md
│   ├── database.md
│   ├── api.md
│   └── setup.md
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 44. Existing Project Migration

The current project contains the foundation for:

- React/Vite
- Gemini-based flashcard generation
- Flashcard component
- Quiz component
- Existing styling
- Authentication

Migration:

```text
CURRENT PROJECT
      │
      ├── Keep Flashcard UI
      ├── Keep Quiz functionality
      ├── Keep useful styling
      ├── Keep existing generation UX
      │
      ▼
REFACTOR
      │
      ├── Firebase → Supabase Auth
      ├── Frontend Gemini → Express/Gemini
      ├── React state → Supabase persistence
      ├── Basic cards → Deck/Card system
      └── Basic study → SM-2 review system
      │
      ▼
NEW PLATFORM
```

---

## 45. Development Phases

### Phase 1 — Foundation

- Project audit
- Frontend cleanup
- Node/Express backend
- Environment configuration
- Supabase configuration

### Phase 2 — Authentication

- Supabase Auth
- Protected routes
- User profiles
- Remove Firebase

### Phase 3 — Database

- Tables
- Foreign keys
- Indexes
- RLS
- Storage

### Phase 4 — AI Backend

- Gemini client
- Topic generation
- Notes generation
- Structured output validation

### Phase 5 — Persistent Decks

- Deck CRUD
- Card CRUD
- Database persistence

### Phase 6 — Spaced Repetition

- SM-2
- Rating system
- Progress
- Review history

### Phase 7 — Review System

- Due queue
- Review session
- Completion summary

### Phase 8 — Advanced AI

- Programming
- Vocabulary
- Image/diagram

### Phase 9 — Collaboration

- Deck sharing
- Public deck view

### Phase 10 — Analytics

- Statistics
- Streak
- Review metrics

### Phase 11 — Quality

- Security
- Responsive design
- Error handling
- Accessibility
- Testing

### Phase 12 — Deployment

- Frontend deployment
- Backend deployment
- Environment variables
- Production Supabase configuration
- Production Gemini configuration

---

## 46. Acceptance Criteria

### Authentication

- [ ] Signup works
- [ ] Login works
- [ ] Logout works
- [ ] Session persists
- [ ] Protected routes work
- [ ] Firebase is completely removed

### AI

- [ ] Topic generation works
- [ ] Notes generation works
- [ ] Programming generation works
- [ ] Vocabulary generation works
- [ ] Image generation works
- [ ] AI output is validated

### Database

- [ ] Supabase PostgreSQL works
- [ ] Profiles work
- [ ] Decks persist
- [ ] Cards persist
- [ ] Review history persists
- [ ] RLS is enabled

### Learning

- [ ] Flashcards flip
- [ ] Answer is displayed
- [ ] Again works
- [ ] Hard works
- [ ] Good works
- [ ] Easy works
- [ ] SM-2 works
- [ ] Due cards appear
- [ ] Review history works

### Decks

- [ ] Create
- [ ] Edit
- [ ] Delete
- [ ] Search
- [ ] Filter
- [ ] Share

### Quiz

- [ ] MCQ
- [ ] True/False
- [ ] Fill in blank
- [ ] Score

### Analytics

- [ ] Total cards
- [ ] Due cards
- [ ] Reviews
- [ ] Accuracy
- [ ] Streak
- [ ] Progress

### Technical

- [ ] Backend works
- [ ] API works
- [ ] Secrets are protected
- [ ] Responsive UI works
- [ ] Error states work
- [ ] Loading states work
- [ ] `npm run build` succeeds
- [ ] Documentation is complete

---

## 47. Final Product Architecture

```text
                           USER
                            │
                            ▼
                    ┌───────────────┐
                    │ React + Vite  │
                    └───────┬───────┘
                            │
                       REST / JSON
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Node + Express       │
                 │                     │
                 │ Auth Middleware     │
                 │ AI Services         │
                 │ Deck Services       │
                 │ Review Services     │
                 │ Quiz Services       │
                 │ Statistics          │
                 └─────────┬───────────┘
                           │
           ┌───────────────┼────────────────┐
           │               │                │
           ▼               ▼                ▼
      ┌──────────┐   ┌────────────┐   ┌───────────┐
      │ Supabase │   │  Gemini    │   │   SM-2    │
      │          │   │    API     │   │ Scheduler │
      │Postgres  │   │            │   │           │
      │Auth      │   │ Topic      │   │ Interval  │
      │Storage   │   │ Notes      │   │ Ease      │
      │          │   │ Image      │   │ Due Date  │
      └──────────┘   │ Vocabulary │   └───────────┘
                     │ Programming│
                     └────────────┘
```

---

## 48. Core Product Principle

> **Gemini creates the learning content, Supabase stores the learning state, and the SM-2 engine determines when the learner should see each card again.**

The complete learning loop is:

```text
             GENERATE
                 ↓
              ORGANIZE
                 ↓
               STUDY
                 ↓
                RATE
                 ↓
             SCHEDULE
                 ↓
              REVIEW
                 ↓
              ANALYZE
                 ↓
              IMPROVE
```

---

## 49. Final Requirement

The final application must be **one cohesive product**, not a collection of disconnected features.

Everything must connect:

```text
USER
 ↓
AUTHENTICATION
 ↓
DASHBOARD
 ↓
CREATE DECK
 ↓
AI GENERATION
 ↓
SUPABASE
 ↓
FLASHCARDS
 ↓
REVIEW
 ↓
SM-2
 ↓
DUE DATE
 ↓
REVIEW AGAIN
 ↓
STATISTICS
```

All generation modes:

- Topic
- Notes
- Programming
- Vocabulary
- Image

must ultimately create persistent flashcard decks that use the same review and spaced-repetition system.
