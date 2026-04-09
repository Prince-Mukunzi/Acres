import psycopg2
import os
from dotenv import load_dotenv

load_dotenv(override=True)

def add_admin_column():
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
            # Add the isAdmin column if it does not exist
            cur.execute("""
                ALTER TABLE AppUser
                ADD COLUMN IF NOT EXISTS isAdmin BOOLEAN DEFAULT FALSE;
            """)

            # Grant admin access to the specified email
            cur.execute("""
                UPDATE AppUser
                SET isAdmin = TRUE
                WHERE email = 'princemukunzi11@gmail.com';
            """)

            conn.commit()
            print("Added isAdmin column and granted admin to princemukunzi11@gmail.com")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    add_admin_column()
