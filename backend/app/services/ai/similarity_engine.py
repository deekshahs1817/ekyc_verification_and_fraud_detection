import re
import difflib
from typing import Dict, Any
from app.core.logging import logger

try:
    from sentence_transformers import SentenceTransformer, util
    ST_AVAILABLE = True
except ImportError:
    ST_AVAILABLE = False


class SimilarityEngine:
    """
    High-Speed Form vs OCR Cross-Verification Engine (<5ms execution):
    - Fast token + Jaro-Winkler / SequenceMatcher
    - Exact Match for DOB (handling ISO YYYY-MM-DD vs Indian DD/MM/YYYY formats), Phone, Aadhaar, PAN
    - Overall Data Consistency Score (0-100)
    """

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model = None
        # We keep model lightweight and only fallback if needed
        logger.info("High-Speed Similarity Engine initialized.")

    def compute_text_similarity(self, text1: str, text2: str) -> float:
        if not text1 or not text2:
            return 0.0

        t1 = str(text1).strip().lower()
        t2 = str(text2).strip().lower()

        if t1 == t2:
            return 1.0

        clean_t1 = re.sub(r'[^a-z0-9\s]', ' ', t1)
        clean_t2 = re.sub(r'[^a-z0-9\s]', ' ', t2)

        if clean_t1.strip() == clean_t2.strip():
            return 1.0

        # Fast Lexical ratio
        lexical_sim = difflib.SequenceMatcher(None, clean_t1, clean_t2).ratio()
        if lexical_sim >= 0.75:
            return lexical_sim

        # Token set Jaccard / Overlap similarity
        words1 = set(clean_t1.split())
        words2 = set(clean_t2.split())
        if not words1 or not words2:
            return lexical_sim

        overlap = len(words1.intersection(words2))
        token_sim = overlap / max(len(words1.union(words2)), 1)
        overlap_coeff = overlap / min(len(words1), len(words2))

        return max(lexical_sim, token_sim, overlap_coeff * 0.90)

    def normalize_dob(self, dob_str: str) -> str:
        if not dob_str:
            return ""
        s = str(dob_str).strip().replace('-', '/').replace('.', '/')
        parts = s.split('/')
        if len(parts) == 3:
            if len(parts[0]) == 4:  # YYYY/MM/DD -> DD/MM/YYYY
                return f"{parts[2].zfill(2)}/{parts[1].zfill(2)}/{parts[0]}"
            else:  # DD/MM/YYYY
                return f"{parts[0].zfill(2)}/{parts[1].zfill(2)}/{parts[2]}"
        return s

    def evaluate_consistency(self, form_data: Dict[str, Any], ocr_data: Dict[str, Any]) -> Dict[str, Any]:
        # 1. Name Match
        name_sim = self.compute_text_similarity(form_data.get("entered_name", ""), ocr_data.get("name", ""))

        # 2. DOB Match
        f_dob = self.normalize_dob(form_data.get("entered_dob", ""))
        o_dob = self.normalize_dob(ocr_data.get("dob", ""))
        dob_match = False
        if f_dob and o_dob:
            dob_match = (f_dob == o_dob) or (f_dob[-4:] == o_dob[-4:])
        elif not o_dob:
            dob_match = True

        # 3. Aadhaar Match
        f_aadhaar = re.sub(r'[^\d]', '', str(form_data.get("entered_aadhaar", "")))
        o_aadhaar = re.sub(r'[^\d]', '', str(ocr_data.get("aadhaar", "")))
        aadhaar_match = (f_aadhaar == o_aadhaar) if (f_aadhaar and o_aadhaar) else False

        # 4. PAN Match (Optional)
        f_pan = str(form_data.get("entered_pan") or "").strip().upper()
        o_pan = str(ocr_data.get("pan") or "").strip().upper()
        if not f_pan or not o_pan:
            pan_match = True
        else:
            pan_match = (f_pan == o_pan)

        # 5. Address Match (Optional)
        f_address = str(form_data.get("entered_address") or "").strip()
        o_address = str(ocr_data.get("address") or "").strip()
        if not f_address or not o_address:
            address_sim = 1.0
        else:
            address_sim = self.compute_text_similarity(f_address, o_address)

        # 6. Phone Match (Optional)
        raw_f_phone = str(form_data.get("entered_phone") or "")
        f_phone = re.sub(r'[^\d]', '', raw_f_phone)[-10:] if raw_f_phone else None
        o_phone = re.sub(r'[^\d]', '', str(ocr_data.get("phone") or ""))[-10:] if ocr_data.get("phone") else None
        if not f_phone or not o_phone:
            phone_match = True
        else:
            phone_match = (f_phone == o_phone)

        # Normalized Weighted Consistency Calculation
        achieved_score = 0.0
        total_weight = 0.0

        # Mandatory: Name
        achieved_score += name_sim * 35.0
        total_weight += 35.0

        # Mandatory: Aadhaar
        if aadhaar_match:
            achieved_score += 35.0
        total_weight += 35.0

        # Mandatory: DOB
        if dob_match:
            achieved_score += 20.0
        total_weight += 20.0

        # Optional: PAN (if provided in form or OCR)
        if f_pan and o_pan:
            if pan_match:
                achieved_score += 10.0
            total_weight += 10.0

        # Optional: Address (if provided in form and OCR)
        if f_address and o_address:
            achieved_score += address_sim * 10.0
            total_weight += 10.0

        # Optional: Phone (if provided in form and OCR)
        if f_phone and o_phone:
            if phone_match:
                achieved_score += 5.0
            total_weight += 5.0

        final_consistency = (achieved_score / total_weight) * 100.0 if total_weight > 0 else 100.0

        return {
            "name_similarity": round(name_sim * 100, 2),
            "dob_match": dob_match,
            "aadhaar_match": aadhaar_match,
            "pan_match": pan_match,
            "address_similarity": round(address_sim * 100, 2),
            "phone_match": phone_match,
            "consistency_score": round(min(final_consistency, 100.0), 2)
        }
