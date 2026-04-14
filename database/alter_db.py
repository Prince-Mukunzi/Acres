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
            
            created_at_tables = ["Unit", "Tenant", "MaintenanceTicket"]
            for table in created_at_tables:
                cur.execute(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;")
            
            cur.execute("""
                CREATE TABLE IF NOT EXISTS CommunicationTemplate (
                    id UUID PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    category VARCHAR(50) NOT NULL,
                    color VARCHAR(100) DEFAULT 'bg-muted text-muted-foreground',
                    body TEXT NOT NULL,
                    userId UUID,
                    isDeleted BOOLEAN DEFAULT FALSE,
                    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT fk_template_userId FOREIGN KEY (userId) REFERENCES AppUser (id) ON DELETE CASCADE
                );
            """)

            conn.commit()
            print("Successfully extended tables and created CommunicationTemplate.")
    except Exception as e:
        print(f"Error altering database: {e}")
    finally:
        if 'conn' in locals() and conn:
            conn.close()

if __name__ == "__main__":
    alter_db()
