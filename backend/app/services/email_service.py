import smtplib
import secrets
import hashlib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logging import logger
from app.models.otp import OTP


class EmailService:
    @staticmethod
    def generate_otp() -> str:
        """Generates a secure 6-digit OTP."""
        return f"{secrets.randbelow(900000) + 100000}"

    @staticmethod
    def hash_otp(otp: str) -> str:
        """Generates a SHA-256 hash of the OTP for secure database storage."""
        return hashlib.sha256(otp.encode('utf-8')).hexdigest()

    @staticmethod
    def send_otp_email(email: str, otp: str) -> bool:
        """
        Sends formatted HTML OTP verification email via configured SMTP server.
        Falls back to terminal logging if SMTP credentials are not configured or offline.
        """
        subject = f"Your Verification Code: {otp} - AI-Powered eKYC System"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }}
            .container {{ max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; }}
            .badge {{ background: #eff6ff; color: #2563eb; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 6px; display: inline-block; }}
            .title {{ font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 16px; margin-bottom: 8px; }}
            .subtitle {{ font-size: 14px; color: #64748b; line-height: 1.5; }}
            .otp-box {{ background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 8px; text-align: center; padding: 18px; margin: 24px 0; }}
            .otp-code {{ font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1e40af; font-family: monospace; }}
            .expiry {{ font-size: 13px; color: #e11d48; font-weight: 600; text-align: center; margin-top: 6px; }}
            .footer {{ font-size: 12px; color: #94a3b8; margin-top: 28px; border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="badge">SECURE IDENTITY VERIFICATION</div>
            <div class="title">AI-Powered eKYC Verification System</div>
            <p class="subtitle">Use the one-time verification code below to log in to your digital KYC verification portal:</p>
            <div class="otp-box">
              <div class="otp-code">{otp}</div>
              <div class="expiry">Valid for {settings.OTP_EXPIRE_MINUTES} minutes • Single-use only</div>
            </div>
            <p class="subtitle" style="font-size: 13px;">If you did not request this code, you can safely ignore this email. Do not share this code with anyone.</p>
            <div class="footer">
              AI-Powered eKYC Verification & Fraud Detection System • Academic / Internship Project
            </div>
          </div>
        </body>
        </html>
        """

        # Check if SMTP credentials are provided
        if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = settings.SMTP_FROM_EMAIL
                msg["To"] = email
                msg.attach(MIMEText(html_content, "html"))

                with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
                    server.starttls()
                    server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                    server.sendmail(settings.SMTP_FROM_EMAIL, [email], msg.as_string())
                
                logger.info(f"Successfully sent OTP email via SMTP to: {email}")
                return True
            except Exception as e:
                logger.warning(f"SMTP dispatch failed ({e}). Falling back to terminal log.")

        # Dev / Testing fallback logging:
        try:
            print("\n" + "=" * 66)
            print("[EMAIL OTP DISPATCH]")
            print(f"Recipient: {email}")
            print(f"One-Time Password (OTP): {otp}")
            print(f"Expires In: {settings.OTP_EXPIRE_MINUTES} minutes")
            print("=" * 66 + "\n")
        except Exception:
            pass
        logger.info(f"[EMAIL OTP DISPATCH] To: {email} | Code: {otp} | Expires in: {settings.OTP_EXPIRE_MINUTES}m")
        return True

    @staticmethod
    def create_and_send_otp(db: Session, email: str) -> str:
        """Generates, saves to database, and emails OTP."""
        email_clean = email.lower().strip()
        otp = EmailService.generate_otp()
        otp_hash = EmailService.hash_otp(otp)
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

        # Invalidate any prior unused OTPs for this email
        db.query(OTP).filter(OTP.email == email_clean, OTP.is_used == False).update({"is_used": True})

        # Save new OTP record
        db_otp = OTP(
            email=email_clean,
            otp_hash=otp_hash,
            expires_at=expires_at,
            is_used=False,
            attempt_count=0
        )
        db.add(db_otp)
        db.commit()

        # Send via email/SMTP
        EmailService.send_otp_email(email_clean, otp)
        return otp

    @staticmethod
    def verify_otp(db: Session, email: str, entered_otp: str) -> bool:
        """
        Verifies entered OTP against database record.
        Enforces: single use, 5-minute expiry, and max 5 attempts.
        """
        email_clean = email.lower().strip()
        now = datetime.now(timezone.utc)

        # Find latest active OTP record
        otp_record = (
            db.query(OTP)
            .filter(OTP.email == email_clean, OTP.is_used == False)
            .order_by(OTP.created_at.desc())
            .first()
        )

        if not otp_record:
            raise ValueError("No active OTP request found for this email. Please request a new code.")

        # Check attempt count
        if otp_record.attempt_count >= settings.MAX_OTP_ATTEMPTS:
            otp_record.is_used = True
            db.commit()
            raise ValueError("Maximum verification attempts exceeded. Please request a new OTP.")

        # Check expiry
        record_exp = otp_record.expires_at
        if record_exp.tzinfo is None:
            record_exp = record_exp.replace(tzinfo=timezone.utc)

        if now > record_exp:
            otp_record.is_used = True
            db.commit()
            raise ValueError("Verification code has expired (5 minutes limit). Please request a new code.")

        # Verify hash
        expected_hash = EmailService.hash_otp(entered_otp.strip())
        if otp_record.otp_hash != expected_hash:
            otp_record.attempt_count += 1
            db.commit()
            remaining = settings.MAX_OTP_ATTEMPTS - otp_record.attempt_count
            raise ValueError(f"Invalid verification code. {remaining} attempt(s) remaining.")

        # Success: mark OTP as used
        otp_record.is_used = True
        db.commit()
        return True
