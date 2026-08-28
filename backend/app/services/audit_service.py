from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from app.core.logging import logger


class AuditService:
    @staticmethod
    def log_action(
        db: Session,
        action: str,
        user_id: Optional[str] = None,
        user_email: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        payload: Optional[Dict[str, Any]] = None
    ) -> AuditLog:
        try:
            log_entry = AuditLog(
                user_id=user_id,
                user_email=user_email,
                action=action,
                ip_address=ip_address,
                user_agent=user_agent,
                payload=payload or {}
            )
            db.add(log_entry)
            db.commit()
            db.refresh(log_entry)
            logger.info(f"AUDIT LOG: [{action}] by {user_email or user_id or 'System'}")
            return log_entry
        except Exception as e:
            logger.error(f"Audit log writing failed: {e}")
            db.rollback()
            return None
