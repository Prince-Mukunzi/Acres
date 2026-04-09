# Use an official lightweight Python image.
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Prevent Python from writing pyc files to disc and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install required system dependencies (especially for psycopg2)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy dependencies list and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy local code to the container
COPY . .

# Expose the API port
EXPOSE 5001

# Command to run the application using gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5001", "--workers", "4", "app:app"]
