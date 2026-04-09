import os
import psycopg2
from dotenv import load_dotenv

# Override existing environment variables to ensure we always use the latest .env
load_dotenv(override=True)

from psycopg2.pool import ThreadedConnectionPool

# Initialize connection pool globally
_pool = None

def init_pool():
    global _pool
    if _pool is None:
        _pool = ThreadedConnectionPool(
            1, 20, # min, max connections
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASS'),
            host=os.getenv('DB_HOST'),
            port=os.getenv('DB_PORT'),
            dbname=os.getenv('DB_NAME'),
            sslmode=os.getenv('DB_SSL_MODE', 'require')
        )

def get_db_connection():
    """Returns a connection from the pool. Make sure to close it so it returns to the pool."""
    if _pool is None:
        init_pool()
    return _pool.getconn()

def release_db_connection(conn):
    if _pool and conn:
        _pool.putconn(conn)
