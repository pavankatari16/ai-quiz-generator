from sqlalchemy import Column, Integer, String, Text, DateTime
from .database import Base


class QuizDB(Base):
    """Database model for storing generated quizzes from Wikipedia articles."""
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False)
    title = Column(String, nullable=True)
    summary = Column(Text, nullable=True)
    sections = Column(Text, nullable=False)  # JSON string of section list
    key_entities = Column(Text, nullable=False)  # JSON string of entities
    scraped_content = Column(Text, nullable=False)
    raw_html = Column(Text, nullable=False)
    full_quiz_data = Column(Text, nullable=False)  # JSON string of quiz
    date_generated = Column(DateTime, nullable=False)
