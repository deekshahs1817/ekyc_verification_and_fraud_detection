from typing import Optional
from sqlalchemy.orm import Session
from app.models.notification import Notification, NotificationType, NotificationRole
from app.core.logging import logger


class NotificationService:
    @staticmethod
    def create_notification(
        db: Session,
        title: str,
        message: str,
        recipient_id: Optional[str] = None,
        recipient_role: NotificationRole = NotificationRole.ALL,
        type: NotificationType = NotificationType.INFO,
        link: Optional[str] = None
    ) -> Optional[Notification]:
        try:
            notification = Notification(
                recipient_id=recipient_id,
                recipient_role=recipient_role,
                title=title,
                message=message,
                type=type,
                link=link,
                is_read=False
            )
            db.add(notification)
            db.commit()
            db.refresh(notification)
            logger.info(f"NOTIFICATION CREATED: [{title}] for {recipient_id or recipient_role.value}")
            return notification
        except Exception as e:
            logger.error(f"Failed to create notification: {e}")
            db.rollback()
            return None

    @classmethod
    def notify_applicant(
        cls,
        db: Session,
        user_id: str,
        title: str,
        message: str,
        type: NotificationType = NotificationType.INFO,
        link: Optional[str] = None
    ):
        return cls.create_notification(
            db=db,
            recipient_id=user_id,
            recipient_role=NotificationRole.USER,
            title=title,
            message=message,
            type=type,
            link=link
        )

    @classmethod
    def notify_admins(
        cls,
        db: Session,
        title: str,
        message: str,
        type: NotificationType = NotificationType.INFO,
        link: Optional[str] = None
    ):
        return cls.create_notification(
            db=db,
            recipient_id=None,
            recipient_role=NotificationRole.ADMIN,
            title=title,
            message=message,
            type=type,
            link=link
        )

    @classmethod
    def notify_submission(cls, db: Session, record, user):
        # 1. Notify Applicant
        cls.notify_applicant(
            db=db,
            user_id=user.id,
            title="KYC Application Submitted",
            message=f"Your identity documents ({record.entered_name}) have been submitted and analyzed by our AI verification pipeline. Initial Risk: {record.risk_level.value} ({record.fraud_score}%).",
            type=NotificationType.INFO,
            link="/kyc/status"
        )

        # 2. Notify Admins
        risk_is_high = record.risk_level.value == "HIGH" or record.fraud_score >= 70
        has_aml = record.aml_flag
        
        admin_type = NotificationType.ERROR if (risk_is_high or has_aml) else NotificationType.INFO
        risk_desc = "🚨 HIGH FRAUD RISK" if risk_is_high else "Standard Risk"
        if has_aml:
            risk_desc += " | AML FLAG DETECTED"

        cls.notify_admins(
            db=db,
            title=f"New KYC Submission: {record.entered_name}",
            message=f"Applicant {record.entered_name} ({user.email}) submitted documents. Fraud Risk: {record.fraud_score}% ({risk_desc}). Awaiting compliance verification.",
            type=admin_type,
            link=f"/admin/review/{record.id}"
        )

    @classmethod
    def notify_review(cls, db: Session, record, reviewer):
        status_val = record.status.value
        reviewer_name = reviewer.name if reviewer else "Compliance Officer"

        if status_val == "APPROVED":
            user_type = NotificationType.SUCCESS
            user_title = "KYC Verification Approved!"
            user_msg = f"Congratulations! Your identity verification has been approved by {reviewer_name}. {record.review_notes or ''}"
        elif status_val == "REJECTED":
            user_type = NotificationType.ERROR
            user_title = "KYC Application Rejected"
            user_msg = f"Your KYC application was rejected by {reviewer_name}. Reason: {record.review_notes or 'Identity mismatch or document anomaly detected.'}"
        else:
            user_type = NotificationType.WARNING
            user_title = "KYC Status Update: Under Review"
            user_msg = f"Your application is currently on hold/under review by {reviewer_name}. Note: {record.review_notes or 'Additional document check in progress.'}"

        # Notify the applicant
        cls.notify_applicant(
            db=db,
            user_id=record.user_id,
            title=user_title,
            message=user_msg,
            type=user_type,
            link="/kyc/status"
        )

        # Notify admin broadcast for audit awareness
        cls.notify_admins(
            db=db,
            title=f"Record #{record.id[:8]} Review: {status_val}",
            message=f"{reviewer_name} marked application for {record.entered_name} as {status_val}.",
            type=NotificationType.INFO,
            link=f"/admin/review/{record.id}"
        )
