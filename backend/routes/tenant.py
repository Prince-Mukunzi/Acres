from flask import Blueprint, request, jsonify
from psycopg2.extras import RealDictCursor
import uuid
from dsa.extras import get_cache, create_cache, clear_cache, clear_cache_prefix
from datetime import date, timedelta
from backend.utils.db import get_db_connection, release_db_connection
from backend.utils.auth_middleware import require_user


tenant_bp = Blueprint('tenant_bp', __name__)


def compute_due_info(charging_day, today=None):
    """Return (nextDueDate, daysOverdue) based on chargingDay (1-28)."""
    if not charging_day:
        return None, None
    if today is None:
        today = date.today()
    year, month = today.year, today.month
    try:
        due_this_month = date(year, month, charging_day)
    except ValueError:
        # Handle months shorter than chargingDay (e.g. Feb 30 -> Feb 28)
        import calendar
        last_day = calendar.monthrange(year, month)[1]
        due_this_month = date(year, month, min(charging_day, last_day))

    if today <= due_this_month:
        next_due = due_this_month
    else:
        # Move to next month
        if month == 12:
            next_month, next_year = 1, year + 1
        else:
            next_month, next_year = month + 1, year
        try:
            next_due = date(next_year, next_month, charging_day)
        except ValueError:
            import calendar
            last_day = calendar.monthrange(next_year, next_month)[1]
            next_due = date(next_year, next_month, min(charging_day, last_day))

    days_overdue = (today - due_this_month).days
    return next_due, days_overdue


def format_tenant_row(d):
    """Transform a raw DB tenant dict into a frontend-ready dict."""
    d['name'] = f"{d['firstName']} {d['lastName']}"
    d['amount'] = d.get('amount') or 0

    start_date = d.pop('startDate', None)
    charging_day = d.get('chargingDay')

    # If no chargingDay was set, default to the day-of-month from leaseStartDate
    if not charging_day and start_date:
        charging_day = start_date.day
        d['chargingDay'] = charging_day

    next_due, days_overdue = compute_due_info(charging_day)

    if next_due:
        try:
            d['dueDate'] = next_due.strftime("%b %-d, %Y")
        except ValueError:
            d['dueDate'] = next_due.strftime("%b %d, %Y")
        d['nextDueDate'] = d['dueDate']
    else:
        d['dueDate'] = None
        d['nextDueDate'] = None

    d['daysOverdue'] = days_overdue if days_overdue is not None else 0

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
    return d


