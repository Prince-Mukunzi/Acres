import psycopg2
import os
from dotenv import load_dotenv

load_dotenv(override=True)

def alter_db():
    try:
        conn = psycopg2.connect(
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASS'),
            host=os.getenv('DB_HOST'),
            port=os.getenv('DB_PORT'),
            dbname=os.getenv('DB_NAME'),
            sslmode='require'
        )
        with conn.cursor() as cur:
            tables = ["Property", "Unit", "Tenant", "MaintenanceTicket", "Communication"]
            for table in tables:
                cur.execute(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS isDeleted BOOLEAN DEFAULT FALSE;")
            conn.commit()
            print("Successfully added isDeleted column to all tables.")
    except Exception as e:
        print(f"Error altering database: {e}")
    finally:
        if 'conn' in locals() and conn:
            conn.close()

if __name__ == "__main__":
    alter_db()
