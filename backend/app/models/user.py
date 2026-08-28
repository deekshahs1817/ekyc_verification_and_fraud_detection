import uuid
from datetime import datetime, timezone
import enum
from sqlalchemy import Column, String, DateTime, Enum, Boolean, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class UserRole(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"
    COMPLIANCE_OFFICER = "COMPLIANCE_OFFICER"


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    name = Column(String(255), nullable=True)
    password_hash = Column(String(255), default="PASSWORDLESS_AUTH", nullable=True)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)

    # Authentication Provider & OAuth
    auth_provider = Column(String(50), default="EMAIL", nullable=False)  # EMAIL, GOOGLE, DEMO
    google_id = Column(String(255), nullable=True, index=True)
    profile_picture = Column(String(500), nullable=True)

    # Profile Completeness Status
    profile_completed = Column(Boolean, default=False, nullable=False)
    is_profile_complete = Column(Boolean, default=False, nullable=False)

    # Personal Information
    dob = Column(String(50), nullable=True)
    gender = Column(String(20), nullable=True)

    # Address Information
    house_number = Column(String(100), nullable=True)
    street = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)

    # Professional Information
    occupation = Column(String(100), nullable=True)
    annual_income = Column(String(50), nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    kyc_records = relationship("KYCRecord", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="recipient", cascade="all, delete-orphan")
