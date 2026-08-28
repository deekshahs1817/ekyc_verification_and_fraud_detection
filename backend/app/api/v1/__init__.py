from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.kyc import router as kyc_router
from app.api.v1.admin import router as admin_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.reports import router as reports_router
from app.api.v1.notifications import router as notifications_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(kyc_router)
api_router.include_router(admin_router)
api_router.include_router(analytics_router)
api_router.include_router(reports_router)
api_router.include_router(notifications_router)
