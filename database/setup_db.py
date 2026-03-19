"""
Database Setup Script
Reads schema.sql and dummy_data.sql and executes them against CockroachDB.
Usage: python database/setup_db.py
"""

import os
import sys

# Allow imports from project root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from backend.utils.db import get_db_connection


def run_sql_file(conn, filepath):
    """Read and execute a SQL file."""
    with open(filepath, "r") as f:
        sql = f.read()

    with conn.cursor() as cur:
        cur.execute(sql)
    conn.commit()
    print(f"Executed {filepath}")


def main():
    db_dir = os.path.dirname(os.path.abspath(__file__))
    schema_file = os.path.join(db_dir, "schema.sql")
    data_file = os.path.join(db_dir, "dummy_data.sql")

    conn = get_db_connection()
    print("Connected to CockroachDB.")

    try:
        # Drop existing tables (in reverse dependency order) so we can re-create cleanly
        with conn.cursor() as cur:
            cur.execute("""
                DROP TABLE IF EXISTS Communication CASCADE;
                DROP TABLE IF EXISTS MaintenanceTicket CASCADE;
                DROP TABLE IF EXISTS Tenant CASCADE;
                DROP TABLE IF EXISTS Unit CASCADE;
                DROP TABLE IF EXISTS Property CASCADE;
            """)
        conn.commit()
        print("Dropped existing tables (if any).")

        # Create tables
        run_sql_file(conn, schema_file)

        # Insert dummy data
        run_sql_file(conn, data_file)

        print("\n Database setup complete! Tables created and seeded with dummy data.")
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        conn.close()


if __name__ == "__main__":
    main()
