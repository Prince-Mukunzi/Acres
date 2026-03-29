from flask import Blueprint, request, jsonify
from psycopg2.extras import RealDictCursor
import uuid
from dsa.extras import get_cache, create_cache, clear_cache
from backend.utils.db import get_db_connection
from backend.utils.auth_middleware import require_user

#PROPERTY ENDPOINTS
#Property blueprint to handle all property related routes.
property_bp = Blueprint('property_bp', __name__)

#Route to handle collection of properties (GET for list, POST for create).
@property_bp.route('/property', methods=['GET', 'POST'])
@require_user
def property_collection():
    user_id = request.user_id
    conn = get_db_connection()
    print("Database connected successfully.")

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            if request.method == 'POST':
                data = request.get_json()
                new_id = str(uuid.uuid4())
                cur.execute(
                    "INSERT INTO Property (id, name, address, userId) VALUES (%s, %s, %s, %s)",
                    (new_id, data['name'], data.get('address'), user_id)
                )
                conn.commit()
                clear_cache(f"property:{user_id}")
                return jsonify({"message": "Property created", "id": new_id}), 201

            cached_data = get_cache(f"property:{user_id}")
            if cached_data:
                return jsonify(cached_data), 200

            cur.execute("""
                SELECT 
                    p.id, p.name, p.address,
                    COUNT(DISTINCT u.id) as units,
                    COUNT(DISTINCT t.id) as tenants,
                    COUNT(DISTINCT mt.id) as tickets
                FROM Property p
                LEFT JOIN Unit u ON u.propertyId = p.id
                LEFT JOIN Tenant t ON t.unitID = u.id
                LEFT JOIN MaintenanceTicket mt ON mt.unitID = u.id
                WHERE p.userId = %s
                GROUP BY p.id
            """, (user_id,))
            rows = [dict(row) for row in cur.fetchall()]
            create_cache(f"property:{user_id}", rows)
            return jsonify(rows), 200

    finally:
        conn.close()


@property_bp.route('/property/<string:id>', methods=['GET', 'PUT', 'DELETE'])
@require_user
def property_resource(id):
    user_id = request.user_id
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            if request.method == 'GET':
                cache_key = f"property:{id}:{user_id}"
                cached_data = get_cache(cache_key)
                if cached_data:
                    return jsonify(cached_data), 200

                cur.execute("""
                    SELECT 
                        p.id, p.name, p.address,
                        COUNT(DISTINCT u.id) as units,
                        COUNT(DISTINCT t.id) as tenants,
                        COUNT(DISTINCT mt.id) as tickets
                    FROM Property p
                    LEFT JOIN Unit u ON u.propertyId = p.id
                    LEFT JOIN Tenant t ON t.unitID = u.id
                    LEFT JOIN MaintenanceTicket mt ON mt.unitID = u.id
                    WHERE p.id = %s AND p.userId = %s
                    GROUP BY p.id
                """, (id, user_id))
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
                       WHERE id = %s AND userId = %s""",
                    (data['name'], data.get('address'), id, user_id)
                )
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Property not found or unauthorized"}), 404
                clear_cache(f"property:{user_id}")
                clear_cache(f"property:{id}:{user_id}")
                return jsonify({"message": "Property updated successfully"}), 200

            elif request.method == 'DELETE':
                cur.execute("DELETE FROM Property WHERE id = %s AND userId = %s", (id, user_id))
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Property not found or unauthorized"}), 404
                clear_cache(f"property:{user_id}")
                clear_cache(f"property:{id}:{user_id}")
                return jsonify({"message": "Property deleted successfully"}), 200

    finally:
        conn.close()

