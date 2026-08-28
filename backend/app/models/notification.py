import uuid
from datetime import datetime, timezone
import enum
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base


class NotificationType(str, enum.Enum):
    INFO = "INFO"
    SUCCESS = "SUCCESS"
    WARNING = "WARNING"
    ERROR = "ERROR"


class NotificationRole(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"
    ALL = "ALL"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    recipient_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    recipient_role = Column(Enum(NotificationRole), default=NotificationRole.ALL, index=True)
    
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(Enum(NotificationType), default=NotificationType.INFO)
    link = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    recipient = relationship("User", back_populates="notifications")
