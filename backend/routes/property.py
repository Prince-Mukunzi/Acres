from flask import Blueprint, request, jsonify
from psycopg2.extras import RealDictCursor
import uuid
from dsa.extras import get_cache, create_cache, clear_cache, clear_cache_prefix
from backend.utils.db import get_db_connection, release_db_connection
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
                clear_cache_prefix(f"property:{user_id}")
                return jsonify({"message": "Property created", "id": new_id}), 201

            page = request.args.get('page', 1, type=int)
            limit = request.args.get('limit', 50, type=int)
            search = request.args.get('search', '').lower()
            offset = (page - 1) * limit

            cache_key = f"property:{user_id}:page={page}:limit={limit}:search={search}"
            cached_data = get_cache(cache_key)
            if cached_data:
                return jsonify(cached_data), 200

            query = """
                SELECT 
                    p.id, p.name, p.address,
                    COUNT(DISTINCT CASE WHEN u.isDeleted = FALSE THEN u.id END) as units,
                    COUNT(DISTINCT CASE WHEN t.isDeleted = FALSE THEN t.id END) as tenants,
                    COUNT(DISTINCT CASE WHEN mt.isDeleted = FALSE THEN mt.id END) as tickets
                FROM Property p
                LEFT JOIN Unit u ON u.propertyId = p.id
                LEFT JOIN Tenant t ON t.unitID = u.id
                LEFT JOIN MaintenanceTicket mt ON mt.unitID = u.id
                WHERE p.userId = %s AND p.isDeleted = FALSE
            """
            params = [user_id]
            
            if search:
                query += " AND p.name ILIKE %s"
                params.append(f"%{search}%")
            
            query += " GROUP BY p.id ORDER BY p.name ASC LIMIT %s OFFSET %s"
            params.extend([limit, offset])
            
            cur.execute(query, tuple(params))
            rows = [dict(row) for row in cur.fetchall()]
            create_cache(cache_key, rows)
            return jsonify(rows), 200

    finally:
        release_db_connection(conn)


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
                        COUNT(DISTINCT CASE WHEN u.isDeleted = FALSE THEN u.id END) as units,
                        COUNT(DISTINCT CASE WHEN t.isDeleted = FALSE THEN t.id END) as tenants,
                        COUNT(DISTINCT CASE WHEN mt.isDeleted = FALSE THEN mt.id END) as tickets
                    FROM Property p
                    LEFT JOIN Unit u ON u.propertyId = p.id
                    LEFT JOIN Tenant t ON t.unitID = u.id
                    LEFT JOIN MaintenanceTicket mt ON mt.unitID = u.id
                    WHERE p.id = %s AND p.userId = %s AND p.isDeleted = FALSE
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
                       WHERE id = %s AND userId = %s AND isDeleted = FALSE""",
                    (data['name'], data.get('address'), id, user_id)
                )
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Property not found or unauthorized"}), 404
                clear_cache_prefix(f"property:{user_id}")
                clear_cache_prefix(f"property:{id}:{user_id}")
                return jsonify({"message": "Property updated successfully"}), 200

            elif request.method == 'DELETE':
                cur.execute("UPDATE Property SET isDeleted = TRUE WHERE id = %s AND userId = %s", (id, user_id))
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Property not found or unauthorized"}), 404
                clear_cache_prefix(f"property:{user_id}")
                clear_cache_prefix(f"property:{id}:{user_id}")
                return jsonify({"message": "Property deleted successfully"}), 200

    finally:
        release_db_connection(conn)

