import os
import shutil
import glob
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.kyc_record import KYCRecord, KYCStatus, RiskLevel
from app.models.audit_log import AuditLog
from app.core.config import settings
from app.services.report_service import PDFReportService
from app.core.logging import logger


def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Create Default Admin & Compliance Officer
        admin_email = "admin@ekyc.ai"
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                name="Compliance Officer Sarah",
                email=admin_email,
                password_hash=get_password_hash("Admin@123"),
                role=UserRole.ADMIN
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            logger.info(f"Created Admin user: {admin.email} (Password: Admin@123)")

        # 2. Create Default Customer User
        user_email = "user@ekyc.ai"
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            user = User(
                name="Nirupma Pushkarna",
                email=user_email,
                password_hash=get_password_hash("User@123"),
                role=UserRole.USER
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"Created Test User: {user.email} (Password: User@123)")

        # 3. Copy sample uploaded images to uploads directory
        sample_aadhaar_dest = os.path.join(settings.UPLOAD_DIR, "aadhaar", "sample_aadhaar.jpg")
        sample_selfie_dest = os.path.join(settings.UPLOAD_DIR, "selfies", "sample_selfie.jpg")

        user_upload_dir = "C:/Users/deeks/.gemini/antigravity/brain/54c6a083-9328-4e41-b401-057fadffb700/.user_uploaded"
        if os.path.exists(user_upload_dir):
            jpgs = glob.glob(os.path.join(user_upload_dir, "*.jpg"))
            if jpgs:
                shutil.copy(jpgs[0], sample_aadhaar_dest)
                shutil.copy(jpgs[0], sample_selfie_dest)
                logger.info(f"Copied user sample image to {sample_aadhaar_dest}")

        # 4. Create Sample KYC Records representing different tiers
        existing_records = db.query(KYCRecord).count()
        if existing_records == 0:
            # Record 1: Clean Approved Applicant
            rec1 = KYCRecord(
                user_id=user.id,
                entered_name="Nirupma Pushkarna",
                entered_dob="1951-08-15",
                entered_gender="Female",
                entered_phone="9876543210",
                entered_email="nirupma.pushkarna@example.com",
                entered_address="Flat 402, Shivalik Residency, Sector 14, Gurugram, Haryana",
                entered_occupation="Retired",
                entered_annual_income="500000 - 1000000",
                entered_aadhaar="871608138875",
                entered_pan="ABCDE1234F",
                ocr_name="NIRUPMA PUSHKARNA",
                ocr_dob="1951",
                ocr_phone="9876543210",
                ocr_address="Flat 402, Shivalik Residency, Sector 14, Gurugram, Haryana",
                ocr_aadhaar="871608138875",
                ocr_pan="ABCDE1234F",
                aadhaar_path=sample_aadhaar_dest if os.path.exists(sample_aadhaar_dest) else None,
                selfie_path=sample_selfie_dest if os.path.exists(sample_selfie_dest) else None,
                doc_type_detected="AADHAAR_CARD",
                doc_classification_confidence=0.96,
                aadhaar_checksum_valid=True,
                pan_format_valid=True,
                name_similarity=98.5,
                address_similarity=95.0,
                dob_match=True,
                phone_match=True,
                aadhaar_match=True,
                pan_match=True,
                consistency_score=97.0,
                face_score=94.2,
                liveness_score=91.5,
                tamper_score=6.2,
                blur_score=88.4,
                duplicate_flag=False,
                duplicate_count=0.0,
                aml_flag=False,
                aml_reasons=[],
                fraud_score=8.5,
                trust_score=91.5,
                risk_level=RiskLevel.LOW,
                status=KYCStatus.APPROVED,
                xai_risk_factors=[
                    {
                        "feature": "Document Authenticity",
                        "impact": "LOW",
                        "description": "Clean Verhoeff checksum and high text-embedding consistency.",
                        "contribution_score": 2.1
                    }
                ]
            )
            db.add(rec1)

            # Record 2: Medium Risk / Discrepancy Applicant
            rec2 = KYCRecord(
                user_id=user.id,
                entered_name="Rajesh Kumar Sharma",
                entered_dob="1988-12-04",
                entered_gender="Male",
                entered_phone="9123456789",
                entered_email="rajesh.sharma@example.com",
                entered_address="12B, Palm Street, Indiranagar, Bengaluru, Karnataka",
                entered_occupation="Consultant",
                entered_annual_income="1500000 - 2500000",
                entered_aadhaar="548912347890",
                entered_pan="BKPPS4432K",
                ocr_name="RAJESH K SHARMA",
                ocr_dob="1988",
                ocr_address="12B, Palm Grove, Bengaluru",
                ocr_aadhaar="548912347890",
                ocr_pan="BKPPS4432K",
                doc_type_detected="AADHAAR_CARD",
                doc_classification_confidence=0.92,
                aadhaar_checksum_valid=True,
                pan_format_valid=True,
                name_similarity=82.0,
                address_similarity=74.5,
                dob_match=True,
                phone_match=True,
                aadhaar_match=True,
                pan_match=True,
                consistency_score=78.0,
                face_score=64.0,
                liveness_score=72.0,
                tamper_score=38.0,
                blur_score=42.0,
                duplicate_flag=False,
                duplicate_count=0.0,
                aml_flag=False,
                aml_reasons=[],
                fraud_score=46.5,
                trust_score=53.5,
                risk_level=RiskLevel.MEDIUM,
                status=KYCStatus.UNDER_REVIEW,
                xai_risk_factors=[
                    {
                        "feature": "Facial Biometric Mismatch",
                        "impact": "MEDIUM",
                        "description": "Cosine similarity between document photo and live selfie is moderate (64.0% match).",
                        "contribution_score": 18.5
                    },
                    {
                        "feature": "Document Tampering",
                        "impact": "MEDIUM",
                        "description": "Moderate localized compression noise around name text.",
                        "contribution_score": 12.0
                    }
                ]
            )
            db.add(rec2)

            # Record 3: High Risk / Fraud Tamper Applicant
            rec3 = KYCRecord(
                user_id=user.id,
                entered_name="Vikramaditya Rao",
                entered_dob="2009-05-20",
                entered_gender="Male",
                entered_phone="9876543210",  # Duplicate phone
                entered_email="vikram.rao@shellcorp.com",
                entered_address="PO Box 4492, Offshore Building, Goa",
                entered_occupation="Student",
                entered_annual_income="> 10000000",
                entered_aadhaar="999988887777",
                entered_pan="ZZZZZ9999Z",
                ocr_name="VIKRAM RAO",
                ocr_dob="1995",
                ocr_aadhaar="999988887777",
                ocr_pan="ZZZZZ9999Z",
                doc_type_detected="PAN_CARD",
                doc_classification_confidence=0.88,
                aadhaar_checksum_valid=False,
                pan_format_valid=False,
                name_similarity=71.0,
                address_similarity=30.0,
                dob_match=False,
                phone_match=False,
                aadhaar_match=True,
                pan_match=True,
                consistency_score=42.0,
                face_score=38.0,
                liveness_score=44.0,
                tamper_score=84.5,
                blur_score=68.0,
                duplicate_flag=True,
                duplicate_count=1.0,
                duplicate_details={"duplicate_count": 1, "matches": [{"field": "Phone Number", "record_id": "rec1"}]},
                aml_flag=True,
                aml_reasons=[
                    "AML Alert: Minor applicant (Age 17 < 18 years). Legal guardian consent required.",
                    "AML Alert: Identity already linked to registered account (Phone: 9876543210).",
                    "AML Alert: Aadhaar number failed mathematical Verhoeff checksum algorithm.",
                    "AML Alert: Address contains high-risk / non-residential flag keyword 'PO BOX'.",
                    "AML Alert: Declared high annual income (> 10000000) incongruent with employment status (Student)."
                ],
                fraud_score=88.5,
                trust_score=11.5,
                risk_level=RiskLevel.HIGH,
                status=KYCStatus.REJECTED,
                xai_risk_factors=[
                    {
                        "feature": "Document Tampering",
                        "impact": "HIGH",
                        "description": "Image Error Level Analysis detected high digital manipulation residue (84.5% tamper confidence).",
                        "contribution_score": 38.0
                    },
                    {
                        "feature": "AML Policy Violation",
                        "impact": "HIGH",
                        "description": "Minor applicant and suspicious PO BOX address flags triggered.",
                        "contribution_score": 30.0
                    },
                    {
                        "feature": "Facial Biometric Mismatch",
                        "impact": "HIGH",
                        "description": "Cosine similarity between document photo and live selfie is low (38.0% match).",
                        "contribution_score": 22.0
                    }
                ]
            )
            db.add(rec3)
            db.commit()

            # Generate sample PDF reports
            try:
                PDFReportService.generate_kyc_report(rec1)
                PDFReportService.generate_kyc_report(rec2)
                PDFReportService.generate_kyc_report(rec3)
            except Exception as e:
                logger.warning(f"PDF generation error in seed: {e}")

            logger.info("Database successfully seeded with 3 realistic KYC records across all risk tiers.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
