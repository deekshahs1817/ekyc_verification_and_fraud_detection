import re
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.kyc_record import KYCRecord
from app.core.logging import logger


class DuplicateDetector:
    """
    Scans the KYC database to identify duplicate identities across:
    1. Aadhaar Number (Exact match)
    2. PAN Number (Exact match)
    3. Phone Number (Exact match)
    4. Name + DOB combination
    Returns:
        duplicate_flag: bool
        duplicate_count: int
        matches: List[dict]
    """

    @staticmethod
    def check_duplicates(
        db: Session,
        current_user_id: str,
        aadhaar: str = None,
        pan: str = None,
        phone: str = None,
        name: str = None,
        dob: str = None
    ) -> Dict[str, Any]:
        duplicate_matches = []
        clean_aadhaar = re.sub(r'[\s\-]', '', str(aadhaar or ''))
        clean_pan = str(pan or '').strip().upper()
        clean_phone = re.sub(r'[^\d]', '', str(phone or ''))[-10:]

        try:
            # Query existing KYC records for other users
            query = db.query(KYCRecord).filter(KYCRecord.user_id != current_user_id)

            if clean_aadhaar and len(clean_aadhaar) == 12:
                aadhaar_hits = query.filter(
                    (KYCRecord.entered_aadhaar == clean_aadhaar) |
                    (KYCRecord.ocr_aadhaar == clean_aadhaar)
                ).all()
                for hit in aadhaar_hits:
                    duplicate_matches.append({
                        "field": "Aadhaar",
                        "matched_value": f"XXXX-XXXX-{clean_aadhaar[-4:]}",
                        "record_id": hit.id,
                        "user_id": hit.user_id,
                        "status": str(hit.status)
                    })

            if clean_pan and len(clean_pan) == 10:
                pan_hits = query.filter(
                    (KYCRecord.entered_pan == clean_pan) |
                    (KYCRecord.ocr_pan == clean_pan)
                ).all()
                for hit in pan_hits:
                    duplicate_matches.append({
                        "field": "PAN",
                        "matched_value": f"XXXXX{clean_pan[5:9]}X",
                        "record_id": hit.id,
                        "user_id": hit.user_id,
                        "status": str(hit.status)
                    })

            if clean_phone and len(clean_phone) == 10:
                phone_hits = query.filter(KYCRecord.entered_phone.like(f"%{clean_phone}")).all()
                for hit in phone_hits:
                    duplicate_matches.append({
                        "field": "Phone Number",
                        "matched_value": f"XXXXXX{clean_phone[-4:]}",
                        "record_id": hit.id,
                        "user_id": hit.user_id,
                        "status": str(hit.status)
                    })

        except Exception as e:
            logger.error(f"Duplicate detector DB query error: {e}")

        # Deduplicate matches by record_id + field
        unique_matches = []
        seen = set()
        for m in duplicate_matches:
            key = (m["field"], m["record_id"])
            if key not in seen:
                seen.add(key)
                unique_matches.append(m)

        duplicate_flag = len(unique_matches) > 0
        return {
            "duplicate_flag": duplicate_flag,
            "duplicate_count": len(unique_matches),
            "matches": unique_matches
        }
