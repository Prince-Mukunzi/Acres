from flask import Blueprint, jsonify, current_app
import os
from backend.utils.db import get_db_connection, release_db_connection

seed_bp = Blueprint('seed_bp', __name__)

@seed_bp.route('/seed', methods=['POST', 'GET'])
def seed_database():
    """
    API endpoint to seed the database with initial schema and dummy data.
    In a real production app, this should be protected or removed.
    """
    conn = get_db_connection()
    try:
        # Determine paths to SQL files relative to project root
        # Assuming we are in backend/routes/seed.py, root is ../../
        root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        schema_file = os.path.join(root_dir, "database", "schema.sql")
        data_file = os.path.join(root_dir, "database", "dummy_data.sql")

        if not os.path.exists(schema_file):
            return jsonify({"error": f"Schema file not found at {schema_file}"}), 500

        with conn.cursor() as cur:
            # Drop existing tables (optional, following setup_db.py logic)
            cur.execute("""
                DROP TABLE IF EXISTS Communication CASCADE;
                DROP TABLE IF EXISTS MaintenanceTicket CASCADE;
                DROP TABLE IF EXISTS Tenant CASCADE;
                DROP TABLE IF EXISTS Unit CASCADE;
                DROP TABLE IF EXISTS Property CASCADE;
                DROP TABLE IF EXISTS AppUser CASCADE;
            """)
            
            # Read and execute schema.sql
            with open(schema_file, "r") as f:
                cur.execute(f.read())
            
            # Read and execute dummy_data.sql if it exists
            if os.path.exists(data_file):
                with open(data_file, "r") as f:
                    cur.execute(f.read())
            
            conn.commit()
            return jsonify({"message": "Database seeded successfully"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(conn)
