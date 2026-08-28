from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.models.kyc_record import KYCStatus, RiskLevel


class XAIRiskFactor(BaseModel):
    feature: str
    impact: str  # "HIGH", "MEDIUM", "LOW"
    description: str
    contribution_score: float  # percentage or SHAP value


class KYCFormSubmit(BaseModel):
    entered_name: str = Field(..., min_length=2, max_length=255)
    entered_dob: str = Field(..., description="YYYY-MM-DD or DD/MM/YYYY")
    entered_gender: str = Field(..., description="Male / Female / Other")
    entered_phone: Optional[str] = None
    entered_email: str
    entered_address: Optional[str] = None
    entered_occupation: Optional[str] = "Employed"
    entered_annual_income: Optional[str] = "500000 - 1000000"
    entered_aadhaar: str = Field(..., min_length=12, max_length=14)
    entered_pan: Optional[str] = None


class KYCRecordResponse(BaseModel):
    id: str
    user_id: str
    user_email: Optional[str] = None

    # Entered Data
    entered_name: Optional[str]
    entered_dob: Optional[str]
    entered_gender: Optional[str]
    entered_phone: Optional[str]
    entered_email: Optional[str]
    entered_address: Optional[str]
    entered_occupation: Optional[str]
    entered_annual_income: Optional[str]
    entered_aadhaar: Optional[str]
    entered_pan: Optional[str]

    # OCR Extracted Data
    ocr_name: Optional[str]
    ocr_dob: Optional[str]
    ocr_phone: Optional[str]
    ocr_address: Optional[str]
    ocr_aadhaar: Optional[str]
    ocr_pan: Optional[str]
    ocr_raw_text: Optional[str]
    ocr_details: Optional[Dict[str, Any]] = None

    # Paths
    aadhaar_path: Optional[str]
    pan_path: Optional[str]
    utility_path: Optional[str]
    selfie_path: Optional[str]
    tamper_heatmap_path: Optional[str]
    report_pdf_path: Optional[str]

    # AI Pipeline Scores
    doc_type_detected: Optional[str]
    doc_classification_confidence: float
    aadhaar_checksum_valid: bool
    pan_format_valid: bool

    name_similarity: float
    address_similarity: float
    dob_match: bool
    phone_match: bool
    aadhaar_match: bool
    pan_match: bool
    consistency_score: float

    face_score: float
    liveness_score: float
    tamper_score: float
    blur_score: float

    # Deduplication & AML
    duplicate_flag: bool
    duplicate_count: float
    duplicate_details: Optional[Dict[str, Any]]
    aml_flag: bool
    aml_reasons: Optional[List[str]]

    # Fraud & Trust
    fraud_score: float
    trust_score: float
    risk_level: RiskLevel
    status: KYCStatus

    # Explainable AI
    xai_risk_factors: Optional[List[Dict[str, Any]]]

    # Review metadata
    reviewer_id: Optional[str]
    reviewer_name: Optional[str]
    review_notes: Optional[str]
    reviewed_at: Optional[datetime]

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