TENANT_SELECT = """
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
        t.chargingDay as "chargingDay",
        t.status as "dbStatus",
        p.name as "propertyName"
    FROM Tenant t
    LEFT JOIN Unit u ON t.unitID = u.id
    LEFT JOIN Property p ON u.propertyId = p.id
"""


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
                charging_day = data.get('chargingDay')
                cur.execute(
                    """INSERT INTO Tenant (id, firstName, lastName, phoneNumber, email, unitID, leaseStartDate, leaseEndDate, chargingDay, userId)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                    (new_id, data['firstName'], data['lastName'], data.get('phoneNumber'), data.get('email'),
                     data.get('unitID'), start_date, end_date, charging_day, user_id)
                )
                conn.commit()
                clear_cache_prefix(f"tenant:{user_id}")
                clear_cache_prefix(f"dashboard_stats:{user_id}")
                return jsonify({"message": "Tenant created", "id": new_id}), 201

            page = request.args.get('page', 1, type=int)
            limit = request.args.get('limit', 50, type=int)
            search = request.args.get('search', '').lower()
            offset = (page - 1) * limit

            cache_key = f"tenant:{user_id}:page={page}:limit={limit}:search={search}"
            cached_data = get_cache(cache_key)
            if cached_data:
                return jsonify(cached_data), 200

            query = TENANT_SELECT + " WHERE t.userId = %s AND t.isDeleted = FALSE"
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
                rows.append(format_tenant_row(d))
                
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

                cur.execute(
                    TENANT_SELECT + " WHERE t.id = %s AND t.userId = %s AND t.isDeleted = FALSE",
                    (id, user_id)
                )
                tenant = cur.fetchone()
                if not tenant:
                    return jsonify({"error": "Tenant not found"}), 404

                d = format_tenant_row(dict(tenant))
                create_cache(cache_key, d)
                return jsonify(d), 200

            elif request.method == 'PUT':
                data = request.get_json()
                cur.execute("SELECT * FROM Tenant WHERE id = %s AND userId = %s AND isDeleted = FALSE", (id, user_id))
                existing = cur.fetchone()
                if not existing:
                    return jsonify({"error": "Tenant not found or unauthorized"}), 404

                new_first_name = data.get('firstName', existing['firstname'])
                new_last_name = data.get('lastName', existing['lastname'])
                new_phone = data.get('phoneNumber', existing['phonenumber'])
                new_email = data.get('email', existing['email'])
                new_unit = data.get('unitID', existing['unitid'])
                new_charging_day = data.get('chargingDay', existing.get('chargingday'))

                curr_start = existing['leasestartdate'].isoformat() if existing['leasestartdate'] else date.today().isoformat()
                curr_end = existing['leaseenddate'].isoformat() if existing['leaseenddate'] else date.today().isoformat()
                
                start_date = data.get('leaseStartDate', curr_start)
                end_date   = data.get('leaseEndDate', curr_end)
                
                frontend_status = data.get('status')
                if frontend_status == 'Paid':
                    db_status = 'PAID'
                    
                    if existing['status'] != 'PAID' or 'paymentMethod' in data:
                        payment_method = data.get('paymentMethod', 'Manual')
                        payment_id = str(uuid.uuid4())
                        
                        rent_amount = 0
                        if new_unit:
                            cur.execute("SELECT rentAmount FROM Unit WHERE id = %s", (new_unit,))
                            unit_row = cur.fetchone()
                            if unit_row and unit_row['rentamount']:
                                rent_amount = unit_row['rentamount']
                                
                        cur.execute(
                            """INSERT INTO Payment (id, tenantID, amount, paymentMethod, status, userId)
                               VALUES (%s, %s, %s, %s, 'Paid', %s)""",
                            (payment_id, id, rent_amount, payment_method, user_id)
                        )

                elif frontend_status == 'Overdue':
                    db_status = 'OVERDUE'
                else:
                    db_status = existing['status']
                
                cur.execute(
                    """UPDATE Tenant SET firstName = %s, lastName = %s, phoneNumber = %s,
                       unitID = %s, leaseStartDate = %s, leaseEndDate = %s, 
                       email = %s, status = %s, chargingDay = %s WHERE id = %s AND userId = %s AND isDeleted = FALSE""",
                    (new_first_name, new_last_name, new_phone, new_unit,
                     start_date, end_date, new_email, db_status, new_charging_day, id, user_id)
                )
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Tenant not found or unauthorized"}), 404
                clear_cache_prefix(f"tenant:{user_id}")
                clear_cache_prefix(f"tenant:{id}:{user_id}")
                clear_cache_prefix(f"dashboard_stats:{user_id}")
                return jsonify({"message": "Tenant updated successfully"}), 200

            elif request.method == 'DELETE':
                cur.execute("UPDATE Tenant SET isDeleted = TRUE WHERE id = %s AND userId = %s", (id, user_id))
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Tenant not found or unauthorized"}), 404
                clear_cache_prefix(f"tenant:{user_id}")
                clear_cache_prefix(f"tenant:{id}:{user_id}")
                clear_cache_prefix(f"dashboard_stats:{user_id}")
                return jsonify({"message": "Tenant deleted successfully"}), 200

    finally:
        release_db_connection(conn)


@tenant_bp.route('/tenant/<string:id>/payments', methods=['GET'])
@require_user
def tenant_payments(id):
    user_id = request.user_id
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT id FROM Tenant WHERE id = %s AND userId = %s AND isDeleted = FALSE", (id, user_id))
            if not cur.fetchone():
                return jsonify({"error": "Tenant not found or unauthorized"}), 404

            cur.execute("""
                SELECT id, amount, paymentMethod, status, paidAt
                FROM Payment
                WHERE tenantID = %s AND userId = %s AND isDeleted = FALSE
                ORDER BY paidAt DESC
            """, (id, user_id))
            
            rows = cur.fetchall()
            payments = []
            for r in rows:
                p = dict(r)
                if p.get('paidat'):
                    p['date'] = p['paidat'].strftime('%b %-d, %Y')
                    p.pop('paidat')
                payments.append(p)

            return jsonify(payments), 200
    finally:
        release_db_connection(conn)
