from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: str
    recipient_id: Optional[str] = None
    recipient_role: str
    title: str
    message: str
    type: str
    link: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationCountResponse(BaseModel):
    unread_count: int
