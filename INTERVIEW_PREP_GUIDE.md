# 🎓 Comprehensive Interview Master Guide
## AI-Powered eKYC Verification & Fraud Detection Platform
**Author / Candidate**: Deeksha H S  
**Project Repository**: [GitHub: deekshahs1817/ekyc_verification_and_fraud_detection](https://github.com/deekshahs1817/ekyc_verification_and_fraud_detection)  
**Tech Stack**: React 18, TypeScript, FastAPI, Python 3.11, PyTorch, InsightFace, EasyOCR, XGBoost, OpenCV, SQLAlchemy, Cloudflare

---

## 📑 TABLE OF CONTENTS
1. [Executive Summary & High-Level Architecture](#1-executive-summary--high-level-architecture)
2. [End-to-End System Workflow](#2-end-to-end-system-workflow)
3. [Deep Dive into the 7 AI/ML Subsystems](#3-deep-dive-into-the-7-aiml-subsystems)
   - 3.1 Document Extraction & OCR Engine (EasyOCR / PaddleOCR + CLAHE)
   - 3.2 Mathematical Checksum & Syntax Validation (Verhoeff D5 & PAN Regex)
   - 3.3 Biometric Face Verification (InsightFace ArcFace 512-D Cosine Similarity)
   - 3.4 Multi-Cue Passive Anti-Spoofing Liveness Detection (2D-FFT & Texture)
   - 3.5 Digital Image Forensics & CNN Error Level Analysis (ELA Heatmap)
   - 3.6 Identity Deduplication & 6-Tier AML Compliance Rule Engine
   - 3.7 XGBoost Ensemble Risk Classifier + Explainable AI (XAI)
4. [Database Schema & Security Architecture](#4-database-schema--security-architecture)
5. [Frontend & Cloudflare Deployment Architecture](#5-frontend--cloudflare-deployment-architecture)
6. [36 In-Depth Technical Interview Questions & Model Answers](#6-36-in-depth-technical-interview-questions--model-answers)
   - Category 1: System Architecture & Workflow (Q1 – Q5)
   - Category 2: Computer Vision, OCR & Checksum Algorithms (Q6 – Q11)
   - Category 3: Biometrics, Face Verification & Liveness Anti-Spoofing (Q12 – Q16)
   - Category 4: Digital Image Forensics & CNN Tamper Detection (Q17 – Q21)
   - Category 5: Deduplication, AML Engine & XGBoost Risk Classifier (Q22 – Q27)
   - Category 6: Backend, Database & Security Engineering (Q28 – Q32)
   - Category 7: Frontend Architecture & Cloudflare Deployment (Q33 – Q36)

---

# 1. Executive Summary & High-Level Architecture

The **AI-Powered eKYC Verification & Fraud Detection System** is an enterprise-grade, automated identity verification platform designed to replace manual, error-prone compliance workflows with an instant, multi-agent AI verification pipeline.

### Architectural Diagram
```
                                  ┌────────────────────────────────────────────────────────┐
                                  │                  CLIENT LAYER (React 18)               │
                                  │   Applicant KYC Portal  │   Compliance Review Center   │
                                  └───────────────────────────┬────────────────────────────┘
                                                              │ REST API / Axios + JWT
                                                              ▼
                                  ┌────────────────────────────────────────────────────────┐
                                  │                 BACKEND API GATEWAY                    │
                                  │         FastAPI (Python 3.11) + Pydantic v2            │
                                  │    JWT Auth (HS256) │ RBAC │ Rate Limiting │ CORS      │
                                  └───────────────────────────┬────────────────────────────┘
                                                              │
                                                              ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                           MULTI-STAGE AI VERIFICATION PIPELINE                                         │
 ├────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │  1. Image Preprocessing & OCR Engine: Multi-pass CLAHE, Bilateral Filter, EasyOCR / PaddleOCR text parsing              │
 │  2. Mathematical Validation: 12-Digit Verhoeff Dihedral (D5) Checksum for Aadhaar, Regex Structure for PAN              │
 │  3. Form ↔ OCR Cross-Verification: Levenshtein Distance + Cosine Similarity on Text Embeddings (0–100 Consistency)      │
 │  4. Biometric Face Verification: InsightFace (ArcFace 512-D Embeddings) Cosine Similarity (ID Photo vs Live Selfie)    │
 │  5. Passive Anti-Spoofing Liveness: 2D-FFT Moiré Frequency Analysis + Specular Glare + Micro-Texture Gradient          │
 │  6. Forensic Tamper Detection: Error Level Analysis (ELA) + Custom 4-Layer CNN + Heatmap Color Mapping                 │
 │  7. Deduplication & 6-Tier AML Engine: Exact & Fuzzy Cross-Account Matching, Minor Checks, Shell Address Flagging     │
 │  8. XGBoost Risk Ensemble + XAI: 13 Engineered Risk Features -> Fraud Score (0-100), Trust Score, Risk Tier + SHAP/XAI │
 └────────────────────────────────────────────────────────────┬───────────────────────────────────────────────────────────┘
                                                              │
                                                              ▼
                                  ┌────────────────────────────────────────────────────────┐
                                  │              OUTPUT & AUDIT ECOSYSTEM                  │
                                  │  • ReportLab Cryptographic PDF Verification Certificate│
                                  │  • Immutable Audit Log Recording in SQLite/PostgreSQL  │
                                  │  • Real-Time Notification Stream                       │
                                  └────────────────────────────────────────────────────────┘
```

---

# 2. End-to-End System Workflow

1. **Self-Service Submission**:
   - Applicant registers and enters legal identity details (Name, DOB, Gender, Address, Phone, Aadhaar, PAN).
   - Applicant uploads front/back scans of Aadhaar/PAN cards and captures a live webcam selfie.
2. **Backend Ingestion**:
   - FastAPI receives `multipart/form-data`, validates MIME types, checks size limits ($15\text{ MB}$), and saves files to a secure vault.
3. **Execution of AI Engines**:
   - In parallel, computer vision, mathematical, and biometric algorithms process the files.
4. **Ensemble Risk Aggregation**:
   - 13 distinct numerical and categorical outputs are transformed into a feature vector for the XGBoost classifier.
   - The system outputs a Fraud Score ($0-100\%$), Trust Score, and Risk Tier (`LOW`, `MEDIUM`, `HIGH`).
5. **Human-in-the-Loop Review**:
   - Clean applications (`LOW` risk) are automatically marked as `APPROVED`.
   - Applications with anomalies (`MEDIUM` or `HIGH` risk) enter the Compliance Review Queue where compliance officers inspect side-by-side OCR panels and forensic CNN heatmaps.

---

# 3. Deep Dive into the 7 AI/ML Subsystems

### 3.1 Document Extraction & OCR Engine
- **Preprocessing**: Grayscale conversion $\to$ Bilateral Filter (noise removal while keeping edges sharp) $\to$ **CLAHE (Contrast Limited Adaptive Histogram Equalization)** on $8 \times 8$ pixel tiles to eliminate harsh shadows.
- **Deep Learning OCR**: Employs CRAFT (Character Region Awareness for Text Detection) combined with CRNN (Convolutional Recurrent Neural Network) with CTC loss.
- **Form Cross-Verification**: Compares user-entered form data against OCR text tokens using normalized **Levenshtein Edit Distance** and **Sentence-Transformer** (`all-MiniLM-L6-v2`) embeddings:
  $$\text{Consistency Score} = 0.35(\text{Name}) + 0.25(\text{DOB}) + 0.20(\text{Address}) + 0.10(\text{Aadhaar}) + 0.10(\text{PAN})$$

### 3.2 Mathematical Checksum & Syntax Validation
- **Aadhaar Verhoeff Checksum**: Validates the 12th digit of Aadhaar numbers using the **Dihedral Group $D_5$** permutation ($p$) and multiplication ($d$) tables. Catches $100\%$ of single-digit errors and $100\%$ of adjacent transposition errors.
- **PAN Card Pattern**: Regular expression `^[A-Z]{5}[0-9]{4}[A-Z]$`, verifying 4th character entity type (`P` for Person) and 5th character applicant surname initial.

### 3.3 Biometric Face Verification (InsightFace ArcFace)
- **Face Extraction**: Uses RetinaFace to detect and crop the face from the ID document and live webcam selfie into $112 \times 112$ aligned tensors.
- **ArcFace Embedding**: Deep neural network trained with **Additive Angular Margin Loss** to produce a compact, normalized $512$-dimensional vector.
- **Matching Metric**: Computes the **Cosine Similarity**:
  $$\text{Cosine Similarity} = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\|_2 \|\mathbf{v}\|_2} \times 100$$
  Scores $\ge 70\%$ confirm biometric match.

### 3.4 Multi-Cue Passive Anti-Spoofing Liveness Detection
- **2D-FFT Moiré Analysis**: Converts spatial pixel intensities into the 2D frequency domain. Digital screen replays exhibit sharp, harmonic frequency peaks, whereas live skin exhibits a smooth, decaying power spectrum.
- **Specular Glare Analysis**: Thresholds high-luminance, low-chroma clusters in HSV space to identify photo printout reflections.
- **Laplacian Micro-Texture Gradient**: Evaluates high-frequency skin pore detail vs low-resolution paper printouts.

### 3.5 Digital Image Forensics & CNN Error Level Analysis (ELA)
- **ELA Process**: Resaves images at a fixed $90\%$ JPEG quality and computes the absolute pixel difference:
  $$\Delta I = |I_{\text{original}} - I_{\text{resaved}}| \times \text{scale}$$
- **Tampering Detection**: Original unedited regions achieve compression equilibrium, while digitally modified text or spliced photos display high compression error deltas.
- **CNN Classifier**: A 4-layer Convolutional Neural Network predicts tamper confidence and outputs a color-mapped JET heatmap overlay (`cv2.COLORMAP_JET`).

### 3.6 Identity Deduplication & 6-Tier AML Compliance Rule Engine
- **Deduplication**: Queries database for existing records with matching Aadhaar numbers, PAN IDs, phone numbers, or facial embedding vectors.
- **AML Policy Rules**:
  1. *Minor Check*: Flags applicants $<18$ years old.
  2. *Shell Address Flag*: Regex flags keywords (`PO BOX`, `OFFSHORE`, `SUITE`, `GIFT CITY SHELL`).
  3. *Velocity Alert*: Flags $>3$ submissions from the same IP/Device within 24 hours.
  4. *Income Anomaly*: High declared income ($>10,000,000\text{ INR}$) for students or unemployed.

### 3.7 XGBoost Ensemble Risk Classifier + Explainable AI (XAI)
- **13 Feature Vector**:
  `[face_score, liveness_score, tamper_score, consistency_score, blur_score, name_similarity, address_similarity, aadhaar_valid, pan_valid, aml_flag, duplicate_flag, dob_match, phone_match]`
- **Outputs**:
  - Fraud Probability ($0-100\%$)
  - Trust Score ($100 - \text{Fraud Score}$)
  - Risk Category: `LOW` ($\le 30$), `MEDIUM` ($31-70$), `HIGH` ($> 70$)
- **Explainable AI (XAI)**: Uses TreeSHAP to calculate the percentage contribution of each feature to the final risk score.

---

# 4. Database Schema & Security Architecture

### Relational Schema (SQLAlchemy)
| Table | Key Fields | Purpose |
| :--- | :--- | :--- |
| **`users`** | `id`, `name`, `email`, `password_hash`, `role`, `profile_completed` | User identity and RBAC authorization |
| **`kyc_records`** | `id`, `user_id`, `entered_*`, `ocr_*`, `file_paths`, `scores`, `risk_level`, `status` | Core verification dossier and audit metrics |
| **`audit_logs`** | `id`, `user_id`, `action`, `ip_address`, `user_agent`, `payload`, `timestamp` | Immutable legal audit logs for compliance |
| **`notifications`** | `id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at` | Real-time event notifications |
| **`otp_verifications`** | `id`, `email`, `otp_code`, `attempts`, `expires_at` | Secure passwordless and 2FA verification |

### Security Engineering
- **Password Protection**: Salted **Bcrypt** hashing with work factor of 12 rounds.
- **Session Tokens**: Cryptographically signed **JWT (JSON Web Tokens)** using `HS256`.
- **Fail-Safe Persistence**: Dual-engine connection pool (PostgreSQL for cloud with SQLite local fallback).

---

# 5. Frontend & Cloudflare Deployment Architecture

- **React 18 + TypeScript**: Type-safe component architecture with Redux Toolkit state management.
- **Material UI (MUI v5)**: Theme-aware responsive UI supporting Dark/Light mode.
- **Cloudflare Pages Deployment**:
  - `_redirects` file configured with `/*  /index.html  200` to support Single Page Application (SPA) client-side routing.
  - `_headers` configured with `X-Frame-Options: SAMEORIGIN` and `X-Content-Type-Options: nosniff`.
  - Backend CORS configured with dynamic regex supporting `*.pages.dev`, `*.workers.dev`, and `*.trycloudflare.com`.

---

# 6. 36 In-Depth Technical Interview Questions & Model Answers

---

### 📂 Category 1: System Architecture & Workflow

#### Q1: Can you give a 2-minute elevator pitch of your project?
**Answer:**  
"I built an enterprise-grade, automated eKYC verification and fraud detection platform. It eliminates manual identity verification bottlenecks and combats synthetic identity fraud using a multimodal AI pipeline. 

The system accepts an applicant's ID cards (Aadhaar/PAN) and a live webcam selfie. In under 3 seconds, it executes OCR extraction, mathematical Verhoeff checksum validation, InsightFace 512-D biometric matching, passive anti-spoofing liveness detection, and CNN Error Level Analysis (ELA) to detect forged documents. These signals feed into an XGBoost ensemble classifier that outputs a calibrated Fraud Score and Explainable AI (XAI) risk factors. Compliance officers get an interactive forensic review dashboard with automated certified PDF audit reports."

---

#### Q2: What is the end-to-end data flow when an applicant submits their KYC documents?
**Answer:**  
1. **Client Submission**: The applicant enters their personal data on the React frontend, uploads Aadhaar/PAN scans, and captures a live webcam selfie.
2. **API Ingestion**: FastAPI receives a `multipart/form-data` payload, authenticates the JWT bearer token, and stores files in a secure directory vault.
3. **Parallel AI Engine Execution**:
   - OCR extracts document text; CLAHE and Bilateral filters enhance image quality.
   - Verhoeff algorithm checks the Aadhaar 12th digit; PAN regex validates tax format.
   - Text similarity algorithms compare form fields with OCR text.
   - InsightFace aligns faces and calculates cosine similarity between the ID photo and the live webcam selfie.
   - Passive anti-spoofing evaluates FFT screen moiré patterns and skin micro-texture.
   - ELA extracts compression deltas, and a CNN outputs a tampering heatmap.
4. **AML & Deduplication**: Database queries search for duplicate IDs/faces and evaluate 6 AML rule violations.
5. **XGBoost Scoring**: The 13 extracted features pass into the XGBoost classifier, generating Fraud Risk, Trust Score, and XAI factors.
6. **Persistence & Response**: The record is committed to the database, an immutable audit log is created, and the response is returned to the client in real time.

---

#### Q3: Why did you choose FastAPI over Flask or Django for the backend?
**Answer:**  
1. **Asynchronous Concurrency**: FastAPI is built on Starlette and `asyncio`, offering high throughput under heavy I/O-bound operations (file uploads, image disk reads, external API calls).
2. **Pydantic Validation**: Automatic schema validation, data serialization, and descriptive 422 HTTP errors reduce boilerplate.
3. **Auto-Generated OpenAPI / Swagger**: Native interactive documentation at `/docs` speeds up frontend-backend integration.
4. **Performance**: Benchmarks consistently place FastAPI on par with Node.js and Go, outperforming synchronous Flask/Django setups.

---

#### Q4: How does your system support Role-Based Access Control (RBAC)?
**Answer:**  
The system uses custom FastAPI dependency injection functions (`get_current_user` and `get_current_admin_user` in `deps.py`).
- Upon authentication, a signed JWT token containing the `sub` (User ID) and `role` (`USER`, `ADMIN`, `COMPLIANCE_OFFICER`) is issued.
- Protected endpoints declare dependencies like `admin_user: User = Depends(get_current_admin_user)`. If a standard `USER` attempts to access admin routes (e.g., `/api/v1/admin/review`), FastAPI immediately throws a `403 FORBIDDEN` exception before executing any business logic.

---

#### Q5: How do you handle fail-safes if one AI model (e.g., InsightFace or OCR) fails or times out?
**Answer:**  
In `pipeline.py`, every AI sub-service is wrapped in isolated `try-except` blocks with deterministic heuristic fallbacks:
- If OCR fails due to severe motion blur, the system logs a `Blur Alert`, assigns a low text consistency score, and flags the record for manual review rather than crashing with a 500 error.
- If face detection fails (e.g., face obscured), `face_score` defaults to `0.0`, triggering an `Action Required: Re-upload Photo` recommendation.
- This ensures the API pipeline is fail-safe, resilient, and always returns a valid, structured assessment.

---

### 📂 Category 2: Computer Vision, OCR & Checksum Algorithms

#### Q6: Why did you choose EasyOCR / PaddleOCR over Tesseract OCR?
**Answer:**  
Traditional Tesseract OCR relies heavily on binarization and morphological operations, which struggle on ID cards with complex holographic backgrounds, colored watermark patterns, low resolution, or tilted text.
- **EasyOCR / PaddleOCR** use deep learning architectures: **CRAFT (Character Region Awareness for Text Detection)** to detect arbitrarily oriented text boxes, followed by a **CRNN (ResNet + BiLSTM + CTC)** sequence recognition model.
- This deep learning approach delivers significantly higher character recognition accuracy on noisy, compressed ID scans.

---

#### Q7: What image preprocessing steps are applied to ID cards prior to OCR?
**Answer:**  
1. **Grayscale Conversion**: Eliminates color noise and reduces processing overhead.
2. **Bilateral Filtering**: Smooths background noise while preserving sharp character edge gradients.
3. **CLAHE (Contrast Limited Adaptive Histogram Equalization)**: Operates on small tile regions ($8 \times 8$) to boost local contrast, neutralizing harsh shadows and overexposed glare.
4. **Morphological Top-Hat/Black-Hat Transform**: Isolates dark text characters from bright, patterned security backgrounds.

---

#### Q8: What is the Verhoeff Algorithm and why is it used for Aadhaar validation?
**Answer:**  
The **Verhoeff Algorithm** is a mathematical checksum algorithm based on the dihedral group $D_5$ (symmetries of a regular pentagon).
- It utilizes two predefined $10 \times 10$ matrices: the **multiplication table ($d$)** and the **permutation table ($p$)**, combined with an inverse table ($inv$).
- **Why it matters**: Simple modulo-10 algorithms (like Luhn) miss adjacent transposition errors (e.g., typing `12` as `21` when both digits sum the same). Verhoeff catches **100% of single-digit substitution errors** and **100% of all transposition errors** between adjacent digits.

---

#### Q9: How does your PAN Card validation work?
**Answer:**  
PAN cards follow a strict statutory 10-character alphanumeric structure: `^[A-Z]{5}[0-9]{4}[A-Z]$`.
- Characters 1–3: Alphabetic series (`AAA` to `ZZZ`).
- Character 4: Entity Category (`P` = Individual Person, `C` = Company, `H` = HUF, `F` = Firm, `A` = Association of Persons, `T` = Trust).
- Character 5: First character of the applicant's legal last name.
- Characters 6–9: Sequential numbers (`0001` to `9999`).
- Character 10: Alphabetic check digit.
Our system cross-references the 4th character against the user's registration type and verifies the 5th character matches the applicant's surname initial.

---

#### Q10: How do you compute the Form ↔ OCR Consistency Score?
**Answer:**  
We use a hybrid multi-field matching metric:
1. **String Distance**: Computes normalized **Levenshtein similarity**:
   $$\text{Ratio}(s_1, s_2) = 1 - \frac{\text{LevenshteinDistance}(s_1, s_2)}{\max(|s_1|, |s_2|)}$$
2. **Semantic Similarity**: Passes complex address strings through a Sentence-Transformer embedding model (`all-MiniLM-L6-v2`) and computes cosine similarity to account for address abbreviations (e.g., "St." vs "Street", "Blvd" vs "Boulevard").
3. **Weighted Aggregation**:
   $$\text{Score} = 0.35(\text{Name}) + 0.25(\text{DOB}) + 0.20(\text{Address}) + 0.10(\text{Aadhaar}) + 0.10(\text{PAN})$$

---

#### Q11: How do you detect and handle blurred document uploads?
**Answer:**  
We use the **Variance of the Laplacian**:
$$\text{Blur Metric} = \text{Var}(\nabla^2 I) = \frac{1}{N} \sum (L(x,y) - \mu)^2$$
Where $L(x,y)$ is the image convolved with the $3 \times 3$ Laplacian kernel:
$$\begin{bmatrix} 0 & 1 & 0 \\ 1 & -4 & 1 \\ 0 & 1 & 0 \end{bmatrix}$$
- Sharp images with well-defined edges produce a high Laplacian variance ($> 100$).
- Blurry images lack sharp edges, resulting in a low variance ($< 50$). If the score is below the threshold, the upload is flagged as `BLUR_DETECTED` with a prompt to retake the photo.

---

### 📂 Category 3: Biometrics, Face Verification & Liveness

#### Q12: How does InsightFace / ArcFace work for biometric matching?
**Answer:**  
Traditional Softmax loss only ensures features from different classes are separable, but not necessarily compact.
- **ArcFace (Additive Angular Margin Loss)** adds an angular penalty $m$ directly to the target angle $\theta_{y_i}$:
  $$L = -\frac{1}{N} \sum_{i=1}^N \log \frac{e^{s(\cos(\theta_{y_i} + m))}}{e^{s(\cos(\theta_{y_i} + m))} + \sum_{j \neq y_i} e^{s \cos \theta_j}}$$
- This forces deep neural networks to learn representations where intra-class features are compressed onto a hypersphere and inter-class features are pushed far apart.
- It produces a **512-dimensional embedding** where matching faces yield a cosine similarity $\ge 0.70$.

---

#### Q13: What is the difference between Active and Passive Liveness Detection? Why use Passive?
**Answer:**  
- **Active Liveness**: Requires the user to follow instructions (e.g., "Blink 3 times", "Turn head left", "Smile").  
  *Downsides*: Higher friction, higher drop-off rates, vulnerable to deepfake injection software mimicking instructions.
- **Passive Liveness**: Evaluates a single captured frame or short sequence silently without requiring user actions.  
  *Advantages*: Zero user friction, sub-second execution, and highly effective at catching presentation attacks (photos, screen replays, 3D masks).

---

#### Q14: How does your 2D-FFT Moiré Pattern analysis detect screen replay attacks?
**Answer:**  
When an attacker points a webcam at a digital screen (iPad, phone, monitor), the pixel grid of the display interacts with the sensor Bayer matrix of the camera, creating high-frequency interference patterns known as **Moiré Fringes**.
- Applying a **2D Fast Fourier Transform (FFT)** converts the spatial domain image to the frequency domain:
  $$F(u,v) = \iint f(x,y) e^{-j 2\pi (ux + vy)} dx\,dy$$
- A live human face exhibits a smooth, decaying power spectrum.
- A digital screen replay displays unnatural, sharp harmonic peak spikes in the high-frequency quadrants. Detecting these frequency spikes flags the capture as a digital screen replay.

---

#### Q15: How do you handle specular reflection and glare detection on ID card photos?
**Answer:**  
Laminated ID cards and glass display screens produce localized specular glares when illuminated by ambient light.
- We segment the image into the HSV/LAB color spaces and threshold pixels with high lightness ($L > 240$) and low chroma ($S < 15$).
- We compute connected component analysis on these clusters. If large contiguous specular glare patches overlap critical facial features (eyes, nose, mouth), the selfie/document is flagged for presentation attack or glare obscuration.

---

#### Q16: What happens when an ID photo is from 10 years ago and the person looks older today?
**Answer:**  
ArcFace 512-D embeddings are trained on massive demographic datasets (MS1MV2, Glint360k) with age-invariant triplet loss formulations.
- The model prioritizes deep skeletal structural ratios (inter-pupillary distance, jawline bone structure, nasal bridge angles) over superficial surface features (skin wrinkles, hairstyle, minor facial weight).
- Our empirically calibrated threshold ($\text{Cosine Similarity} \ge 0.65 - 0.70$) accommodates natural biological aging while rejecting distinct impostor identities.

---

### 📂 Category 4: Digital Image Forensics & CNN Tamper Detection

#### Q17: What is Error Level Analysis (ELA) and how does it detect forged documents?
**Answer:**  
JPEG is a lossy compression algorithm that operates in $8 \times 8$ pixel frequency blocks using Discrete Cosine Transform (DCT).
- Every time a JPEG image is saved, high-frequency details degrade at a predictable rate until reaching an error equilibrium.
- If someone uses Photoshop or digital tools to paste new text, change digits, or splice a new face photo onto an ID card, the newly inserted pixels are at a **different compression generation** than the rest of the background.
- Resaving the image at a known $90\%$ quality and computing the pixel difference matrix $|I_{\text{original}} - I_{\text{resaved}}|$ exposes these modified zones as bright, high-error anomalies.

---

#### Q18: What is the architecture of your CNN Tamper Detection Model?
**Answer:**  
Our tamper detection network takes the $3$-channel ELA difference tensor ($256 \times 256 \times 3$) as input:
1. **Conv2D Layer 1**: 32 filters ($3 \times 3$), ReLU, Batch Normalization, MaxPooling ($2 \times 2$).
2. **Conv2D Layer 2**: 64 filters ($3 \times 3$), ReLU, Batch Normalization, MaxPooling ($2 \times 2$).
3. **Conv2D Layer 3**: 128 filters ($3 \times 3$), ReLU, Dropout ($0.25$), MaxPooling ($2 \times 2$).
4. **Conv2D Layer 4**: 256 filters ($3 \times 3$), ReLU, Global Average Pooling.
5. **Dense Classification Head**: Dense (128) $\to$ Dropout ($0.5$) $\to$ Dense (1, Sigmoid) outputting the **Tamper Probability ($0.0 - 1.0$)**.
- The intermediate feature activation map is upsampled to generate the localized RGB Heatmap.

---

#### Q19: How is the visual Heatmap generated for the Compliance Reviewer?
**Answer:**  
1. We compute the normalized gradient magnitude and ELA error intensity per pixel.
2. We apply a Gaussian blur kernel ($k=15$) to smooth noise and highlight continuous manipulation boundaries.
3. The normalized single-channel intensity map ($0 - 255$) is passed to OpenCV's `cv2.applyColorMap(intensity, cv2.COLORMAP_JET)`.
4. The resulting JET colormap (Red = High Tampering, Blue = Authentic Background) is alpha-blended with the original document image at $\alpha = 0.5, \beta = 0.5$, producing an intuitive visual overlay for compliance officers.

---

#### Q20: Can ELA detect tampered PDFs or PNG files?
**Answer:**  
PNG files use lossless DEFLATE compression, so standard JPEG ELA cannot be directly applied.
- For PNG/PDF uploads, our pipeline renders the document into a high-DPI raster matrix, applies a controlled JPEG DCT compression cycle, and analyzes local gradient entropy variations and resampling interpolation artifacts using **Bicubic Spline Anomaly Detection**.

---

#### Q21: What are "Copy-Move" forgeries and how does your system catch them?
**Answer:**  
A copy-move forgery occurs when an attacker copies a legitimate character or seal from one part of the document and pastes it over another (e.g., copying digit `8` from the date and pasting it over digit `1` in the income field).
- In addition to ELA, we compute **ORB (Oriented FAST and Rotated BRIEF)** and **SIFT keypoint descriptors**.
- We match keypoint feature vectors against themselves; clusters of identical feature descriptors appearing in different spatial coordinates indicate duplicated elements.

---

### 📂 Category 5: Deduplication, AML Engine & XGBoost Risk Classifier

#### Q22: What are the 13 input features fed into your XGBoost Classifier?
**Answer:**  
| # | Feature Name | Type | Description |
|---|---|---|---|
| 1 | `face_similarity` | Float (0–100) | InsightFace ArcFace Cosine Similarity |
| 2 | `liveness_score` | Float (0–100) | Multi-cue passive anti-spoofing score |
| 3 | `tamper_score` | Float (0–100) | CNN ELA manipulation confidence |
| 4 | `consistency_score` | Float (0–100) | Weighted string & semantic text match |
| 5 | `blur_score` | Float (0–100) | Laplacian edge variance |
| 6 | `name_similarity` | Float (0–100) | Levenshtein ratio for Applicant Name |
| 7 | `address_similarity`| Float (0–100) | Sentence-Transformer cosine distance |
| 8 | `aadhaar_valid` | Binary (0/1) | Verhoeff dihedral group check result |
| 9 | `pan_valid` | Binary (0/1) | Regex format & category validation |
| 10 | `aml_flag` | Binary (0/1) | Any triggered AML policy violations |
| 11 | `duplicate_flag` | Binary (0/1) | Identity reuse detected in database |
| 12 | `dob_match` | Binary (0/1) | Form DOB vs OCR DOB match |
| 13 | `phone_match` | Binary (0/1) | Form Phone vs OCR Phone match |

---

#### Q23: Why did you choose XGBoost over a Deep Neural Network for the risk score?
**Answer:**  
1. **Superior Performance on Tabular Data**: Tree-based gradient boosting models (XGBoost) consistently outperform deep networks on structured, heterogeneous tabular features.
2. **Interpretability & Explainable AI (XAI)**: XGBoost natively exposes exact feature importance and enables TreeSHAP calculations, providing compliance audits with clear explanations.
3. **Handling Mixed Feature Scales**: Handles combinations of binary flags, percentages, and continuous distributions without requiring complex normalization.
4. **Latency**: Sub-millisecond CPU inference time compared to GPU-heavy neural networks.

---

#### Q24: How does Explainable AI (XAI) work in your dashboard?
**Answer:**  
Compliance officers cannot accept a "black box" prediction.
- Our XAI engine computes the marginal contribution of each feature to the final risk score using **TreeSHAP (SHapley Additive exPlanations)**.
- If an applicant is assigned a high Fraud Risk of $88.5\%$, the dashboard breaks down the exact contributors:
  - *Document Tampering Detected*: $+38.0\%$ risk contribution
  - *AML Policy Alert (Minor / PO Box)*: $+30.0\%$ risk contribution
  - *Facial Biometric Mismatch*: $+22.0\%$ risk contribution
- This gives human compliance officers full transparency into why an alert was triggered.

---

#### Q25: How does your Deduplication Engine prevent Sybil attacks and identity reuse?
**Answer:**  
When an application is submitted, `duplicate_detector.py` runs three checks against existing database records:
1. **Exact Match**: Queries for duplicate Aadhaar numbers or PAN IDs registered to a different `user_id`.
2. **Contact Reuse**: Checks for identical phone numbers or email addresses across multiple submissions.
3. **Biometric Vector Match**: Computes cosine distance against stored 512-D facial embeddings. If an individual attempts to apply under a false name with a forged document, their face matches the biometric record of a previously registered account.

---

#### Q26: What specific Anti-Money Laundering (AML) rules are enforced?
**Answer:**  
1. **Age Threshold Check**: Flags applicants under 18 years old requiring guardian consent.
2. **Non-Residential Shell Address Filter**: Detects suspicious keywords (`PO BOX`, `OFFSHORE`, `SUITE`, `GIFT CITY SHELL`, `VIRTUAL OFFICE`).
3. **Income-to-Occupation Anomaly**: Flags declared annual income $> 10,000,000$ INR paired with occupations like `Student`, `Unemployed`, or `Retired`.
4. **Submission Velocity Spike**: Flags $>3$ KYC attempts from the same IP address or device fingerprint within 24 hours.

---

#### Q27: How do you handle Class Imbalance during XGBoost training?
**Answer:**  
In real-world KYC datasets, fraudulent cases typically represent $<2\%$ of total submissions.
- We configured the XGBoost parameter `scale_pos_weight = count(negative_instances) / count(positive_instances)` to heavily penalize false negatives.
- We used **SMOTE (Synthetic Minority Over-sampling Technique)** on synthetic training batches to balance the feature space.
- We evaluated the model using **PR-AUC (Precision-Recall Area Under Curve)** and **F1-Score** rather than raw classification accuracy.

---

### 📂 Category 6: Backend, Database & Security Engineering

#### Q28: How are passwords stored and authenticated securely?
**Answer:**  
- Passwords are never stored in plaintext.
- We use **Bcrypt** with adaptive work factor (salt rounds = 12) via Python's `passlib[bcrypt]` library.
- Bcrypt incorporates a unique random 128-bit salt per user and uses the Blowfish-based key derivation function to resist rainbow table attacks and GPU-accelerated brute-force attacks.

---

#### Q29: How does JWT Authentication work in your system?
**Answer:**  
1. Upon successful login (`POST /api/v1/auth/login`), the server signs a JWT containing the user payload (`sub`, `role`, `iat`, `exp = 24h`) using `HS256` and a strong server `SECRET_KEY`.
2. The client stores this token in secure storage and attaches it as an HTTP header: `Authorization: Bearer <token>`.
3. FastAPI's `deps.py` intercepts incoming requests, decodes and verifies the cryptographic signature, checks expiration, and retrieves the active user session.

---

#### Q30: How is the database architected for fail-safe persistence?
**Answer:**  
In `database.py`:
- The system connects to **PostgreSQL** in production with connection pooling (`pool_size=5`, `max_overflow=10`, `pool_pre_ping=True`).
- If PostgreSQL is unavailable (e.g., in standalone offline development), it automatically falls back to **SQLite** (`sqlite:///./ekyc_app.db`) without throwing unhandled exceptions.
- On startup, `Base.metadata.create_all()` builds all relational tables, and `seed_data.py` populates demo admin and user records so the system is immediately testable.

---

#### Q31: How are certified PDF verification reports generated?
**Answer:**  
We implement a dual-layer reporting architecture:
1. **Server-Side Engine (ReportLab)**: Generates a tamper-evident PDF featuring cryptographic SHA-256 document verification hashes, applicant metadata, extracted OCR tables, risk score gauges, and official approval/rejection timestamps.
2. **Client-Side Fallback (jsPDF + html2canvas)**: If the backend network is offline, the React frontend dynamically renders the dossier DOM nodes and generates an identical downloadable PDF report locally in the browser.

---

#### Q32: What database tables exist in your schema?
**Answer:**  
1. **`users`**: User ID, name, email, hashed password, role (`USER`/`ADMIN`), profile completion status, timestamps.
2. **`kyc_records`**: Foreign key `user_id`, entered form values, extracted OCR fields, file vault paths, face/liveness/tamper scores, AML flags, XGBoost fraud scores, review notes, decision status (`SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`).
3. **`audit_logs`**: Immutable audit trails containing `user_id`, `action`, `ip_address`, `user_agent`, JSON payload metadata, and UTC timestamps.
4. **`notifications`**: Real-time user alert records with read/unread flags.
5. **`otp_verifications`**: OTP codes, expiration timestamps, and retry attempt counters.

---

### 📂 Category 7: Frontend Architecture & Cloudflare Deployment

#### Q33: Why did you choose React 18 with TypeScript and Redux Toolkit?
**Answer:**  
- **TypeScript**: Provides compile-time type safety across complex KYC data structures (eliminating runtime `undefined` property errors during OCR field parsing).
- **Redux Toolkit (RTK)**: Centralizes global authentication state (`user`, `token`, `isAuthenticated`) and KYC submission state with standardized slices and reducers.
- **Material UI (MUI v5)**: Delivers accessible, modern UI components with theme-switching (Dark/Light mode) and responsive layouts.

---

#### Q34: How did you configure Cloudflare Pages for Single Page Application (SPA) routing?
**Answer:**  
React uses client-side routing via `react-router-dom`. When a user refreshes deep routes like `/admin/review/123` or `/kyc/status`, the static web server attempts to find a literal file at that path and returns a 404 error.
- We added `frontend/public/_redirects`:
  ```
  /*    /index.html   200
  ```
- This instructs Cloudflare's edge CDN to rewrite all inbound request URIs to `index.html` with an HTTP 200 status, allowing React Router to handle view rendering seamlessly.

---

#### Q35: How did you solve Cross-Origin Resource Sharing (CORS) for Cloudflare deployment?
**Answer:**  
In `backend/app/main.py`, we configured FastAPI's `CORSMiddleware` with a dynamic regex pattern:
```python
allow_origin_regex = r"https://.*\.pages\.dev|https://.*\.workers\.dev|https://.*\.trycloudflare\.com|http://localhost:\d+|http://127\.0\.0\.1:\d+"
```
This enables secure communication between frontends hosted on Cloudflare Pages (`*.pages.dev`), Cloudflare Workers, Cloudflare Zero Trust Tunnels, and local development ports.

---

#### Q36: What are the future enhancements you would add to scale this platform?
**Answer:**  
1. **Deepfake Video Analysis**: Add temporal 3D-CNN models (e.g., Video Vision Transformers) to analyze micro-expression temporal consistency during live video KYC sessions.
2. **Government API Integration**: Connect real-time webhooks to UIDAI Aadhaar XML OTP and NSDL PAN verification databases.
3. **Vector Database Integration**: Store 512-D face embeddings in **Milvus** or **Pinecone** for sub-10ms similarity searches across millions of historical KYC records.
4. **Decentralized Verifiable Credentials**: Issue W3C-compliant Verifiable Credentials stored on a decentralized identity ledger for reusable cross-platform KYC.
