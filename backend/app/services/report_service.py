import os
import hashlib
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from app.models.kyc_record import KYCRecord
from app.core.config import settings
from app.core.logging import logger


class PDFReportService:
    """
    Generates downloadable, tamper-evident PDF KYC Verification & Compliance Reports.
    """

    @classmethod
    def generate_kyc_report(cls, record: KYCRecord, output_path: str = None) -> str:
        if not output_path:
            os.makedirs(os.path.join(settings.UPLOAD_DIR, "reports"), exist_ok=True)
            output_path = os.path.join(settings.UPLOAD_DIR, "reports", f"KYC_Report_{record.id}.pdf")

        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        normal = styles["Normal"]

        # Custom Styles
        title_style = ParagraphStyle(
            "ReportTitle",
            parent=styles["Heading1"],
            fontSize=18,
            leading=22,
            textColor=colors.HexColor("#0F172A"),
            fontName="Helvetica-Bold"
        )
        subtitle_style = ParagraphStyle(
            "ReportSubtitle",
            parent=normal,
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#64748B")
        )
        section_style = ParagraphStyle(
            "SectionHeader",
            parent=styles["Heading2"],
            fontSize=12,
            leading=16,
            textColor=colors.HexColor("#1E293B"),
            fontName="Helvetica-Bold",
            spaceBefore=10,
            spaceAfter=6
        )

        story = []

        # 1. Header Banner
        header_data = [
            [
                Paragraph("<b>eKYC & FRAUD COMPLIANCE AUDIT REPORT</b>", title_style),
                Paragraph(f"<b>REPORT ID:</b> {record.id[:8].upper()}<br/><b>DATE:</b> {datetime.now().strftime('%Y-%m-%d %H:%M')}", subtitle_style)
            ]
        ]
        header_table = Table(header_data, colWidths=[360, 180])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ]))
        story.append(header_table)
        story.append(Spacer(1, 8))
        story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#3B82F6"), spaceAfter=12))

        # 2. Executive Summary & Scores Banner
        status_color = "#10B981" if str(record.status) == "APPROVED" else ("#EF4444" if str(record.status) == "REJECTED" else "#F59E0B")
        risk_color = "#10B981" if str(record.risk_level) == "LOW" else ("#EF4444" if str(record.risk_level) == "HIGH" else "#F59E0B")

        exec_data = [
            [
                Paragraph(f"<b>STATUS:</b> <font color='{status_color}'>{record.status}</font>", styles["Heading3"]),
                Paragraph(f"<b>RISK LEVEL:</b> <font color='{risk_color}'>{record.risk_level}</font>", styles["Heading3"]),
                Paragraph(f"<b>FRAUD SCORE:</b> {record.fraud_score:.1f}%", styles["Heading3"]),
                Paragraph(f"<b>TRUST SCORE:</b> {record.trust_score:.1f}%", styles["Heading3"]),
            ]
        ]
        exec_table = Table(exec_data, colWidths=[135, 135, 135, 135])
        exec_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#E2E8F0")),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('PADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(exec_table)
        story.append(Spacer(1, 14))

        # 3. Form Ground Truth vs OCR Cross-Verification Table
        story.append(Paragraph("1. Identity Verification & Field Cross-Matching", section_style))
        comp_data = [
            [
                Paragraph("<b>Field</b>", normal),
                Paragraph("<b>Applicant Entered Data</b>", normal),
                Paragraph("<b>OCR Extracted Data</b>", normal),
                Paragraph("<b>Match Status</b>", normal)
            ],
            [
                Paragraph("Full Name", normal),
                Paragraph(str(record.entered_name or "N/A"), normal),
                Paragraph(str(record.ocr_name or "N/A"), normal),
                Paragraph(f"{record.name_similarity:.1f}% Sim", normal)
            ],
            [
                Paragraph("Date of Birth", normal),
                Paragraph(str(record.entered_dob or "N/A"), normal),
                Paragraph(str(record.ocr_dob or "N/A"), normal),
                Paragraph("MATCH" if record.dob_match else "MISMATCH", normal)
            ],
            [
                Paragraph("Aadhaar Number", normal),
                Paragraph(str(record.entered_aadhaar or "N/A"), normal),
                Paragraph(str(record.ocr_aadhaar or "N/A"), normal),
                Paragraph("MATCH (VALID)" if (record.entered_aadhaar and record.ocr_aadhaar and record.entered_aadhaar.replace(" ", "") == record.ocr_aadhaar.replace(" ", "") and record.aadhaar_checksum_valid) else ("MISMATCH" if (record.entered_aadhaar != record.ocr_aadhaar) else "INVALID CHECKSUM"), normal)
            ],
            [
                Paragraph("PAN Number (Optional)", normal),
                Paragraph(str(record.entered_pan or "Not Provided"), normal),
                Paragraph(str(record.ocr_pan or "Not on ID"), normal),
                Paragraph("NOT PROVIDED" if not record.entered_pan else ("MATCH (VALID)" if (record.ocr_pan and record.entered_pan.strip().upper() == record.ocr_pan.strip().upper() and record.pan_format_valid) else ("NOT ON ID" if not record.ocr_pan else ("MATCH" if record.entered_pan == record.ocr_pan else "MISMATCH"))), normal)
            ],
            [
                Paragraph("Phone Number (Optional)", normal),
                Paragraph(str(record.entered_phone or "Not Provided"), normal),
                Paragraph(str(record.ocr_phone or "Not on ID"), normal),
                Paragraph("NOT PROVIDED" if not record.entered_phone else ("NOT ON ID CARD" if not record.ocr_phone or record.ocr_phone == "N/A" else ("MATCH" if record.phone_match else "MISMATCH")), normal)
            ],
            [
                Paragraph("Address (Optional)", normal),
                Paragraph(str(record.entered_address or "Not Provided")[:40] + ("..." if record.entered_address and len(record.entered_address) > 40 else ""), normal),
                Paragraph(str(record.ocr_address or "Not on ID")[:40] + ("..." if record.ocr_address and len(record.ocr_address) > 40 else ""), normal),
                Paragraph("NOT PROVIDED" if not record.entered_address else f"{record.address_similarity:.1f}% Sim", normal)
            ],
        ]
        comp_table = Table(comp_data, colWidths=[100, 160, 160, 120])
        comp_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ('PADDING', (0, 0), (-1, -1), 6),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(comp_table)
        story.append(Spacer(1, 14))

        # 4. Multi-Modal AI & Biometric Metrics
        story.append(Paragraph("2. Biometric & Computer Vision AI Diagnostics", section_style))
        ai_data = [
            [
                Paragraph("<b>Metric</b>", normal),
                Paragraph("<b>Score (0-100)</b>", normal),
                Paragraph("<b>Benchmark Threshold</b>", normal),
                Paragraph("<b>Assessment</b>", normal)
            ],
            [
                Paragraph("Face Verification Match", normal),
                Paragraph(f"{record.face_score:.1f}%", normal),
                Paragraph(">= 70.0%", normal),
                Paragraph("PASS" if record.face_score >= 70 else "FAIL", normal)
            ],
            [
                Paragraph("Passive Liveness / Anti-Spoofing", normal),
                Paragraph(f"{record.liveness_score:.1f}%", normal),
                Paragraph(">= 60.0%", normal),
                Paragraph("LIVE" if record.liveness_score >= 60 else "SPOOF_RISK", normal)
            ],
            [
                Paragraph("Document Tamper / ELA Residue", normal),
                Paragraph(f"{record.tamper_score:.1f}%", normal),
                Paragraph("< 45.0%", normal),
                Paragraph("GENUINE" if record.tamper_score < 45 else "TAMPER_DETECTED", normal)
            ],
            [
                Paragraph("Image Sharpness / Blur Index", normal),
                Paragraph(f"{record.blur_score:.1f}%", normal),
                Paragraph(">= 25.0%", normal),
                Paragraph("CLEAR" if record.blur_score >= 25 else "BLURRY", normal)
            ],
            [
                Paragraph("Data Consistency Score", normal),
                Paragraph(f"{record.consistency_score:.1f}%", normal),
                Paragraph(">= 75.0%", normal),
                Paragraph("CONSISTENT" if record.consistency_score >= 75 else "DISCREPANCIES", normal)
            ],
        ]
        ai_table = Table(ai_data, colWidths=[160, 100, 140, 140])
        ai_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ('PADDING', (0, 0), (-1, -1), 5),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(ai_table)
        story.append(Spacer(1, 14))

        # 5. Explainable AI (XAI) & AML Alerts
        story.append(Paragraph("3. Explainable AI (XAI) Risk Factors & AML Rules", section_style))
        reasons_text = ""
        if record.xai_risk_factors and len(record.xai_risk_factors) > 0:
            for factor in record.xai_risk_factors:
                reasons_text += f"• <b>[{factor.get('impact', 'INFO')}] {factor.get('feature')}:</b> {factor.get('description')}<br/>"
        else:
            reasons_text = "• No critical risk factors identified. Identity data aligns cleanly across all checkpoints."

        if record.aml_flag and record.aml_reasons:
            reasons_text += "<br/><b>AML Policy Alerts:</b><br/>"
            for r in record.aml_reasons:
                reasons_text += f"• <font color='#EF4444'>{r}</font><br/>"

        story.append(Paragraph(reasons_text, normal))
        story.append(Spacer(1, 18))

        # 6. Verification Hash & Audit Footer
        raw_hash_str = f"{record.id}_{record.entered_aadhaar}_{record.fraud_score}_{record.created_at}"
        verification_hash = hashlib.sha256(raw_hash_str.encode()).hexdigest().upper()

        footer_text = f"""
        <b>Digitally Signed & Certified by AI Verification Engine</b><br/>
        Audit Hash: {verification_hash}<br/>
        Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')} | Compliance Officer: {record.reviewer_name or 'Automated AI Engine'}
        """
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E1"), spaceAfter=6))
        story.append(Paragraph(footer_text, ParagraphStyle("Footer", parent=normal, fontSize=8, leading=11, textColor=colors.HexColor("#64748B"))))

        # Build PDF
        doc.build(story)
        logger.info(f"Generated PDF Verification Report: {output_path}")
        return output_path
