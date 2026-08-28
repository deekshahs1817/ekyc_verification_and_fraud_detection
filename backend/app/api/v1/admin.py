from typing import Optional, List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.kyc_record import KYCRecord, KYCStatus, RiskLevel
from app.models.audit_log import AuditLog
from app.schemas.kyc import KYCRecordResponse
from app.schemas.admin import KYCReviewAction, AuditLogResponse
from app.services.report_service import PDFReportService
from app.services.audit_service import AuditService
from app.services.notification_service import NotificationService
from app.api.deps import get_current_admin_user

router = APIRouter(prefix="/admin", tags=["Admin & Compliance Portal"])


@router.get("/queue", response_model=List[KYCRecordResponse])
def get_compliance_review_queue(
    status_filter: Optional[str] = Query(None, description="DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED"),
    risk_filter: Optional[str] = Query(None, description="LOW, MEDIUM, HIGH"),
    search: Optional[str] = Query(None, description="Search by name, phone, Aadhaar, or PAN"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    query = db.query(KYCRecord)

    if status_filter:
        query = query.filter(KYCRecord.status == status_filter.upper())

    if risk_filter:
        query = query.filter(KYCRecord.risk_level == risk_filter.upper())

    if search:
        term = f"%{search}%"
        query = query.filter(
            (KYCRecord.entered_name.ilike(term)) |
            (KYCRecord.entered_phone.ilike(term)) |
            (KYCRecord.entered_aadhaar.ilike(term)) |
            (KYCRecord.entered_pan.ilike(term))
        )

    records = query.order_by(KYCRecord.created_at.desc()).offset(offset).limit(limit).all()
    for r in records:
        if r.user:
            r.user_email = r.user.email
    return records


@router.post("/record/{record_id}/review", response_model=KYCRecordResponse)
def perform_compliance_review_action(
    record_id: str,
    action_in: KYCReviewAction,
    request: Request,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    record = db.query(KYCRecord).filter(KYCRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="KYC record not found")

    old_status = record.status
    record.status = action_in.status
    record.review_notes = action_in.review_notes
    record.reviewer_id = admin_user.id
    record.reviewer_name = admin_user.name
    record.reviewed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(record)

    # Regenerate updated report with compliance decision
    try:
        PDFReportService.generate_kyc_report(record)
    except Exception:
        pass

    AuditService.log_action(
        db=db,
        action=f"COMPLIANCE_STATUS_UPDATE_{record.status.value}",
        user_id=admin_user.id,
        user_email=admin_user.email,
        ip_address=request.client.host if request.client else None,
        payload={
            "record_id": record.id,
            "old_status": str(old_status),
            "new_status": str(record.status),
            "notes": action_in.review_notes
        }
    )

    try:
        NotificationService.notify_review(db=db, record=record, reviewer=admin_user)
    except Exception as e:
        logger.error(f"Error sending review notification: {e}")

    if record.user:
        record.user_email = record.user.email

    return record


@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).offset(offset).limit(limit).all()
    return logs
