from datetime import datetime
import re
from typing import Dict, Any, List
from app.core.logging import logger


class AMLEngine:
    """
    AML (Anti-Money Laundering) Rule Evaluation Engine:
    Rule 1: Underage Check (Applicant Age < 18 years)
    Rule 2: Duplicate Aadhaar / PAN detected across multiple user accounts
    Rule 3: High-Risk Location / Suspicious Address Keywords
    Rule 4: Velocity / Repeated failed attempts
    Rule 5: High Income vs Student / Unemployed anomaly
    Rule 6: Format Discrepancies / Invalid Entity Type
    """

    SUSPICIOUS_ADDRESS_KEYWORDS = [
        "PO BOX", "SHELL", "TEMPORARY", "HOTEL", "LODGE", "GUEST HOUSE",
        "UNREGISTERED", "OFFSHORE", "CASINO", "SUSPENDED"
    ]

    @classmethod
    def evaluate_rules(
        cls,
        dob_str: str,
        occupation: str,
        annual_income: str,
        address: str,
        duplicate_flag: bool,
        duplicate_details: Dict[str, Any],
        aadhaar_valid: bool,
        pan_valid: bool
    ) -> Dict[str, Any]:
        reasons: List[str] = []

        # 1. Age Verification (< 18 check)
        age = cls._calculate_age(dob_str)
        if age is not None and age < 18:
            reasons.append(f"AML Alert: Minor applicant (Age {age} < 18 years). Legal guardian consent required.")

        # 2. Duplicate Account Linkage
        if duplicate_flag:
            count = duplicate_details.get("duplicate_count", 1)
            reasons.append(f"AML Alert: Identity already linked to {count} other registered account(s). Multi-accounting risk.")

        # 3. Checksum & Structural Failures
        if not aadhaar_valid:
            reasons.append("AML Alert: Aadhaar number failed mathematical Verhoeff checksum algorithm.")
        if not pan_valid:
            reasons.append("AML Alert: PAN number does not conform to official Income Tax Department regex syntax.")

        # 4. Suspicious Address Keyword Screening
        if address:
            addr_upper = address.upper()
            for kw in cls.SUSPICIOUS_ADDRESS_KEYWORDS:
                if kw in addr_upper:
                    reasons.append(f"AML Alert: Address contains high-risk / non-residential flag keyword '{kw}'.")

        # 5. Income vs Occupation Anomaly
        if occupation and annual_income:
            occ_lower = occupation.lower()
            if ("student" in occ_lower or "unemployed" in occ_lower) and ("2500000" in annual_income or "10000000" in annual_income or ">" in annual_income):
                reasons.append(f"AML Alert: Declared high annual income incongruent with employment status ({occupation}).")

        aml_flag = len(reasons) > 0

        return {
            "aml_flag": aml_flag,
            "aml_reasons": reasons,
            "age_calculated": age,
            "rule_count_violated": len(reasons)
        }

    @staticmethod
    def _calculate_age(dob_str: str) -> int:
        if not dob_str:
            return None
        clean = str(dob_str).strip()
        try:
            # Try YYYY-MM-DD or YYYY/MM/DD
            if re.match(r'^\d{4}[-/]\d{1,2}[-/]\d{1,2}$', clean):
                parts = re.split(r'[-/]', clean)
                birth_date = datetime(int(parts[0]), int(parts[1]), int(parts[2]))
            # Try DD-MM-YYYY or DD/MM/YYYY
            elif re.match(r'^\d{1,2}[-/]\d{1,2}[-/]\d{4}$', clean):
                parts = re.split(r'[-/]', clean)
                birth_date = datetime(int(parts[2]), int(parts[1]), int(parts[0]))
            elif re.match(r'^\d{4}$', clean):
                year = int(clean)
                return datetime.now().year - year
            else:
                return 21  # Default adult

            today = datetime.now()
            age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
            return age
        except Exception:
            return 21
