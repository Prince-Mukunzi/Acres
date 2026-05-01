"""
Migration: Create Payment table and add lastLogin column to AppUser.
"""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from backend.utils.db import get_direct_connection


def run():
    conn = get_direct_connection()
    try:
        with conn.cursor() as cur:
            # Create Payment table if it doesn't exist
            cur.execute("""
                CREATE TABLE IF NOT EXISTS Payment (
                    id UUID PRIMARY KEY,
                    tenantID UUID NOT NULL,
                    amount BIGINT NOT NULL DEFAULT 0,
                    paymentMethod VARCHAR(50) DEFAULT 'Manual',
                    status VARCHAR(50) DEFAULT 'Paid',
                    paidAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    userId UUID,
                    isDeleted BOOLEAN DEFAULT FALSE,
                    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT fk_payment_tenantID FOREIGN KEY (tenantID) REFERENCES Tenant (id) ON DELETE CASCADE,
                    CONSTRAINT fk_payment_userId FOREIGN KEY (userId) REFERENCES AppUser (id) ON DELETE CASCADE
                );
            """)

            # Add lastLogin to AppUser if it doesn't exist
            cur.execute("""
                ALTER TABLE AppUser ADD COLUMN IF NOT EXISTS lastLogin TIMESTAMP;
            """)

        conn.commit()
        print("Migration complete: Payment table created, lastLogin column added.")
    except Exception as e:
        print(f"Migration error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    run()
