from typing import List, Dict, Any
import numpy as np


class XAIExplainer:
    """
    Explainable AI (XAI) Attribution Module:
    Extracts transparent, human-interpretable feature importance factors and top fraud contributors
    for compliance officers and applicants.
    """

    FEATURE_NAMES = [
        "name_similarity",
        "address_similarity",
        "dob_match",
        "phone_match",
        "aadhaar_match",
        "pan_match",
        "consistency_score",
        "face_score",
        "liveness_score",
        "tamper_score",
        "blur_score",
        "duplicate_count",
        "aml_flag"
    ]

    @classmethod
    def generate_explanations(
        cls,
        features_dict: Dict[str, float],
        fraud_score: float,
        shap_values: List[float] = None
    ) -> List[Dict[str, Any]]:
        """
        Returns structured list of top contributing risk factors.
        """
        explanations = []

        # 1. Tamper Score Impact
        tamper = features_dict.get("tamper_score", 0.0)
        if tamper > 35.0:
            explanations.append({
                "feature": "Document Tampering",
                "impact": "HIGH" if tamper > 60 else "MEDIUM",
                "description": f"Image Error Level Analysis detected high digital manipulation residue ({tamper:.1f}% tamper confidence).",
                "contribution_score": round(tamper * 0.35, 1)
            })

        # 2. Face Verification Impact
        face = features_dict.get("face_score", 100.0)
        if face < 70.0:
            deficit = 70.0 - face
            explanations.append({
                "feature": "Facial Biometric Mismatch",
                "impact": "HIGH" if face < 40 else "MEDIUM",
                "description": f"Cosine similarity between document photo and live selfie is low ({face:.1f}% match).",
                "contribution_score": round(deficit * 0.40, 1)
            })

        # 3. Liveness Anti-Spoofing Impact
        liveness = features_dict.get("liveness_score", 100.0)
        if liveness < 60.0:
            explanations.append({
                "feature": "Anti-Spoofing / Liveness Failure",
                "impact": "HIGH",
                "description": f"Passive texture and frequency analysis detected artificial screen moire / printed paper artifact ({liveness:.1f}%).",
                "contribution_score": round((60.0 - liveness) * 0.45, 1)
            })

        # 4. Form vs OCR Consistency Impact
        consistency = features_dict.get("consistency_score", 100.0)
        if consistency < 75.0:
            explanations.append({
                "feature": "Data Consistency Discrepancy",
                "impact": "HIGH" if consistency < 50 else "MEDIUM",
                "description": f"Form entries deviate from OCR extracted document values ({consistency:.1f}% overall consistency).",
                "contribution_score": round((100.0 - consistency) * 0.25, 1)
            })

        # 5. Duplicate ID Impact
        dup_count = features_dict.get("duplicate_count", 0.0)
        if dup_count > 0:
            explanations.append({
                "feature": "Identity Duplicate Linkage",
                "impact": "HIGH",
                "description": f"Identity numbers or biometric signals match {int(dup_count)} existing accounts in database.",
                "contribution_score": round(dup_count * 25.0, 1)
            })

        # 6. AML Rules Impact
        aml = features_dict.get("aml_flag", 0.0)
        if aml > 0.5:
            explanations.append({
                "feature": "AML Policy Violation",
                "impact": "HIGH",
                "description": "Triggered one or more mandatory Anti-Money Laundering regulatory alerts.",
                "contribution_score": 30.0
            })

        # 7. Blur / Image Quality
        blur = features_dict.get("blur_score", 100.0)
        if blur < 30.0:
            explanations.append({
                "feature": "Poor Image Sharpness",
                "impact": "LOW",
                "description": f"Laplacian variance is low ({blur:.1f}%). OCR and face recognition confidence is reduced.",
                "contribution_score": round((30.0 - blur) * 0.2, 1)
            })

        # Sort by contribution score descending and take top 5
        explanations.sort(key=lambda x: x["contribution_score"], reverse=True)
        return explanations[:5]
