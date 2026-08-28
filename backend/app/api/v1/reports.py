import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Header
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.core.database import get_db
from app.core.config import settings
from app.models.user import User, UserRole
from app.models.kyc_record import KYCRecord
from app.services.report_service import PDFReportService
from app.api.deps import oauth2_scheme

router = APIRouter(prefix="/reports", tags=["Verification Reports"])


def get_current_user_flexible(
    token_query: Optional[str] = Query(None, alias="token"),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """
    Authenticates user from either Authorization header OR ?token= query parameter.
    Allows browser window.open and direct PDF downloads.
    """
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    elif token_query:
        token = token_query

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing. Please provide token header or ?token= query parameter.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token subject")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User account not found")

    return user


@router.get("/download/{record_id}")
def download_kyc_report(
    record_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_flexible)
):
    record = db.query(KYCRecord).filter(KYCRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="KYC Record not found")

    role_val = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    if record.user_id != current_user.id and role_val not in ["ADMIN", "COMPLIANCE_OFFICER"]:
        raise HTTPException(status_code=403, detail="Unauthorized access to this compliance report")

    # Generate if not exists
    if not record.report_pdf_path or not os.path.exists(record.report_pdf_path):
        record.report_pdf_path = PDFReportService.generate_kyc_report(record)
        db.commit()

    return FileResponse(
        path=record.report_pdf_path,
        filename=f"KYC_Compliance_Report_{record.id[:8]}.pdf",
        media_type="application/pdf"
    )
