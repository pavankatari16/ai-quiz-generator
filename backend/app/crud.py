import json
from . import models


def create_quiz(
    db,
    url: str,
    title: str,
    summary: str,
    sections: list,
    key_entities: dict,
    scraped_content: str,
    raw_html: str,
    full_quiz_data: dict,
    date_generated
):
    """
    Create a new quiz record in the database.
    
    Converts list and dict fields to JSON strings before storing.
    """
    quiz = models.QuizDB(
        url=url,
        title=title,
        summary=summary,
        sections=json.dumps(sections),  # Convert to JSON string
        key_entities=json.dumps(key_entities),  # Convert to JSON string
        scraped_content=scraped_content,
        raw_html=raw_html,
        full_quiz_data=json.dumps(full_quiz_data),  # Convert to JSON string
        date_generated=date_generated,
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)
    return quiz


def get_quiz(db, quiz_id: int):
    """Fetch a single quiz by ID, deserializing JSON fields."""
    return db.query(models.QuizDB).filter(models.QuizDB.id == quiz_id).first()


def list_quizzes(db, limit: int = 50, offset: int = 0):
    """Fetch multiple quizzes with pagination, ordered by date descending."""
    return db.query(models.QuizDB).order_by(
        models.QuizDB.date_generated.desc()
    ).offset(offset).limit(limit).all()
