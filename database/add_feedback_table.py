"""Migration: Create the Feedback table for bug reports and user feedback."""

import os
from dotenv import load_dotenv
import psycopg2

load_dotenv(override=True)

conn = psycopg2.connect(
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASS"),
    host=os.getenv("DB_HOST"),
    port=os.getenv("DB_PORT"),
    database=os.getenv("DB_NAME"),
)

with conn.cursor() as cur:
    cur.execute("""
        CREATE TABLE IF NOT EXISTS Feedback (
            id UUID PRIMARY KEY,
            userId UUID,
            type VARCHAR(20) CHECK (type IN ('BUG', 'FEATURE', 'GENERAL')) DEFAULT 'GENERAL',
            title VARCHAR(200) NOT NULL,
            description TEXT,
            severity VARCHAR(20) CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) DEFAULT 'MEDIUM',
            status VARCHAR(20) CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')) DEFAULT 'OPEN',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            isDeleted BOOLEAN DEFAULT FALSE,
            CONSTRAINT fk_feedback_userId FOREIGN KEY (userId) REFERENCES AppUser (id) ON DELETE CASCADE
        );
    """)
    conn.commit()
    print("✅ Feedback table created successfully.")

conn.close()
