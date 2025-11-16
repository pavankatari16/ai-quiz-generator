# Backend Setup Guide

Complete setup instructions for the AI Quiz Generator FastAPI backend.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Running the Server](#running-the-server)
5. [API Documentation](#api-documentation)
6. [Database Setup](#database-setup)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

- **Python 3.9 or higher** ([Download](https://www.python.org/downloads/))
- **pip** (included with Python)
- **Git** (for cloning the repository)
- **Gemini API Key** (optional, for AI quiz generation) - [Get API Key](https://console.cloud.google.com/)

### Verify Installation

```bash
python --version
pip --version
```

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/pavankatari16/ai-quiz-generator.git
cd ai-quiz-generator
```

### 2. Navigate to Backend Directory

```bash
cd backend/app
```

### 3. Create Virtual Environment (Recommended)

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

**What gets installed:**
- `fastapi` - Web framework
- `uvicorn[standard]` - ASGI server
- `sqlalchemy` - ORM for database
- `psycopg2-binary` - PostgreSQL adapter
- `pydantic` - Data validation
- `requests` - HTTP library for scraping
- `beautifulsoup4` - HTML parsing
- `python-dotenv` - Environment variables
- `langchain-core` - LLM framework
- `langchain-community` - LLM community integrations
- `langchain-google-genai` - Google Gemini integration

## Configuration

### 1. Create .env File

Copy the example env file:

```bash
cp .env.example .env
```

### 2. Edit .env

Open `.env` and configure:

```env
# SQLite (default, no setup needed)
DATABASE_URL=sqlite:///./dev.db

# OR PostgreSQL (if using Postgres)
# DATABASE_URL=postgresql://user:password@localhost:5432/quiz_generator

# Gemini API Key (optional, for AI quiz generation)
# Get free key from: https://console.cloud.google.com/
GEMINI_API_KEY=your_gemini_api_key_here
```

### Database Setup

#### Using SQLite (Easiest for Development)
No setup needed! The backend automatically creates `dev.db` on first run.

#### Using PostgreSQL (Recommended for Production)

1. Install PostgreSQL: https://www.postgresql.org/download/
2. Create database:
   ```bash
   createdb quiz_generator
   ```
3. Update `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/quiz_generator
   ```

## Running the Server

### Development Mode (with auto-reload)

```bash
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

**Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### Production Mode

```bash
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Verify Server is Running

Open browser to: http://localhost:8000

You should see a welcome page or FastAPI documentation.

## API Documentation

### Interactive API Docs (Swagger UI)

Once the server is running, visit:
```
http://localhost:8000/docs
```

You can test all endpoints directly from the browser!

### Alternative API Docs (ReDoc)

```
http://localhost:8000/redoc
```

## API Endpoints

### 1. Generate Quiz

**Endpoint:** `POST /generate_quiz`

**Request:**
```bash
curl -X POST "http://localhost:8000/generate_quiz" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://en.wikipedia.org/wiki/Alan_Turing"}'
```

**Response:**
```json
{
  "id": 1,
  "url": "https://en.wikipedia.org/wiki/Alan_Turing",
  "title": "Alan Turing - Wikipedia",
  "date_generated": "2025-11-16T10:30:45.123456",
  "full_quiz_data": {
    "title": "Generated Quiz",
    "questions": [...]
  }
}
```

### 2. Get History

**Endpoint:** `GET /history`

**Query Parameters:**
- `limit` (int, default 50) - Number of quizzes to return
- `offset` (int, default 0) - Pagination offset

**Request:**
```bash
curl "http://localhost:8000/history?limit=10&offset=0"
```

**Response:**
```json
[
  {
    "id": 1,
    "url": "...",
    "title": "...",
    "date_generated": "...",
    "full_quiz_data": {...}
  },
  ...
]
```

### 3. Get Specific Quiz

**Endpoint:** `GET /quiz/{quiz_id}`

**Request:**
```bash
curl "http://localhost:8000/quiz/1"
```

**Response:**
```json
{
  "id": 1,
  "url": "...",
  "title": "...",
  "date_generated": "...",
  "full_quiz_data": {...}
}
```

## Project Structure

```
backend/app/
├── database.py          # SQLAlchemy setup
├── models.py            # QuizDB ORM model
├── scraper.py           # Web scraper (requests + BeautifulSoup)
├── llm_quiz_generator.py # LLM integration (LangChain + Gemini)
├── crud.py              # Database operations
├── main.py              # FastAPI application
└── requirements.txt     # Python dependencies
```

### Key Files Explained

**database.py**
- Creates SQLAlchemy engine
- Configures database connection
- Provides SessionLocal for database access

**models.py**
- Defines QuizDB table schema
- Fields: id, url, title, date_generated, scraped_content, raw_html, full_quiz_data

**scraper.py**
- Fetches article content using requests
- Parses HTML with BeautifulSoup
- Returns: title, clean_text, raw_html

**llm_quiz_generator.py**
- Integrates Google Gemini via LangChain
- Falls back to mock generator if LLM unavailable
- Returns quiz JSON structure

**crud.py**
- Database operations: create, read, list quizzes
- Handles JSON serialization/deserialization

**main.py**
- FastAPI application
- Defines endpoints: /generate_quiz, /history, /quiz/{id}
- Handles requests and responses

## Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'fastapi'"

**Solution:**
```bash
pip install -r requirements.txt
```

### Issue: Port 8000 Already in Use

**Solution:** Use a different port:
```bash
uvicorn backend.app.main:app --reload --port 8001
```

### Issue: Database File Not Found

**Solution:** The database file is created automatically. Check the directory has write permissions:
```bash
ls -la dev.db
```

### Issue: Gemini API Errors

**Solutions:**
1. Verify API key is valid in `.env`
2. Check quota: https://console.cloud.google.com/
3. The backend falls back to mock generator automatically

### Issue: Web Scraping Returns 403 Forbidden

**Solution:** Some websites block scraping. The backend includes a browser User-Agent header. Try a different URL.

### Issue: Database Connection Error (PostgreSQL)

**Solution:** Verify PostgreSQL is running and connection string is correct:
```bash
psql -U postgres -d quiz_generator
```

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | No | `sqlite:///./dev.db` | Database connection string |
| `GEMINI_API_KEY` | No | None | Google Gemini API key for LLM |

## Next Steps

1. **Start the backend:** `uvicorn backend.app.main:app --reload`
2. **Test endpoints:** Visit http://localhost:8000/docs
3. **Setup frontend:** See [../frontend/README.md](../frontend/README.md)
4. **Deploy:** See [Deployment Guide](#deployment)

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Open an issue on GitHub
3. Check API docs at http://localhost:8000/docs

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/)
- [LangChain Documentation](https://python.langchain.com/)
- [Google Gemini API](https://ai.google.dev/)
