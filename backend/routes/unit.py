from flask import Blueprint, request, jsonify
from psycopg2.extras import RealDictCursor
import uuid
from dsa.extras import get_cache, create_cache, clear_cache, clear_cache_prefix
from backend.utils.db import get_db_connection, release_db_connection
from backend.utils.auth_middleware import require_user


#Unit blueprint to handle all unit related routes
unit_bp = Blueprint('unit_bp', __name__)

#UNIT ENDPOINTS

from psycopg2.extras import execute_batch

@unit_bp.route('/unit/bulk', methods=['POST'])
@require_user
def bulk_create_units():
    user_id = request.user_id
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            data = request.get_json()
            property_id = data.get('propertyId')
            units = data.get('units', [])
            
            if not units:
                return jsonify({"error": "No units provided"}), 400
                
            insert_query = """
                INSERT INTO Unit (id, unitName, rentAmount, unitStatus, propertyId, userId)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            
            records = [
                (
                    str(uuid.uuid4()), 
                    u['unitName'], 
                    u.get('rentAmount'), 
                    u.get('unitStatus', 'VACANT').upper(), 
                    property_id, 
                    user_id
                ) 
                for u in units
            ]
            
            execute_batch(cur, insert_query, records)
            conn.commit()
            
            clear_cache_prefix(f"unit:{user_id}")
            if data.get('propertyId'):
                clear_cache_prefix(f"unit_{data['propertyId']}:{user_id}")
            
            clear_cache_prefix(f"dashboard_stats:{user_id}")
            clear_cache_prefix(f"chart_stats:{user_id}")
            
            return jsonify({"message": f"{len(units)} units created successfully"}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(conn)

#Route to handle collection of units (GET for list, POST for create).
@unit_bp.route('/unit', methods=['GET', 'POST'])
@require_user
def unit_collection():
    user_id = request.user_id
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            if request.method == 'POST':
                data = request.get_json()
                new_id = str(uuid.uuid4())
                cur.execute(
                    """INSERT INTO Unit (id, unitName, rentAmount, unitStatus, propertyId, userId)
                       VALUES (%s, %s, %s, %s, %s, %s)""",
                    (new_id, data['unitName'], data.get('rentAmount'),
                     data.get('unitStatus', 'VACANT').upper(), data.get('propertyId'), user_id)
                )
                conn.commit()
                clear_cache(f"unit:{user_id}")
                # Also clear the property-scoped cache so fresh data is returned
                property_id = data.get('propertyId')
                if property_id:
                    clear_cache(f"unit_{property_id}:{user_id}")
                clear_cache(f"dashboard_stats:{user_id}")
                clear_cache(f"chart_stats:{user_id}")
                return jsonify({"message": "Unit created", "id": new_id}), 201

            # Support filtering by propertyId
            property_id = request.args.get('propertyId')
            cache_key = f"unit_{property_id}:{user_id}" if property_id else f"unit:{user_id}"

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
                    WHERE u.propertyId = %s AND u.userId = %s AND u.isDeleted = FALSE
                    ORDER BY LENGTH(u.unitName) ASC, u.unitName ASC
                """, (property_id, user_id))
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
                    WHERE u.userId = %s AND u.isDeleted = FALSE
                    ORDER BY LENGTH(u.unitName) ASC, u.unitName ASC
                """, (user_id,))
            
            rows = []
            for row in cur.fetchall():
                d = dict(row)
                d['rentAmount'] = d.get('rentAmount') or 0
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
        release_db_connection(conn)


@unit_bp.route('/unit/<string:id>', methods=['GET', 'PUT', 'DELETE'])
@require_user
def unit_resource(id):
    user_id = request.user_id
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            if request.method == 'GET':
                cache_key = f"unit:{id}:{user_id}"
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
                    WHERE u.id = %s AND u.userId = %s AND u.isDeleted = FALSE
                """, (id, user_id))
                unit = cur.fetchone()
                if not unit:
                    return jsonify({"error": "Unit not found"}), 404

                d = dict(unit)
                d['rentAmount'] = d.get('rentAmount') or 0
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
                       WHERE id = %s AND userId = %s AND isDeleted = FALSE""",
                    (data['unitName'], data.get('rentAmount'),
                     data.get('unitStatus', 'VACANT').upper(), data.get('propertyId'), id, user_id)
                )
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Unit not found or unauthorized"}), 404
                clear_cache_prefix(f"unit:{user_id}")
                clear_cache_prefix(f"unit:{id}:{user_id}")
                # Also clear property-scoped cache
                property_id = data.get('propertyId')
                if property_id:
                    clear_cache_prefix(f"unit_{property_id}:{user_id}")
                clear_cache_prefix(f"dashboard_stats:{user_id}")
                clear_cache_prefix(f"chart_stats:{user_id}")
                return jsonify({"message": "Unit updated successfully"}), 200

            elif request.method == 'DELETE':
                # Grab the propertyId first so we can clear the property-scoped cache
                cur.execute("SELECT propertyId FROM Unit WHERE id = %s AND userId = %s", (id, user_id))
                unit_row = cur.fetchone()
                
                cur.execute("UPDATE Unit SET isDeleted = TRUE WHERE id = %s AND userId = %s", (id, user_id))
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Unit not found or unauthorized"}), 404
                
                clear_cache_prefix(f"unit:{user_id}")
                clear_cache_prefix(f"unit:{id}:{user_id}")
                if unit_row and unit_row.get('propertyid'):
                    prop_id = unit_row['propertyid']
                    clear_cache_prefix(f"unit_{prop_id}:{user_id}")

                clear_cache_prefix(f"dashboard_stats:{user_id}")
                clear_cache_prefix(f"chart_stats:{user_id}")
                return jsonify({"message": "Unit deleted successfully"}), 200

    finally:
        release_db_connection(conn)

