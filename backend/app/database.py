import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

DEFAULT_SQLITE_URL = "sqlite:///./queuedb.db"


def _create_engine(database_url: str):
    engine_kwargs = {"pool_pre_ping": True}
    if database_url.startswith("sqlite"):
        engine_kwargs["connect_args"] = {"check_same_thread": False}
    return create_engine(database_url, **engine_kwargs)


DATABASE_URL = os.getenv("DATABASE_URL") or DEFAULT_SQLITE_URL

engine = _create_engine(DATABASE_URL)

if DATABASE_URL != DEFAULT_SQLITE_URL:
    try:
        with engine.connect():
            pass
    except OperationalError:
        logger.warning(
            "DATABASE_URL is unreachable; falling back to local SQLite at %s",
            DEFAULT_SQLITE_URL,
        )
        DATABASE_URL = DEFAULT_SQLITE_URL
        engine = _create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
