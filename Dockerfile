FROM python:3.11-slim

WORKDIR /app/backend

# Install system utilities safely
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend application code
COPY backend/ ./

# Expose port
EXPOSE 8000
ENV PORT=8000
ENV PYTHONUNBUFFERED=1

# Run FastAPI backend directly with Python binary
CMD ["python", "run.py"]
