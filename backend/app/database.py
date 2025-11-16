from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

load_dotenv()

# Read DATABASE_URL from .env; fallback to a local sqlite file for easy testing
DATABASE_URL = os.getenv("DATABASE_URL") or "sqlite:///./dev.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def init_db():
    """Create tables. Call on startup if you want to ensure tables exist."""
    Base.metadata.create_all(bind=engine)
