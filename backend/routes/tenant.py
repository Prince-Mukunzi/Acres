from flask import Blueprint, request, jsonify
from psycopg2.extras import RealDictCursor
import uuid
from dsa.extras import get_cache, create_cache, clear_cache
from datetime import date
from backend.utils.db import get_db_connection, release_db_connection
from backend.utils.auth_middleware import require_user


#TENANT ENDPOINTS

#Tenant blueprint
tenant_bp = Blueprint('tenant_bp', __name__)


# Register the blueprint with the app
@tenant_bp.route('/tenant', methods=['GET', 'POST'])
@require_user
def tenant_collection():
    user_id = request.user_id
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            if request.method == 'POST':
                data = request.get_json()
                new_id = str(uuid.uuid4())
                start_date = data.get('leaseStartDate', date.today().isoformat())
                end_date   = data.get('leaseEndDate',   date.today().isoformat())
                cur.execute(
                    """INSERT INTO Tenant (id, firstName, lastName, phoneNumber, email, unitID, leaseStartDate, leaseEndDate, userId)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                    (new_id, data['firstName'], data['lastName'], data.get('phoneNumber'), data.get('email'),
                     data.get('unitID'), start_date, end_date, user_id)
                )
                conn.commit()
                clear_cache(f"tenant:{user_id}")
                clear_cache(f"dashboard_stats:{user_id}")
                return jsonify({"message": "Tenant created", "id": new_id}), 201

            page = request.args.get('page', 1, type=int)
            limit = request.args.get('limit', 50, type=int)
            search = request.args.get('search', '').lower()
            offset = (page - 1) * limit

            cache_key = f"tenant:{user_id}:page={page}:limit={limit}:search={search}"
            cached_data = get_cache(cache_key)
            if cached_data:
                return jsonify(cached_data), 200

            query = """
                SELECT 
                    t.id, 
                    t.firstName as "firstName", 
                    t.lastName as "lastName",
                    t.phoneNumber as phone,
                    t.email as email,
                    u.unitName as unit,
                    u.id as "unitId",
                    u.rentAmount as amount,
                    t.leaseStartDate as "startDate",
                    t.leaseEndDate as date,
                    t.status as "dbStatus"
                FROM Tenant t
                LEFT JOIN Unit u ON t.unitID = u.id
                WHERE t.userId = %s AND t.isDeleted = FALSE
            """
            params = [user_id]
            if search:
                query += " AND (t.firstName ILIKE %s OR t.lastName ILIKE %s)"
                params.extend([f"%{search}%", f"%{search}%"])
            
            query += " ORDER BY t.firstName ASC LIMIT %s OFFSET %s"
            params.extend([limit, offset])
            
            cur.execute(query, tuple(params))
            
            rows = []
            for row in cur.fetchall():
                d = dict(row)
                d['name'] = f"{d['firstName']} {d['lastName']}"
                d['amount'] = d.get('amount') or 0
                
                # Fetch start date to calc due date
                start_date = d.pop('startDate', None)
                if start_date:
                    try:
                        # dueDate is 1 month after start date
                        import dateutil.relativedelta
                        due_date = start_date + dateutil.relativedelta.relativedelta(months=1)
                        d['dueDate'] = due_date.strftime("%b %-d, %Y")
                    except (TypeError, AttributeError, ValueError):
                        d['dueDate'] = start_date.strftime("%b %d, %Y")
                else:
                    d['dueDate'] = None

                if d.get('date'):
                    try:
                        d['date'] = d['date'].strftime("%b %-d, %Y")
                    except ValueError:
                        d['date'] = d['date'].strftime("%b %d, %Y")
                else:
                    d['date'] = None
                
                # Map DB status to frontend display
                db_status = d.pop('dbStatus', 'ACTIVE')
                d['status'] = "Paid" if db_status in ('ACTIVE', 'PAID') else "Overdue"
                
                d.pop('firstName', None)
                d.pop('lastName', None)
                rows.append(d)
                
            create_cache(cache_key, rows)
            return jsonify(rows), 200

    finally:
        release_db_connection(conn)


@tenant_bp.route('/tenant/<string:id>', methods=['GET', 'PUT', 'DELETE'])
@require_user
def tenant_resource(id):
    user_id = request.user_id
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            if request.method == 'GET':
                cache_key = f"tenant:{id}:{user_id}"
                cached_data = get_cache(cache_key)
                if cached_data:
                    return jsonify(cached_data), 200

                cur.execute("""
                    SELECT 
                        t.id, 
                        t.firstName as "firstName", 
                        t.lastName as "lastName",
                        t.phoneNumber as phone,
                        t.email as email,
                        u.unitName as unit,
                        u.id as "unitId",
                        u.rentAmount as amount,
                        t.leaseStartDate as "startDate",
                        t.leaseEndDate as date,
                        t.status as "dbStatus"
                    FROM Tenant t
                    LEFT JOIN Unit u ON t.unitID = u.id
                    WHERE t.id = %s AND t.userId = %s AND t.isDeleted = FALSE
                """, (id, user_id))
                tenant = cur.fetchone()
                if not tenant:
                    return jsonify({"error": "Tenant not found"}), 404

                d = dict(tenant)
                d['name'] = f"{d['firstName']} {d['lastName']}"
                d['amount'] = d.get('amount') or 0
                
                start_date = d.pop('startDate', None)
                if start_date:
                    try:
                        import dateutil.relativedelta
                        due_date = start_date + dateutil.relativedelta.relativedelta(months=1)
                        d['dueDate'] = due_date.strftime("%b %-d, %Y")
                    except (TypeError, AttributeError, ValueError):
                        d['dueDate'] = start_date.strftime("%b %d, %Y")
                else:
                    d['dueDate'] = None

                if d.get('date'):
                    try:
                        d['date'] = d['date'].strftime("%b %-d, %Y")
                    except ValueError:
                        d['date'] = d['date'].strftime("%b %d, %Y") 
                else:
                    d['date'] = None
                
                db_status = d.pop('dbStatus', 'ACTIVE')
                d['status'] = "Paid" if db_status in ('ACTIVE', 'PAID') else "Overdue"

                d.pop('firstName', None)
                d.pop('lastName', None)

                create_cache(cache_key, d)
                return jsonify(d), 200

            elif request.method == 'PUT':
                data = request.get_json()
                cur.execute("SELECT * FROM Tenant WHERE id = %s AND userId = %s AND isDeleted = FALSE", (id, user_id))
                existing = cur.fetchone()
                if not existing:
                    return jsonify({"error": "Tenant not found or unauthorized"}), 404

                # Fallback to existing values if not provided
                new_first_name = data.get('firstName', existing['firstname'])
                new_last_name = data.get('lastName', existing['lastname'])
                new_phone = data.get('phoneNumber', existing['phonenumber'])
                new_email = data.get('email', existing['email'])
                new_unit = data.get('unitID', existing['unitid'])
                
                # dates might come in as strings or need to be preserved
                curr_start = existing['leasestartdate'].isoformat() if existing['leasestartdate'] else date.today().isoformat()
                curr_end = existing['leaseenddate'].isoformat() if existing['leaseenddate'] else date.today().isoformat()
                
                start_date = data.get('leaseStartDate', curr_start)
                end_date   = data.get('leaseEndDate', curr_end)
                
                # Map frontend status to DB status
                frontend_status = data.get('status')
                if frontend_status == 'Paid':
                    db_status = 'PAID'
                elif frontend_status == 'Overdue':
                    db_status = 'OVERDUE'
                else:
                    db_status = existing['status']
                
                cur.execute(
                    """UPDATE Tenant SET firstName = %s, lastName = %s, phoneNumber = %s,
                       unitID = %s, leaseStartDate = %s, leaseEndDate = %s, 
                       email = %s, status = %s WHERE id = %s AND userId = %s AND isDeleted = FALSE""",
                    (new_first_name, new_last_name, new_phone, new_unit,
                     start_date, end_date, new_email, db_status, id, user_id)
                )
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Tenant not found or unauthorized"}), 404
                clear_cache(f"tenant:{user_id}")
                clear_cache(f"tenant:{id}:{user_id}")
                clear_cache(f"dashboard_stats:{user_id}")
                return jsonify({"message": "Tenant updated successfully"}), 200

            elif request.method == 'DELETE':
                cur.execute("UPDATE Tenant SET isDeleted = TRUE WHERE id = %s AND userId = %s", (id, user_id))
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Tenant not found or unauthorized"}), 404
                clear_cache(f"tenant:{user_id}")
                clear_cache(f"tenant:{id}:{user_id}")
                clear_cache(f"dashboard_stats:{user_id}")
                return jsonify({"message": "Tenant deleted successfully"}), 200

    finally:
        release_db_connection(conn)
