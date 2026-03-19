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
                     data.get('unitStatus', 'VACANT').upper(), data.get('propertyId'))
                )
                conn.commit()
                clear_cache("unit")
                # Also clear the property-scoped cache so fresh data is returned
                property_id = data.get('propertyId')
                if property_id:
                    clear_cache(f"unit_{property_id}")
                clear_cache("dashboard_stats")
                clear_cache("chart_stats")
                return jsonify({"message": "Unit created", "id": new_id}), 201

            # Support filtering by propertyId
            property_id = request.args.get('propertyId')
            cache_key = f"unit_{property_id}" if property_id else "unit"

            cached_data = get_cache(cache_key)
            if cached_data:
                return jsonify(cached_data), 200

            if property_id:
                cur.execute("""
                    SELECT 
                        u.id, 
                        u.unitName as name, 
                        u.rentAmount as "rentAmount", 
                        u.unitStatus as status,
                        t.firstName as "firstName", 
                        t.lastName as "lastName",
                        u.propertyId as "propertyId"
                    FROM Unit u
                    LEFT JOIN Tenant t ON t.unitID = u.id
                    WHERE u.propertyId = %s
                    ORDER BY LENGTH(u.unitName) ASC, u.unitName ASC
                """, (property_id,))
            else:
                cur.execute("""
                    SELECT 
                        u.id, 
                        u.unitName as name, 
                        u.rentAmount as "rentAmount", 
                        u.unitStatus as status,
                        t.firstName as "firstName", 
                        t.lastName as "lastName",
                        u.propertyId as "propertyId"
                    FROM Unit u
                    LEFT JOIN Tenant t ON t.unitID = u.id
                    ORDER BY LENGTH(u.unitName) ASC, u.unitName ASC
                """)
            
            rows = []
            for row in cur.fetchall():
                d = dict(row)
                d['rentAmount'] = f"RF {d['rentAmount']:,.0f}" if d['rentAmount'] else "RF 0"
                d['status'] = "Occupied" if d['status'] == "OCCUPIED" else "Vacant"
                if d.get('firstName') and d.get('lastName'):
                    d['tenant'] = f"{d['firstName']} {d['lastName']}"
                else:
                    d['tenant'] = None
                d.pop('firstName', None)
                d.pop('lastName', None)
                rows.append(d)
                
            create_cache(cache_key, rows)
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

                cur.execute("""
                    SELECT 
                        u.id, 
                        u.unitName as name, 
                        u.rentAmount as "rentAmount", 
                        u.unitStatus as status,
                        t.firstName as "firstName", 
                        t.lastName as "lastName",
                        u.propertyId as "propertyId"
                    FROM Unit u
                    LEFT JOIN Tenant t ON t.unitID = u.id
                    WHERE u.id = %s
                """, (id,))
                unit = cur.fetchone()
                if not unit:
                    return jsonify({"error": "Unit not found"}), 404

                d = dict(unit)
                d['rentAmount'] = f"RF {d['rentAmount']:,.0f}" if d['rentAmount'] else "RF 0"
                d['status'] = "Occupied" if d['status'] == "OCCUPIED" else "Vacant"
                if d.get('firstName') and d.get('lastName'):
                    d['tenant'] = f"{d['firstName']} {d['lastName']}"
                else:
                    d['tenant'] = None
                d.pop('firstName', None)
                d.pop('lastName', None)
                
                create_cache(cache_key, d)
                return jsonify(d), 200

            elif request.method == 'PUT':
                data = request.get_json()
                cur.execute(
                    """UPDATE Unit SET unitName = %s, rentAmount = %s, unitStatus = %s, propertyId = %s
                       WHERE id = %s""",
                    (data['unitName'], data.get('rentAmount'),
                     data.get('unitStatus', 'VACANT').upper(), data.get('propertyId'), id)
                )
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Unit not found"}), 404
                clear_cache("unit")
                clear_cache(f"unit:{id}")
                # Also clear property-scoped cache
                property_id = data.get('propertyId')
                if property_id:
                    clear_cache(f"unit_{property_id}")
                clear_cache("dashboard_stats")
                clear_cache("chart_stats")
                return jsonify({"message": "Unit updated successfully"}), 200

            elif request.method == 'DELETE':
                cur.execute("DELETE FROM Unit WHERE id = %s", (id,))
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Unit not found"}), 404
                clear_cache("unit")
                clear_cache(f"unit:{id}")
                clear_cache("dashboard_stats")
                clear_cache("chart_stats")
                return jsonify({"message": "Unit deleted successfully"}), 200

    finally:
        conn.close()