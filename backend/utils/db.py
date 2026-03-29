import os
import psycopg2
from dotenv import load_dotenv

# Override existing environment variables to ensure we always use the latest .env
load_dotenv(override=True)

def get_db_connection():
    """Establishes and returns a connection to CockroachDB."""
    return psycopg2.connect(
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASS'),
        host=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT'),
        dbname=os.getenv('DB_NAME'),
        sslmode='require'
    )
