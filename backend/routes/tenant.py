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
                    """INSERT INTO Tenant (id, firstName, lastName, phoneNumber, email, unitID, leaseStartDate, leaseEndDate)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
                    (new_id, data['firstName'], data['lastName'], data.get('phoneNumber'), data.get('email'),
                     data.get('unitID'), start_date, end_date)
                )
                conn.commit()
                clear_cache("tenant")
                clear_cache("dashboard_stats")
                return jsonify({"message": "Tenant created", "id": new_id}), 201

            cached_data = get_cache("tenant")
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
            """)
            
            rows = []
            for row in cur.fetchall():
                d = dict(row)
                d['name'] = f"{d['firstName']} {d['lastName']}"
                d['amount'] = f"RWF {d['amount']:,.0f}" if d['amount'] else "RWF 0"
                
                # Fetch start date to calc due date
                start_date = d.pop('startDate', None)
                if start_date:
                    try:
                        # dueDate is 1 month after start date
                        import dateutil.relativedelta
                        due_date = start_date + dateutil.relativedelta.relativedelta(months=1)
                        d['dueDate'] = due_date.strftime("%b %-d, %Y")
                    except Exception:
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
                    WHERE t.id = %s
                """, (id,))
                tenant = cur.fetchone()
                if not tenant:
                    return jsonify({"error": "Tenant not found"}), 404

                d = dict(tenant)
                d['name'] = f"{d['firstName']} {d['lastName']}"
                d['amount'] = f"RWF {d['amount']:,.0f}" if d['amount'] else "RWF 0"
                
                start_date = d.pop('startDate', None)
                if start_date:
                    try:
                        import dateutil.relativedelta
                        due_date = start_date + dateutil.relativedelta.relativedelta(months=1)
                        d['dueDate'] = due_date.strftime("%b %-d, %Y")
                    except Exception:
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
                cur.execute("SELECT * FROM Tenant WHERE id = %s", (id,))
                existing = cur.fetchone()
                if not existing:
                    return jsonify({"error": "Tenant not found"}), 404

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
                       email = %s, status = %s WHERE id = %s""",
                    (new_first_name, new_last_name, new_phone, new_unit,
                     start_date, end_date, new_email, db_status, id)
                )
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Tenant not found"}), 404
                clear_cache("tenant")
                clear_cache(f"tenant:{id}")
                clear_cache("dashboard_stats")
                return jsonify({"message": "Tenant updated successfully"}), 200

            elif request.method == 'DELETE':
                cur.execute("DELETE FROM Tenant WHERE id = %s", (id,))
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Tenant not found"}), 404
                clear_cache("tenant")
                clear_cache(f"tenant:{id}")
                clear_cache("dashboard_stats")
                return jsonify({"message": "Tenant deleted successfully"}), 200

    finally:
        conn.close()
