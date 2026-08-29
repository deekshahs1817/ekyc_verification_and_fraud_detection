FROM python:3.11-slim

WORKDIR /app

# Install system utilities safely
RUN apt-get update && apt-get install -y --no-install-recommends \
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
