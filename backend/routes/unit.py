from flask import Blueprint, request, jsonify
from psycopg2.extras import RealDictCursor
import uuid
from dsa.extras import get_cache, create_cache, clear_cache
from backend.utils.db import get_db_connection


#Unit blueprint to handle all unit related routes
unit_bp = Blueprint('unit_bp', __name__)

#UNIT ENDPOINTS

#Route to handle collection of units (GET for list, POST for create).
@unit_bp.route('/unit', methods=['GET', 'POST'])
def unit_collection():
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            if request.method == 'POST':
                data = request.get_json()
                new_id = str(uuid.uuid4())
                cur.execute(
                    """INSERT INTO Unit (id, unitName, rentAmount, unitStatus, propertyId)
                       VALUES (%s, %s, %s, %s, %s)""",
                    (new_id, data['unitName'], data.get('rentAmount'),
                     data.get('unitStatus', 'VACANT'), data.get('propertyId'))
                )
                conn.commit()
                clear_cache("unit")
                return jsonify({"message": "Unit created", "id": new_id}), 201

            cached_data = get_cache("unit")
            if cached_data:
                return jsonify(cached_data), 200

            cur.execute("SELECT * FROM Unit")
            rows = [dict(row) for row in cur.fetchall()]
            create_cache("unit", rows)
            return jsonify(rows), 200

    finally:
        conn.close()


@unit_bp.route('/unit/<string:id>', methods=['GET', 'PUT', 'DELETE'])
def unit_resource(id):
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            if request.method == 'GET':
                cache_key = f"unit:{id}"
                cached_data = get_cache(cache_key)
                if cached_data:
                    return jsonify(cached_data), 200

                cur.execute("SELECT * FROM Unit WHERE id = %s", (id,))
                unit = cur.fetchone()
                if not unit:
                    return jsonify({"error": "Unit not found"}), 404

                unit = dict(unit)
                create_cache(cache_key, unit)
                return jsonify(unit), 200

            elif request.method == 'PUT':
                data = request.get_json()
                cur.execute(
                    """UPDATE Unit SET unitName = %s, rentAmount = %s, unitStatus = %s, propertyId = %s
                       WHERE id = %s""",
                    (data['unitName'], data.get('rentAmount'),
                     data.get('unitStatus', 'VACANT'), data.get('propertyId'), id)
                )
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Unit not found"}), 404
                clear_cache("unit")
                clear_cache(f"unit:{id}")
                return jsonify({"message": "Unit updated successfully"}), 200

            elif request.method == 'DELETE':
                cur.execute("DELETE FROM Unit WHERE id = %s", (id,))
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Unit not found"}), 404
                clear_cache("unit")
                clear_cache(f"unit:{id}")
                return jsonify({"message": "Unit deleted successfully"}), 200

    finally:
        conn.close()