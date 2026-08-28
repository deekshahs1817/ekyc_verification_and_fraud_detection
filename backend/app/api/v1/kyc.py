import os
import uuid
import shutil
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.models.user import User
from app.models.kyc_record import KYCRecord, KYCStatus, RiskLevel
from app.schemas.kyc import KYCRecordResponse
from app.services.ai.pipeline import kyc_ai_pipeline
from app.services.report_service import PDFReportService
from app.services.audit_service import AuditService
from app.services.notification_service import NotificationService
from app.api.deps import get_current_user
from app.core.logging import logger

router = APIRouter(prefix="/kyc", tags=["KYC Submission & Processing"])


def save_upload_file(upload_file: UploadFile, subfolder: str) -> str:
    folder = os.path.join(settings.UPLOAD_DIR, subfolder)
    os.makedirs(folder, exist_ok=True)
    extension = os.path.splitext(upload_file.filename)[1] or ".jpg"
    unique_filename = f"{uuid.uuid4()}{extension}"
    file_path = os.path.join(folder, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    return file_path


@router.post("/submit", response_model=KYCRecordResponse, status_code=status.HTTP_201_CREATED)
def submit_kyc_verification(
    request: Request,
    entered_name: str = Form(...),
    entered_dob: str = Form(...),
    entered_gender: str = Form(...),
    entered_phone: Optional[str] = Form(None),
    entered_email: str = Form(...),
    entered_address: Optional[str] = Form(None),
    entered_occupation: str = Form("Employed"),
    entered_annual_income: str = Form("500000 - 1000000"),
    entered_aadhaar: str = Form(...),
    entered_pan: Optional[str] = Form(None),
    aadhaar_file: Optional[UploadFile] = File(None),
    pan_file: Optional[UploadFile] = File(None),
    utility_file: Optional[UploadFile] = File(None),
    selfie_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submits user ground truth form and uploaded documents, then triggers full AI analysis pipeline.
    """
    logger.info(f"Processing KYC submission for user: {current_user.email}")

    # 1. Save uploaded documents
    doc_paths = {
        "aadhaar_path": None,
        "pan_path": None,
        "utility_path": None,
        "selfie_path": None
    }

    if aadhaar_file and aadhaar_file.filename:
        doc_paths["aadhaar_path"] = save_upload_file(aadhaar_file, "aadhaar")
    if pan_file and pan_file.filename:
        doc_paths["pan_path"] = save_upload_file(pan_file, "pan")
    if utility_file and utility_file.filename:
        doc_paths["utility_path"] = save_upload_file(utility_file, "utility")
    if selfie_file and selfie_file.filename:
        doc_paths["selfie_path"] = save_upload_file(selfie_file, "selfies")

    # If no selfie was uploaded, create a duplicate of document face for fallback testing
    if not doc_paths["selfie_path"] and doc_paths["aadhaar_path"]:
        doc_paths["selfie_path"] = doc_paths["aadhaar_path"]

    # 2. Structure Form Data
    form_data = {
        "entered_name": entered_name,
        "entered_dob": entered_dob,
        "entered_gender": entered_gender,
        "entered_phone": entered_phone,
        "entered_email": entered_email,
        "entered_address": entered_address,
        "entered_occupation": entered_occupation,
        "entered_annual_income": entered_annual_income,
        "entered_aadhaar": entered_aadhaar,
        "entered_pan": entered_pan
    }

    # 3. Run AI Pipeline
    pipeline_results = kyc_ai_pipeline.run_full_pipeline(
        db=db,
        user_id=current_user.id,
        form_data=form_data,
        doc_paths=doc_paths
    )

    # 4. Save KYC Record in DB
    ocr_extracted = pipeline_results["ocr_extracted"]
    consistency = pipeline_results["consistency"]
    duplicate = pipeline_results["duplicate"]
    aml = pipeline_results["aml"]

    kyc_record = KYCRecord(
        user_id=current_user.id,
        # Entered Data
        entered_name=entered_name,
        entered_dob=entered_dob,
        entered_gender=entered_gender,
        entered_phone=entered_phone,
        entered_email=entered_email,
        entered_address=entered_address,
        entered_occupation=entered_occupation,
        entered_annual_income=entered_annual_income,
        entered_aadhaar=entered_aadhaar,
        entered_pan=entered_pan,
        # OCR Extracted Data
        ocr_name=ocr_extracted.get("name"),
        ocr_dob=ocr_extracted.get("dob"),
        ocr_phone=ocr_extracted.get("phone"),
        ocr_address=ocr_extracted.get("address"),
        ocr_aadhaar=ocr_extracted.get("aadhaar"),
        ocr_pan=ocr_extracted.get("pan"),
        ocr_raw_text=pipeline_results.get("raw_ocr_text"),
        ocr_details=pipeline_results.get("ocr_details"),
        # File Paths
        aadhaar_path=doc_paths["aadhaar_path"],
        pan_path=doc_paths["pan_path"],
        utility_path=doc_paths["utility_path"],
        selfie_path=doc_paths["selfie_path"],
        tamper_heatmap_path=pipeline_results.get("tamper_heatmap_path"),
        # AI Scores
        doc_type_detected=pipeline_results["doc_type_detected"],
        doc_classification_confidence=pipeline_results["doc_classification_confidence"],
        aadhaar_checksum_valid=pipeline_results["aadhaar_checksum_valid"],
        pan_format_valid=pipeline_results["pan_format_valid"],
        name_similarity=consistency["name_similarity"],
        address_similarity=consistency["address_similarity"],
        dob_match=consistency["dob_match"],
        phone_match=consistency["phone_match"],
        aadhaar_match=consistency["aadhaar_match"],
        pan_match=consistency["pan_match"],
        consistency_score=consistency["consistency_score"],
        face_score=pipeline_results["face_score"],
        liveness_score=pipeline_results["liveness_score"],
        tamper_score=pipeline_results["tamper_score"],
        blur_score=pipeline_results["blur_score"],
        # Deduplication & AML
        duplicate_flag=duplicate["duplicate_flag"],
        duplicate_count=float(duplicate["duplicate_count"]),
        duplicate_details=duplicate,
        aml_flag=aml["aml_flag"],
        aml_reasons=aml["aml_reasons"],
        # Risk & Status
        fraud_score=pipeline_results["fraud_score"],
        trust_score=pipeline_results["trust_score"],
        risk_level=pipeline_results["risk_level"],
        status=KYCStatus.UNDER_REVIEW,
        xai_risk_factors=pipeline_results["xai_risk_factors"]
    )

    db.add(kyc_record)
    db.commit()
    db.refresh(kyc_record)

    # 5. Generate PDF Report immediately
    try:
        report_path = PDFReportService.generate_kyc_report(kyc_record)
        kyc_record.report_pdf_path = report_path
        db.commit()
        db.refresh(kyc_record)
    except Exception as e:
        logger.error(f"Error generating PDF report: {e}")

    # 6. Audit Log
    AuditService.log_action(
        db=db,
        action="KYC_SUBMITTED_AND_ANALYZED",
        user_id=current_user.id,
        user_email=current_user.email,
        ip_address=request.client.host if request.client else None,
        payload={
            "record_id": kyc_record.id,
            "fraud_score": kyc_record.fraud_score,
            "trust_score": kyc_record.trust_score,
            "status": str(kyc_record.status)
        }
    )

    # 7. Notifications (Notify Applicant & Compliance Admins)
    try:
        NotificationService.notify_submission(db=db, record=kyc_record, user=current_user)
    except Exception as e:
        logger.error(f"Error sending submission notification: {e}")

    return kyc_record


@router.get("/my-records", response_model=List[KYCRecordResponse])
def get_user_kyc_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    records = db.query(KYCRecord).filter(KYCRecord.user_id == current_user.id).order_by(KYCRecord.created_at.desc()).all()
    for r in records:
        if r.user:
            r.user_email = r.user.email
    return records


@router.get("/record/{record_id}", response_model=KYCRecordResponse)
def get_single_kyc_record(
    record_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = db.query(KYCRecord).filter(KYCRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="KYC record not found")

    # Authorize user or admin
    if record.user_id != current_user.id and current_user.role.value not in ["ADMIN", "COMPLIANCE_OFFICER"]:
        raise HTTPException(status_code=403, detail="Unauthorized access to this record")

    if record.user:
        record.user_email = record.user.email

    return record
