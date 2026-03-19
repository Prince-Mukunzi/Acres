from flask import Blueprint, request, jsonify
from psycopg2.extras import RealDictCursor
import uuid
from dsa.extras import get_cache, create_cache, clear_cache
from backend.utils.db import get_db_connection

#COMMUNICATION ENDPOINTS
#creating a blueprint for communication routes
communication_bp = Blueprint('communication_bp', __name__)


#registering the blueprint with the main app
@communication_bp.route('/communication', methods=['GET', 'POST'])
def communication_collection():
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            if request.method == 'POST':
                data = request.get_json()
                new_id = str(uuid.uuid4())
                cur.execute(
                    "INSERT INTO Communication (id, tenantID, unitID, title, body) VALUES (%s, %s, %s, %s, %s)",
                    (new_id, data.get('tenantID'), data.get('unitID'), data['title'], data.get('body'))
                )
                conn.commit()
                clear_cache("communication")
                return jsonify({"message": "Communication logged", "id": new_id}), 201

            cached_data = get_cache("communication")
            if cached_data:
                return jsonify(cached_data), 200

            cur.execute("SELECT id, title, body as message FROM Communication")
            rows = [dict(row) for row in cur.fetchall()]
            create_cache("communication", rows)
            return jsonify(rows), 200

    finally:
        conn.close()


@communication_bp.route('/communication/<string:id>', methods=['GET', 'PUT', 'DELETE'])
def communication_resource(id):
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            if request.method == 'GET':
                cache_key = f"communication:{id}"
                cached_data = get_cache(cache_key)
                if cached_data:
                    return jsonify(cached_data), 200

                cur.execute("SELECT id, title, body as message FROM Communication WHERE id = %s", (id,))
                comm = cur.fetchone()
                if not comm:
                    return jsonify({"error": "Communication not found"}), 404

                comm = dict(comm)
                create_cache(cache_key, comm)
                return jsonify(comm), 200

            elif request.method == 'PUT':
                data = request.get_json()
                cur.execute(
                    "UPDATE Communication SET tenantID = %s, title = %s, body = %s WHERE id = %s",
                    (data.get('tenantID'), data['title'], data.get('body'), id)
                )
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Communication not found"}), 404
                clear_cache("communication")
                clear_cache(f"communication:{id}")
                return jsonify({"message": "Communication updated successfully"}), 200

            elif request.method == 'DELETE':
                cur.execute("DELETE FROM Communication WHERE id = %s", (id,))
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Communication not found"}), 404
                clear_cache("communication")
                clear_cache(f"communication:{id}")
                return jsonify({"message": "Communication deleted successfully"}), 200

    finally:
        conn.close()