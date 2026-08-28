import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.core.logging import logger

raw_db_url = os.getenv("DATABASE_URL", settings.DATABASE_URL)
if raw_db_url and raw_db_url.startswith("postgres://"):
    raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)

if raw_db_url and raw_db_url.startswith("postgresql"):
    try:
        engine = create_engine(
            raw_db_url,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,
            pool_recycle=300
        )
        with engine.connect() as conn:
            pass
        logger.info("Connected successfully to PostgreSQL database with connection pooling.")
    except Exception as e:
        if settings.USE_SQLITE_FALLBACK:
            logger.warning(f"PostgreSQL connection failed ({e}). Falling back to SQLite: {settings.SQLITE_DB_URL}")
            engine = create_engine(settings.SQLITE_DB_URL, connect_args={"check_same_thread": False})
        else:
            raise e
else:
    engine = create_engine(settings.SQLITE_DB_URL, connect_args={"check_same_thread": False})
    logger.info(f"Using high-speed SQLite database: {settings.SQLITE_DB_URL}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
