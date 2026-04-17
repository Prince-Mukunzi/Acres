import psycopg2
import os
from dotenv import load_dotenv

load_dotenv(override=True)

def add_charging_day():
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
            cur.execute("ALTER TABLE Tenant ADD COLUMN IF NOT EXISTS chargingDay INTEGER DEFAULT NULL;")
            conn.commit()
            print("Successfully added chargingDay column to Tenant table.")
    except Exception as e:
        print(f"Error adding chargingDay column: {e}")
    finally:
        if 'conn' in locals() and conn:
            conn.close()

if __name__ == "__main__":
    add_charging_day()
