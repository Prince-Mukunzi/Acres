from flask import Blueprint, request, jsonify
from psycopg2.extras import RealDictCursor
import uuid
from dsa.extras import get_cache, create_cache, clear_cache
from datetime import date
from backend.utils.db import get_db_connection


#TENANT ENDPOINTS

#Tenant blueprint
tenant_bp = Blueprint('tenant_bp', __name__)


# Register the blueprint with the app
@tenant_bp.route('/tenant', methods=['GET', 'POST'])
def tenant_collection():
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            if request.method == 'POST':
                data = request.get_json()
                new_id = str(uuid.uuid4())
                start_date = data.get('leaseStartDate', date.today().isoformat())
                end_date   = data.get('leaseEndDate',   date.today().isoformat())
                cur.execute(
                    """INSERT INTO Tenant (id, firstName, lastName, phoneNumber, unitID, leaseStartDate, leaseEndDate)
                       VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                    (new_id, data['firstName'], data['lastName'], data.get('phoneNumber'),
                     data.get('unitID'), start_date, end_date)
                )
                conn.commit()
                clear_cache("tenant")
                return jsonify({"message": "Tenant created", "id": new_id}), 201

            cached_data = get_cache("tenant")
            if cached_data:
                return jsonify(cached_data), 200

            cur.execute("SELECT * FROM Tenant")
            rows = [dict(row) for row in cur.fetchall()]
            create_cache("tenant", rows)
            return jsonify(rows), 200

    finally:
        conn.close()


@tenant_bp.route('/tenant/<string:id>', methods=['GET', 'PUT', 'DELETE'])
def tenant_resource(id):
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            if request.method == 'GET':
                cache_key = f"tenant:{id}"
                cached_data = get_cache(cache_key)
                if cached_data:
                    return jsonify(cached_data), 200

                cur.execute("SELECT * FROM Tenant WHERE id = %s", (id,))
                tenant = cur.fetchone()
                if not tenant:
                    return jsonify({"error": "Tenant not found"}), 404

                tenant = dict(tenant)
                create_cache(cache_key, tenant)
                return jsonify(tenant), 200

            elif request.method == 'PUT':
                data = request.get_json()
                start_date = data.get('leaseStartDate', date.today().isoformat())
                end_date   = data.get('leaseEndDate',   date.today().isoformat())
                cur.execute(
                    """UPDATE Tenant SET firstName = %s, lastName = %s, phoneNumber = %s,
                       unitID = %s, leaseStartDate = %s, leaseEndDate = %s WHERE id = %s""",
                    (data['firstName'], data['lastName'], data.get('phoneNumber'),
                     data.get('unitID'), start_date, end_date, id)
                )
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Tenant not found"}), 404
                clear_cache("tenant")
                clear_cache(f"tenant:{id}")
                return jsonify({"message": "Tenant updated successfully"}), 200

            elif request.method == 'DELETE':
                cur.execute("DELETE FROM Tenant WHERE id = %s", (id,))
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Tenant not found"}), 404
                clear_cache("tenant")
                clear_cache(f"tenant:{id}")
                return jsonify({"message": "Tenant deleted successfully"}), 200

    finally:
        conn.close()