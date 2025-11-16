# AI Quiz Generator

This repo produces study quizzes from Wikipedia-style articles. The backend scrapes an article, creates a cleaned text bundle, asks a generative model (Google Gemini via LangChain) for multiple-choice questions, validates the JSON, and stores the result. The frontend (Vite + React + Tailwind) provides a simple UI to generate quizzes, view history, and take quizzes.

Summary
-------
- Backend: FastAPI, SQLAlchemy, BeautifulSoup, LangChain + Gemini (optional).
- Frontend: Vite + React + Tailwind, Axios for API calls.
- Storage: SQLite by default (DEV). JSON-like fields are stored as TEXT to stay compatible with different SQL engines.

Features
--------
- Scraper extracts: `title` (fallback to `<h1>`), `summary` (first 3–6 lead sentences), `sections` (H2 headings), `clean_text`, and `raw_html`.
- Deterministic entity extraction: `people` (repeated proper nouns), `organizations` (matches like "University", "Institute", "Company"), `locations` (simple lookup/regex).
- LLM integration via LangChain (Gemini) with JSON validation and a safe fallback when the key or API is unavailable.
- Storage: SQLAlchemy-based model stores JSON fields as `Text` for cross-engine compatibility.
- Frontend includes a "Take Quiz" mode: hide answers, submit responses, score and retry.

Project layout
--------------
```
ai-quiz-generator/
├── backend/                # FastAPI app and Python modules
├── frontend/               # Vite + React + Tailwind app
├── sample_data/            # Example JSON outputs
└── README.md
```

Backend setup (detailed)
------------------------
1. Create a venv and install dependencies:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Configure environment (copy example and edit):

```bash
cp .env.example .env
# Edit .env to set DATABASE_URL and GEMINI_API_KEY if needed
```

3. Run the server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

4. Open API docs: `http://127.0.0.1:8000/docs`

Frontend setup (detailed)
-------------------------
1. Install dependencies and run Vite:

```bash
cd frontend
npm install
npm run dev
```

2. Visit the local address Vite prints (commonly `http://localhost:3000`).

3. To change the backend URL, set `VITE_API_URL` in `frontend/.env`.

API Reference & Examples
------------------------
POST /generate_quiz
- Body: `{ "url": "https://en.wikipedia.org/wiki/Alan_Turing" }`
- Response: JSON object with keys: `id, url, title, summary, sections, key_entities, quiz, related_topics`

cURL example:

```bash
curl -X POST http://127.0.0.1:8000/generate_quiz \
  -H "Content-Type: application/json" \
  -d '{"url":"https://en.wikipedia.org/wiki/Alan_Turing"}'
```

GET /history
- Returns paginated list of quizzes: `limit` and `offset` query params supported.

cURL example:

```bash
curl "http://127.0.0.1:8000/history?limit=20&offset=0"
```

GET /quiz/{id}
- Returns a single quiz record by ID.

cURL example:

```bash
curl http://127.0.0.1:8000/quiz/1
```

Architecture notes
------------------
- `scraper.py`: fetches article with browser-like headers, extracts title/h1, lead sentences for summary, all H2 headings, and a cleaned text body with reference markers removed.
- `llm_quiz_generator.py`: builds the prompt containing only the article's cleaned content + summary and sections; asks Gemini to return JSON-only; extracts JSON blocks and runs `json.loads()` for validation; if invalid, uses a fallback quiz generator.
- `crud.py`: serializes lists/dicts into JSON strings (`json.dumps`) before saving; deserializes on reading.
- `models.py`: uses `Text` columns for JSON fields to preserve compatibility with SQLite and other databases.

Sample output (abridged)
------------------------
Full samples are in `sample_data/sample_outputs/`.

```json
{
  "id": 1,
  "url": "https://en.wikipedia.org/wiki/Alan_Turing",
  "title": "Alan Turing",
  "summary": "Alan Mathison Turing was an English mathematician...",
  "sections": ["Early life", "Career", "Legacy"],
  "key_entities": { "people": ["Alan Turing"], "organizations": ["University of Manchester"], "locations": ["United Kingdom"] },
  "quiz": [
    { "question": "Where did Turing work during WWII?", "options": ["MIT","Bletchley Park","Cambridge","Oxford"], "correct_answer": 1, "explanation": "...", "difficulty": "Easy" }
  ],
  "related_topics": ["Cryptanalysis"]
}
```

Screenshots (placeholders)
-------------------------
- `screenshots/generate-quiz.png` — Generate tab
- `screenshots/take-quiz.png` — Take Quiz mode
- `screenshots/history-modal.png` — History details modal

Deployment (frontend -> Vercel)
-------------------------------
1. Push your repo to GitHub.
2. Import the project in Vercel and set the root to `/frontend`.
3. Add `VITE_API_URL` (or legacy `REACT_APP_API_URL`) in Vercel env settings.
4. Vercel will run `npm install` and `npm run build` and publish.

Troubleshooting
---------------
- 403 errors: the scraper sets a common browser User-Agent; if errors persist, try another article or test connectivity from the container.
- LLM failures: verify `GEMINI_API_KEY` and quotas; fallback generator works without a key for testing.
- DB/connection errors: ensure `DATABASE_URL` is correct and reachable for Postgres.
- CORS: backend uses permissive CORS for dev; lock origins in `main.py` for production.

Notes for reviewers
-------------------
- JSON stored as text for portability.
- The code leans toward clarity and maintainability; helper functions are kept small.

If you want a shorter quickstart or an exported OpenAPI file, I can add those as separate files.
