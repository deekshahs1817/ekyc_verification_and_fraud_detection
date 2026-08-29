FROM python:3.11-slim

WORKDIR /app

# Install system libraries for OpenCV and computer vision
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy Backend application code
COPY backend/ ./backend/

# Create uploads directory and permissions
RUN mkdir -p /app/backend/uploads && chmod -R 777 /app/backend/uploads

# Expose Hugging Face standard port
EXPOSE 7860
ENV PORT=7860
ENV PYTHONUNBUFFERED=1

# Run FastAPI backend
CMD ["sh", "-c", "cd backend && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-7860}"]
