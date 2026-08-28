# 🛡️ AI-Powered eKYC Verification & Fraud Detection System

An enterprise-grade, full-stack automated eKYC verification and fraud detection platform. Built with **React 18, TypeScript, Material UI, Redux Toolkit, FastAPI, Python 3.11, PyTorch, EasyOCR, InsightFace, OpenCV, and XGBoost**.

---

## 🌐 Live Deployment Links

| Service | Live URL | Status |
| :--- | :--- | :--- |
| **🎨 Web Application (Frontend)** | **[https://infringement-situation-adjust-drainage.trycloudflare.com](https://infringement-situation-adjust-drainage.trycloudflare.com)** | 🟢 **ACTIVE** |
| **⚡ AI Engine & REST API (Backend)** | **[https://racks-cardiac-jake-craps.trycloudflare.com](https://racks-cardiac-jake-craps.trycloudflare.com)** | 🟢 **ACTIVE** |
| **📚 Interactive Swagger API Docs** | **[https://racks-cardiac-jake-craps.trycloudflare.com/docs](https://racks-cardiac-jake-craps.trycloudflare.com/docs)** | 🟢 **ACTIVE** |
| **📦 GitHub Source Repository** | **[https://github.com/deekshahs1817/ekyc-fraud-detection-system](https://github.com/deekshahs1817/ekyc-fraud-detection-system)** | 🟢 **ACTIVE** |

---

## 🌟 Key Capabilities & Features

1. **Multi-Factor Form ↔ OCR Cross-Verification**:
   - Manually entered applicant data (Ground Truth) is cross-verified against extracted text from documents with multi-pass CLAHE image preprocessing.
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
   - 13-feature ensemble predicting **Fraud Probability (0-100)**, **Trust Score (0-100)**, and Risk Tier (`LOW`, `MEDIUM`, `HIGH`).
   - **Explainable AI (XAI)** highlights the **Top Risk Contributors** with percentage attributions.
7. **Two Dedicated Admin Pages**:
   - **Page 1 (`/admin/applicant/:id`)**: Executive AI Verification Report & Cross-Match Audit (4 Risk Gauges, Form vs OCR table, XAI Risk factors, Document Gallery).
   - **Page 2 (`/admin/review/:id`)**: Forensic Inspector Workbench with CNN Tamper Heatmaps and Official Approve / Reject decision actions.
8. **Automated Certified PDF Verification Reports**:
   - Tamper-evident PDF report generation powered by **ReportLab** with cryptographic verification hashes, extracted data tables, and score gauges.

---

## 🏗️ System Architecture & Tech Stack

```
Frontend:     React.js 18, TypeScript, Material UI v5, Redux Toolkit, Axios, @react-oauth/google
Backend:      FastAPI, Python 3.11, Pydantic v2, SQLAlchemy, Uvicorn
AI / ML:      EasyOCR, InsightFace, PyTorch, XGBoost, SHAP, Sentence-Transformers, OpenCV
Reporting:    ReportLab PDF Engine
Storage:      Local structured storage (uploads/aadhaar, pan, utility, selfies, heatmaps, reports)
Auth:         Google OAuth 2.0, JWT Authentication, Salted Bcrypt Password Hashing, RBAC
Deployment:   Cloudflare Tunnel & Docker
```

---

## 🚀 Local Run Instructions

### 1. Backend Setup & Run

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup & Run

```bash
cd frontend
npm install
npm start
```

---

## 👥 Roles & Access

* **Applicant**: Complete self-service KYC submission, webcam selfie capture, application status tracking.
* **Compliance Admin**: Access to the Admin Review Queue, dedicated Applicant Dossier reports, forensic CNN tampering inspection console, and official approval/rejection audit decisions.
