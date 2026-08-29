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

# Expose port
EXPOSE 8000
ENV PORT=8000
ENV PYTHONUNBUFFERED=1

# Run FastAPI backend via production launcher
CMD ["sh", "-c", "cd backend && python run.py"]
