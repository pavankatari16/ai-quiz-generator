from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from . import scraper, llm_quiz_generator, crud
from .database import SessionLocal, init_db
from sqlalchemy.orm import Session
import uvicorn
import json
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="AI Wiki Quiz Generator",
    description="Generate quizzes from Wikipedia articles using AI",
    version="2.0"
)

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response Models
class GenerateRequest(BaseModel):
    url: str = Field(..., example="https://en.wikipedia.org/wiki/Alan_Turing")


class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: int
    explanation: str
    difficulty: str


class QuizOut(BaseModel):
    id: int
    url: str
    title: Optional[str]
    summary: Optional[str]
    key_entities: Dict[str, Any]
    sections: List[str]
    quiz: List[QuizQuestion]
    related_topics: List[str]
    date_generated: str


def get_db():
    """Dependency for database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _deserialize_response(quiz_obj) -> Dict[str, Any]:
    """Helper to convert DB record to API response with deserialized JSON fields."""
    return {
        "id": quiz_obj.id,
        "url": quiz_obj.url,
        "title": quiz_obj.title,
        "summary": quiz_obj.summary,
        "key_entities": json.loads(quiz_obj.key_entities),
        "sections": json.loads(quiz_obj.sections),
        "quiz": json.loads(quiz_obj.full_quiz_data).get("quiz", []),
        "related_topics": json.loads(quiz_obj.full_quiz_data).get("related_topics", []),
        "date_generated": str(quiz_obj.date_generated)
    }


@app.on_event("startup")
def on_startup():
    """Initialize database on startup."""
    init_db()


@app.get("/")
def root():
    """Welcome endpoint."""
    return {
        "message": "AI Wiki Quiz Generator API",
        "docs": "/docs",
        "version": "2.0"
    }


@app.post("/generate_quiz")
def generate_quiz(req: GenerateRequest, db: Session = Depends(get_db)):
    """
    Generate a quiz from a Wikipedia article.
    
    1. Scrapes the article
    2. Extracts summary, sections, entities
    3. Generates quiz using Gemini LLM
    4. Stores in database
    5. Returns full response
    """
    try:
        # Step 1: Scrape the article
        scraped = scraper.scrape_url(req.url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Scrape failed: {str(e)}")
    
    try:
        # Step 2: Generate quiz using LLM
        quiz_data = llm_quiz_generator.generate_quiz(
            article_text=scraped.get("clean_text", ""),
            summary=scraped.get("summary", ""),
            sections=scraped.get("sections", []),
            key_entities=scraped.get("key_entities", {}),
            article_title=scraped.get("title", "")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quiz generation failed: {str(e)}")
    
    try:
        # Step 3: Save to database
        date_generated = datetime.utcnow()
        quiz_obj = crud.create_quiz(
            db=db,
            url=req.url,
            title=scraped.get("title"),
            summary=scraped.get("summary", ""),
            sections=scraped.get("sections", []),
            key_entities=scraped.get("key_entities", {}),
            scraped_content=scraped.get("clean_text", ""),
            raw_html=scraped.get("raw_html", ""),
            full_quiz_data=quiz_data,
            date_generated=date_generated,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    # Return deserialized response
    return _deserialize_response(quiz_obj)


@app.get("/history")
def history(limit: int = 50, offset: int = 0, db: Session = Depends(get_db)):
    """
    Retrieve quiz history.
    
    Query Parameters:
    - limit: Number of quizzes to return (default 50)
    - offset: Pagination offset (default 0)
    """
    quizzes = crud.list_quizzes(db=db, limit=limit, offset=offset)
    return [_deserialize_response(q) for q in quizzes]


@app.get("/quiz/{quiz_id}")
def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    """Retrieve a specific quiz by ID."""
    q = crud.get_quiz(db=db, quiz_id=quiz_id)
    if not q:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return _deserialize_response(q)


if __name__ == "__main__":
    uvicorn.run(
        "backend.app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
