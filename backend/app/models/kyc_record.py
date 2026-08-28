import uuid
from datetime import datetime, timezone
import enum
from sqlalchemy import Column, String, Float, Boolean, DateTime, Enum, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class KYCStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    ACTION_REQUIRED = "ACTION_REQUIRED"


class RiskLevel(str, enum.Enum):
    LOW = "LOW"        # Fraud Score 0 - 30
    MEDIUM = "MEDIUM"  # Fraud Score 31 - 70
    HIGH = "HIGH"      # Fraud Score 71 - 100


class KYCRecord(Base):
    __tablename__ = "kyc_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # 1. User Ground Truth (Manually Entered Data)
    entered_name = Column(String(255), nullable=True)
    entered_dob = Column(String(50), nullable=True)
    entered_gender = Column(String(20), nullable=True)
    entered_phone = Column(String(20), nullable=True, index=True)
    entered_email = Column(String(255), nullable=True)
    entered_address = Column(Text, nullable=True)
    entered_occupation = Column(String(100), nullable=True)
    entered_annual_income = Column(String(50), nullable=True)
    entered_aadhaar = Column(String(20), nullable=True, index=True)
    entered_pan = Column(String(20), nullable=True, index=True)

    # 2. OCR Extracted Data
    ocr_name = Column(String(255), nullable=True)
    ocr_dob = Column(String(50), nullable=True)
    ocr_phone = Column(String(20), nullable=True)
    ocr_address = Column(Text, nullable=True)
    ocr_aadhaar = Column(String(20), nullable=True)
    ocr_pan = Column(String(20), nullable=True)
    ocr_raw_text = Column(Text, nullable=True)
    ocr_details = Column(JSON, nullable=True)

    # 3. Document File Storage Paths
    aadhaar_path = Column(String(500), nullable=True)
    pan_path = Column(String(500), nullable=True)
    utility_path = Column(String(500), nullable=True)
    selfie_path = Column(String(500), nullable=True)
    tamper_heatmap_path = Column(String(500), nullable=True)
    report_pdf_path = Column(String(500), nullable=True)

    # 4. AI & ML Pipeline Scores (0.0 to 100.0)
    doc_type_detected = Column(String(50), nullable=True)
    doc_classification_confidence = Column(Float, default=0.0)
    aadhaar_checksum_valid = Column(Boolean, default=False)
    pan_format_valid = Column(Boolean, default=False)

    name_similarity = Column(Float, default=0.0)
    address_similarity = Column(Float, default=0.0)
    dob_match = Column(Boolean, default=False)
    phone_match = Column(Boolean, default=False)
    aadhaar_match = Column(Boolean, default=False)
    pan_match = Column(Boolean, default=False)
    consistency_score = Column(Float, default=0.0)

    face_score = Column(Float, default=0.0)
    liveness_score = Column(Float, default=0.0)
    tamper_score = Column(Float, default=0.0)
    blur_score = Column(Float, default=0.0)

    # 5. Deduplication & AML Rule Signals
    duplicate_flag = Column(Boolean, default=False)
    duplicate_count = Column(Float, default=0.0)
    duplicate_details = Column(JSON, default=dict)

    aml_flag = Column(Boolean, default=False)
    aml_reasons = Column(JSON, default=list)

    # 6. Ensemble Fraud, Trust & Risk Classification
    fraud_score = Column(Float, default=0.0)  # 0-30 Low, 31-70 Med, 71-100 High
    trust_score = Column(Float, default=100.0)
    risk_level = Column(Enum(RiskLevel), default=RiskLevel.LOW)
    status = Column(Enum(KYCStatus), default=KYCStatus.SUBMITTED)

    # 7. Explainable AI (SHAP / Feature Attribution Factors)
    xai_risk_factors = Column(JSON, default=list)  # Top contributing reasons

    # 8. Compliance Review & Audit
    reviewer_id = Column(String(36), nullable=True)
    reviewer_name = Column(String(255), nullable=True)
    review_notes = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="kyc_records")
