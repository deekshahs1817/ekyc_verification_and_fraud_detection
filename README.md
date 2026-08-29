# 🛡️ AI-Powered eKYC Verification & Fraud Detection System

An enterprise-grade, full-stack automated eKYC verification and fraud detection platform. Built with **React 18, TypeScript, Material UI, Redux Toolkit, FastAPI, Python 3.11, PyTorch, EasyOCR, InsightFace, OpenCV, and XGBoost**.

---

## 🌐 Repository & Cloudflare Deployment

| Resource | URL / Command |
| :--- | :--- |
| **📦 GitHub Repository** | **[https://github.com/deekshahs1817/ekyc_verification_and_fraud_detection](https://github.com/deekshahs1817/ekyc_verification_and_fraud_detection)** |
| **🎨 Cloudflare Pages Frontend** | `npx wrangler pages deploy frontend/build --project-name=ekyc-verification` |
| **⚡ Backend API (FastAPI)** | `uvicorn app.main:app --host 0.0.0.0 --port 8000` |
| **📚 Interactive Swagger Docs** | `/docs` |

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
   - Multi-cue **Liveness Detection** evaluating 2D-FFT screen moiré patterns, specular reflection glares, and micro-texture gradients.
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
   - Tamper-evident PDF report generation powered by **ReportLab** and in-browser fallback with cryptographic verification hashes, extracted data tables, and score gauges.

---

## 🏗️ System Architecture & Tech Stack

```
Frontend:     React.js 18, TypeScript, Material UI v5, Redux Toolkit, Axios, @react-oauth/google
Backend:      FastAPI, Python 3.11, Pydantic v2, SQLAlchemy, Uvicorn
AI / ML:      EasyOCR, InsightFace, PyTorch, XGBoost, SHAP, Sentence-Transformers, OpenCV
Reporting:    ReportLab PDF Engine & jsPDF In-Browser Generator
Storage:      Local structured storage (uploads/aadhaar, pan, utility, selfies, heatmaps, reports)
Auth:         Google OAuth 2.0, JWT Authentication, Salted Bcrypt Password Hashing, RBAC
Deployment:   Cloudflare Pages, Cloudflare Tunnel (Zero Trust), Docker
```

---

## ☁️ Cloudflare Deployment Guide

### A. Deploy Frontend to Cloudflare Pages

1. **Build the production assets**:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
2. **Deploy via Wrangler CLI**:
   ```bash
   npx wrangler pages deploy build --project-name=ekyc-verification
   ```
3. **Or Deploy via Cloudflare Dashboard Git Integration**:
   - Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
   - Select repository: `deekshahs1817/ekyc_verification_and_fraud_detection`.
   - Build configuration:
     - **Framework preset**: `Create React App`
     - **Build command**: `npm run build`
     - **Build output directory**: `frontend/build` (or root directory `/frontend` with `build`)
     - **Root directory**: `frontend`
     - **Environment variables**: `REACT_APP_API_URL` set to your backend API URL (e.g. `https://your-backend.trycloudflare.com`).
   - SPA routing is pre-configured via `public/_redirects` (`/*  /index.html  200`).

### B. Deploy / Expose Backend via Cloudflare Tunnel

1. **Start the FastAPI backend**:
   ```bash
   cd backend
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
2. **Expose securely via Cloudflare Tunnel**:
   ```bash
   cloudflared tunnel --url http://localhost:8000
   ```
   *(Or configure a persistent Zero Trust named tunnel in your Cloudflare dashboard pointing to your backend host and port)*.

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

