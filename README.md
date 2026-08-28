# AI-Powered Identity Verification and Fraud Detection for KYC Compliance

An enterprise-grade, full-stack automated eKYC verification and fraud detection platform. Built with **React 18, TypeScript, Material UI, Redux Toolkit, FastAPI, PostgreSQL, and PyTorch / XGBoost / PaddleOCR / InsightFace**.

---

## 🌟 Key Capabilities & Architectural Highlights

1. **Multi-Factor Form ↔ OCR Cross-Verification**:
   - Manually entered applicant data (Ground Truth) is semantically compared against extracted text from documents using **SentenceTransformers (`all-MiniLM-L6-v2`)** and lexical token matching.
   - Computes a normalized **Consistency Score (0-100)**.
2. **Mathematical Checksum & Syntax Validation**:
   - **Aadhaar Validation**: 12-digit structural validation using the official **Verhoeff Dihedral Checksum Algorithm** (`d_table` & `p_table`).
   - **PAN Validation**: Official Income Tax pattern matching (`[A-Z]{5}[0-9]{4}[A-Z]{1}`) with 4th character entity status checks.
3. **Biometric Face Verification & Passive Anti-Spoofing**:
   - Compares ID Document photo vs live webcam selfie using **InsightFace / ArcFace 512-dim embedding cosine similarity**.
   - Multi-cue **Liveness Detection** evaluating 2D-FFT screen moire patterns, specular reflection glares, and micro-texture gradients.
4. **CNN Document Tampering & ELA Heatmap**:
   - Convolutional neural network analyzing Error Level Analysis (ELA) compression deltas and localized noise gradients.
   - Generates visual color overlay **Heatmaps** highlighting spliced photos or altered text.
5. **Database Deduplication & 6-Tier AML Compliance Engine**:
   - Cross-account identity deduplication (Aadhaar, PAN, Phone, Face).
   - Anti-Money Laundering checks: Underage applicants (<18), shell address flags (`PO BOX`, `OFFSHORE`), velocity alerts, income-to-occupation anomalies.
6. **XGBoost Ensemble Risk Classifier + Explainable AI (XAI)**:
   - 13-feature ensemble predicting **Fraud Probability (0-100)**, **Trust Score (0-100)**, and Risk Tier:
     - **0 - 30%**: `LOW RISK` (Eligible for Auto-Approval)
     - **31 - 70%**: `MEDIUM RISK` (Flagged for Compliance Review)
     - **71 - 100%**: `HIGH RISK` (Auto-Reject / High Anomaly Alert)
   - **Explainable AI (XAI)** highlights the **Top 5 Fraud Contributors** (e.g. `Document Tampering (+34%)`, `Biometric Mismatch (+28%)`).
7. **Automated Certified PDF Verification Reports**:
   - Tamper-evident PDF report generation powered by **ReportLab** with cryptographic verification hashes, extracted data tables, and score gauges.
8. **Professional Workflow Lifecycle**:
   - `DRAFT` $\rightarrow$ `SUBMITTED` $\rightarrow$ `UNDER_REVIEW` $\rightarrow$ `APPROVED` / `REJECTED` / `ACTION_REQUIRED`.

---

## 🏗️ System Architecture & Tech Stack

```
Frontend:     React.js 18, TypeScript, Material UI v5, Redux Toolkit, Axios, Recharts
Backend:      FastAPI, Python 3.11, Pydantic v2, SQLAlchemy, Uvicorn
Database:     PostgreSQL (with seamless SQLite development fallback)
AI / ML:      PaddleOCR, InsightFace, PyTorch, EfficientNet-B3, XGBoost, SHAP, Sentence-Transformers, OpenCV
Reporting:    ReportLab PDF Engine
Storage:      Local structured storage (uploads/aadhaar, pan, utility, selfies, heatmaps, reports)
Auth:         JWT Authentication, Bcrypt Password Hashing, Role-Based Access Control (RBAC)
Deployment:   Docker & Docker Compose
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup & Run

```bash
cd backend

# Create & activate virtual environment (optional)
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed demo users & sample records
python -m app.training.seed_data

# Start FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **API Documentation (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **API Redoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### 2. Frontend Setup & Run

```bash
cd frontend

# Install packages
npm install

# Start React development server
npm start
```

- **Web Application**: [http://localhost:3000](http://localhost:3000)

---

### 🔑 Default Demo Accounts

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Compliance Officer / Admin** | `admin@ekyc.ai` | `Admin@123` | Full Review Queue, Heatmap Inspector, AML Alerts, Audit Logs |
| **Applicant / Customer** | `user@ekyc.ai` | `User@123` | KYC Submission Wizard, History, PDF Report Download |

*(One-click fill buttons are available directly on the login screen).*

---

## 🤖 Training & ML Model Pipelines

To retrain the custom models or generate updated datasets:

```bash
# 1. Train CNN Document Tamper Detector
python -m app.training.train_tamper_cnn

# 2. Train XGBoost Fraud Risk Classifier with SHAP
python -m app.training.train_xgboost
```

---

## 🐳 Docker Deployment

To launch the complete multi-container stack (PostgreSQL + FastAPI + React):

```bash
docker-compose up --build
```
