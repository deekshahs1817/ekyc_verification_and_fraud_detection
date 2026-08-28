from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.core.logging import logger

if settings.USE_SQLITE_FALLBACK or not settings.DATABASE_URL.startswith("postgresql"):
    database_url = settings.SQLITE_DB_URL
    engine = create_engine(database_url, connect_args={"check_same_thread": False})
    logger.info(f"Using high-speed SQLite database: {database_url}")
else:
    try:
        database_url = settings.DATABASE_URL
        engine = create_engine(database_url, pool_pre_ping=True)
        with engine.connect() as conn:
            pass
        logger.info("Connected successfully to PostgreSQL database.")
    except Exception as e:
        logger.warning(f"PostgreSQL connection failed ({e}). Falling back to SQLite: {settings.SQLITE_DB_URL}")
        database_url = settings.SQLITE_DB_URL
        engine = create_engine(database_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
