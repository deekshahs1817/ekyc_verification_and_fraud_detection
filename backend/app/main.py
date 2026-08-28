import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import engine, Base
from app.core.logging import logger
from app.api.v1 import api_router

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="""
    ## AI-Powered Identity Verification & Fraud Detection for KYC Compliance

    Enterprise-grade eKYC verification platform featuring:
    * **OCR & Field Extraction** (PaddleOCR)
    * **Verhoeff Aadhaar & Regex PAN Validation**
    * **SentenceTransformer Form ↔ OCR Cross-Verification**
    * **InsightFace Biometric Verification**
    * **Multi-Cue Passive Anti-Spoofing Liveness Detection**
    * **CNN Document Tampering & Error Level Analysis Heatmap**
    * **Identity Deduplication & AML Compliance Rule Engine**
    * **XGBoost Ensemble Classifier with Explainable AI (XAI) Top Risk Factors**
    * **Automated PDF Verification Reports**
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://ekyc-fraud-detection-app.onrender.com",
        "https://huggingface.co",
        "https://deeksha1817-ekyc-fraud-detection-app.hf.space",
    ],
    allow_origin_regex=r"https://.*\.onrender\.com|https://.*\.hf\.space|https://.*huggingface\.co|https://.*\.trycloudflare\.com|http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local uploads directory as static route
if not os.path.exists(settings.UPLOAD_DIR):
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include API Routers
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "status": "OPERATIONAL",
        "api_docs": "/docs",
        "api_prefix": settings.API_V1_STR
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "storage": "writable"
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global Exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error occurred during KYC verification processing."}
    )
