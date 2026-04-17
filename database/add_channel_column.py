import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.utils.db import get_db_connection, release_db_connection

def migrate():
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                ALTER TABLE Communication
                ADD COLUMN IF NOT EXISTS channel VARCHAR(10) DEFAULT 'email'
            """)
            conn.commit()
            print("Added 'channel' column to Communication table.")
    except Exception as e:
        conn.rollback()
        print(f"Migration error: {e}")
    finally:
        release_db_connection(conn)

if __name__ == "__main__":
    migrate()
