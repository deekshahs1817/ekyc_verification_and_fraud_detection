import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Boolean, Integer
from app.core.database import Base


class OTP(Base):
    __tablename__ = "otps"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), index=True, nullable=False)
    otp_hash = Column(String(255), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False, nullable=False)
    attempt_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
