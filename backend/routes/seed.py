import os
import sys
from flask import Blueprint, jsonify
from backend.utils.db import get_db_connection

seed_bp = Blueprint('seed_bp', __name__)

def run_sql_file(conn, filepath):
    """Read and execute a SQL file."""
    with open(filepath, "r") as f:
        sql = f.read()
    with conn.cursor() as cur:
        cur.execute(sql)
    conn.commit()

@seed_bp.route('/seed', methods=['POST'])
def seed_database():
    conn = get_db_connection()
    try:
        db_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../database")
        schema_file = os.path.join(db_dir, "schema.sql")
        data_file = os.path.join(db_dir, "dummy_data.sql")

        with conn.cursor() as cur:
            cur.execute("""
                DROP TABLE IF EXISTS Communication CASCADE;
                DROP TABLE IF EXISTS MaintenanceTicket CASCADE;
                DROP TABLE IF EXISTS Tenant CASCADE;
                DROP TABLE IF EXISTS Unit CASCADE;
                DROP TABLE IF EXISTS Property CASCADE;
                DROP TABLE IF EXISTS AppUser CASCADE;
            """)
        conn.commit()

        run_sql_file(conn, schema_file)
        run_sql_file(conn, data_file)
        
        # Clear all application cache
        from dsa.extras import cache
        cache.clear()

        return jsonify({"message": "Database reset and seeded successfully!"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()
