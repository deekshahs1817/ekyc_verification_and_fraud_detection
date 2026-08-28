from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.notification import Notification, NotificationRole
from app.schemas.notification import NotificationResponse, NotificationCountResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/my-notifications", response_model=List[NotificationResponse])
def get_user_notifications(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Notification)
    is_admin = current_user.role in [UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER]

    if is_admin:
        query = query.filter(
            or_(
                Notification.recipient_id == current_user.id,
                and_(
                    Notification.recipient_id == None,
                    Notification.recipient_role.in_([NotificationRole.ADMIN, NotificationRole.ALL])
                )
            )
        )
    else:
        # Strictly user's own notifications or general system broadcasts with no recipient_id
        query = query.filter(
            or_(
                Notification.recipient_id == current_user.id,
                and_(
                    Notification.recipient_id == None,
                    Notification.recipient_role == NotificationRole.ALL
                )
            )
        )

    notifications = query.order_by(Notification.created_at.desc()).limit(limit).all()
    return notifications


@router.get("/unread-count", response_model=NotificationCountResponse)
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Notification).filter(Notification.is_read == False)
    is_admin = current_user.role in [UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER]

    if is_admin:
        query = query.filter(
            or_(
                Notification.recipient_id == current_user.id,
                and_(
                    Notification.recipient_id == None,
                    Notification.recipient_role.in_([NotificationRole.ADMIN, NotificationRole.ALL])
                )
            )
        )
    else:
        query = query.filter(
            or_(
                Notification.recipient_id == current_user.id,
                and_(
                    Notification.recipient_id == None,
                    Notification.recipient_role == NotificationRole.ALL
                )
            )
        )

    count = query.count()
    return {"unread_count": count}


@router.post("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif


@router.post("/mark-all-read")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    is_admin = current_user.role in [UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER]
    query = db.query(Notification).filter(Notification.is_read == False)

    if is_admin:
        query = query.filter(
            or_(
                Notification.recipient_id == current_user.id,
                and_(
                    Notification.recipient_id == None,
                    Notification.recipient_role.in_([NotificationRole.ADMIN, NotificationRole.ALL])
                )
            )
        )
    else:
        query = query.filter(
            or_(
                Notification.recipient_id == current_user.id,
                and_(
                    Notification.recipient_id == None,
                    Notification.recipient_role == NotificationRole.ALL
                )
            )
        )

    updated_count = query.update({Notification.is_read: True}, synchronize_session=False)
    db.commit()
    return {"status": "success", "marked_read": updated_count}
