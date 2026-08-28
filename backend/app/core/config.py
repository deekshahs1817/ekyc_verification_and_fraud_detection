import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, field_validator


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Powered eKYC & Fraud Detection Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", os.getenv("SECRET_KEY", "super-secret-production-jwt-key-replace-in-production-use-strong-entropy"))
    ALGORITHM: str = os.getenv("JWT_ALGORITHM", os.getenv("ALGORITHM", "HS256"))
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Google OAuth
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "992314878877-vvul89n1rol4ohtbkebhse4fs2npkgtn.apps.googleusercontent.com")

    # SMTP Configuration for Email OTP
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: Optional[str] = os.getenv("SMTP_USERNAME", None)
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD", None)
    SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", "noreply@ekyc-verification.ai")
    OTP_EXPIRE_MINUTES: int = 5
    MAX_OTP_ATTEMPTS: int = 5

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/ekyc_db"
    USE_SQLITE_FALLBACK: bool = True
    SQLITE_DB_URL: str = "sqlite:///./ekyc_app.db"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"
    ]

    # File Storage
    UPLOAD_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../uploads"))
    MAX_UPLOAD_SIZE_MB: int = 15

    # Thresholds
    CONFIDENCE_THRESHOLD_DOC: float = 0.85
    SIMILARITY_THRESHOLD_FACE: float = 0.70
    LIVENESS_THRESHOLD: float = 0.60
    TAMPER_ALERT_THRESHOLD: float = 0.45
    FRAUD_RISK_HIGH_THRESHOLD: float = 70.0
    FRAUD_RISK_MED_THRESHOLD: float = 30.0

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"


settings = Settings()

# Ensure directories exist
for subfolder in ["aadhaar", "pan", "utility", "selfies", "heatmaps", "reports", "fingerprints"]:
    os.makedirs(os.path.join(settings.UPLOAD_DIR, subfolder), exist_ok=True)
