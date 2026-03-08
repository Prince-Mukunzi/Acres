from flask import Blueprint, request, jsonify
from psycopg2.extras import RealDictCursor
import uuid
from dsa.extras import get_cache, create_cache, clear_cache
from backend.utils.db import get_db_connection

#PROPERTY ENDPOINTS
#Property blueprint to handle all property related routes.
property_bp = Blueprint('property_bp', __name__)

#Route to handle collection of properties (GET for list, POST for create).
@property_bp.route('/property', methods=['GET', 'POST'])
def property_collection():
    conn = get_db_connection()
    print("Database connected successfully.")

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            if request.method == 'POST':
                data = request.get_json()
                new_id = str(uuid.uuid4())
                cur.execute(
                    "INSERT INTO Property (id, name, address) VALUES (%s, %s, %s)",
                    (new_id, data['name'], data.get('address'))
                )
                conn.commit()
                clear_cache("property")
                return jsonify({"message": "Property created", "id": new_id}), 201

            cached_data = get_cache("property")
            if cached_data:
                return jsonify(cached_data), 200

            cur.execute("SELECT * FROM Property")
            rows = [dict(row) for row in cur.fetchall()]
            create_cache("property", rows)
            return jsonify(rows), 200

    finally:
        conn.close()


@property_bp.route('/property/<string:id>', methods=['GET', 'PUT', 'DELETE'])
def property_resource(id):
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            if request.method == 'GET':
                cache_key = f"property:{id}"
                cached_data = get_cache(cache_key)
                if cached_data:
                    return jsonify(cached_data), 200

                cur.execute("SELECT * FROM Property WHERE id = %s", (id,))
                prop = cur.fetchone()
                if not prop:
                    return jsonify({"error": "Property not found"}), 404

                prop = dict(prop)
                create_cache(cache_key, prop)
                return jsonify(prop), 200

            elif request.method == 'PUT':
                data = request.get_json()
                cur.execute(
                    """UPDATE Property SET name = %s, address = %s, updatedAt = CURRENT_TIMESTAMP
                       WHERE id = %s""",
                    (data['name'], data.get('address'), id)
                )
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Property not found"}), 404
                clear_cache("property")
                clear_cache(f"property:{id}")
                return jsonify({"message": "Property updated successfully"}), 200

            elif request.method == 'DELETE':
                cur.execute("DELETE FROM Property WHERE id = %s", (id,))
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Property not found"}), 404
                clear_cache("property")
                clear_cache(f"property:{id}")
                return jsonify({"message": "Property deleted successfully"}), 200

    finally:
        conn.close()
