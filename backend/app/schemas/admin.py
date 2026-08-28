from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from app.models.kyc_record import KYCStatus


class KYCReviewAction(BaseModel):
    status: KYCStatus  # APPROVED, REJECTED, ACTION_REQUIRED
    review_notes: Optional[str] = "Standard compliance review."


class AdminDashboardStats(BaseModel):
    total_records: int
    pending_count: int
    under_review_count: int
    approved_count: int
    rejected_count: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    average_fraud_score: float
    average_trust_score: float
    recent_aml_alerts: int
    duplicate_identity_count: int


class AuditLogResponse(BaseModel):
    id: str
    user_id: Optional[str]
    user_email: Optional[str]
    action: str
    ip_address: Optional[str]
    user_agent: Optional[str]
    payload: Optional[Dict[str, Any]]
    timestamp: datetime

    class Config:
        from_attributes = True
