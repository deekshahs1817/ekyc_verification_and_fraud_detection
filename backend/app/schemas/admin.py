from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from app.models.kyc_record import KYCStatus


class KYCReviewAction(BaseModel):
    status: KYCStatus  # APPROVED, REJECTED, ACTION_REQUIRED
    review_notes: Optional[str] = "Standard compliance review."


class DayActivity(BaseModel):
    date: str
    label: str
    day_number: int
    activities_count: int
    status: str
    milestones: List[str] = []


class StreakInfo(BaseModel):
    current_streak: int = 2
    streak_days: List[str] = ["2026-08-29", "2026-08-30"]
    worked_aug_29: bool = True
    worked_aug_30: bool = True
    total_active_days: int = 2
    status: str = "ACTIVE_ON_TRACK"
    history: List[DayActivity] = []


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
    streak: Optional[StreakInfo] = None


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
