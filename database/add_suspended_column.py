import psycopg2
import os
from dotenv import load_dotenv

load_dotenv(override=True)

def add_suspended_column():
    conn = psycopg2.connect(
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASS'),
        host=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT'),
        dbname=os.getenv('DB_NAME'),
        sslmode='require'
    )
    try:
        with conn.cursor() as cur:
            # Add the isSuspended column if it does not exist
            cur.execute("""
                ALTER TABLE AppUser
                ADD COLUMN IF NOT EXISTS isSuspended BOOLEAN DEFAULT FALSE;
            """)
            conn.commit()
            print("Added isSuspended column to AppUser.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    add_suspended_column()
