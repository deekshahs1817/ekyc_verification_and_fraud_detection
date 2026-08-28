from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.core.logging import logger

database_url = settings.DATABASE_URL
connect_args = {}

try:
    if database_url.startswith("postgresql"):
        # Test connecting to postgresql
        engine = create_engine(database_url, pool_pre_ping=True)
        # Attempt a test connection
        with engine.connect() as conn:
            pass
        logger.info("Connected successfully to PostgreSQL database.")
    else:
        engine = create_engine(database_url, connect_args={"check_same_thread": False})
except Exception as e:
    if settings.USE_SQLITE_FALLBACK:
        logger.warning(f"PostgreSQL connection failed ({e}). Falling back to SQLite: {settings.SQLITE_DB_URL}")
        database_url = settings.SQLITE_DB_URL
        engine = create_engine(database_url, connect_args={"check_same_thread": False})
    else:
        raise e

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
