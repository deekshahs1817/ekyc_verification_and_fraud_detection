# Stage 1: Build React Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

# Stage 2: Python AI & FastAPI Backend
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies for OpenCV, EasyOCR, and Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend/ ./backend/
COPY --from=frontend-builder /app/frontend/build ./frontend/build

EXPOSE 8000
ENV PORT=8000
ENV USE_SQLITE_FALLBACK=True
ENV SECRET_KEY=ekyc-production-secret-key-super-secure-2026
ENV GOOGLE_CLIENT_ID=992314878877-vvul89n1rol4ohtbkebhse4fs2npkgtn.apps.googleusercontent.com

CMD ["sh", "-c", "cd backend && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
