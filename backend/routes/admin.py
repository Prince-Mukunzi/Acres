from flask import Blueprint, jsonify, request, current_app
import jwt
import uuid
import os
import threading
import resend
from psycopg2.extras import RealDictCursor
from backend.utils.db import get_db_connection, release_db_connection
from backend.utils.auth_middleware import require_admin
from backend.utils.email_templates import general_communication_template
from backend.routes.pindo import send_sms

resend.api_key = os.environ.get("RESEND_API_KEY")

admin_bp = Blueprint('admin_bp', __name__)


@admin_bp.route('/admin/stats', methods=['GET'])
@require_admin
def get_admin_stats():
    """Returns platform-wide counts visible only to admins."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT COUNT(id) as total FROM AppUser")
            total_users = cur.fetchone()['total'] or 0

            cur.execute("SELECT COUNT(id) as total FROM Property WHERE isDeleted = FALSE")
            total_properties = cur.fetchone()['total'] or 0

            cur.execute("""
                SELECT COUNT(u.id) as total 
                FROM Unit u 
                JOIN Property p ON u.propertyId = p.id 
                WHERE u.isDeleted = FALSE AND p.isDeleted = FALSE
            """)
            total_units = cur.fetchone()['total'] or 0

            cur.execute("""
                SELECT COUNT(t.id) as total 
                FROM Tenant t 
                JOIN Unit u ON t.unitID = u.id 
                JOIN Property p ON u.propertyId = p.id 
                WHERE t.isDeleted = FALSE AND u.isDeleted = FALSE AND p.isDeleted = FALSE
            """)
            total_tenants = cur.fetchone()['total'] or 0

            cur.execute("""
                SELECT COUNT(mt.id) as total 
                FROM MaintenanceTicket mt 
                JOIN Unit u ON mt.unitID = u.id 
                JOIN Property p ON u.propertyId = p.id 
                WHERE mt.isDeleted = FALSE AND u.isDeleted = FALSE AND p.isDeleted = FALSE
            """)
            total_tickets = cur.fetchone()['total'] or 0

            cur.execute("""
                SELECT COUNT(mt.id) as total 
                FROM MaintenanceTicket mt 
                JOIN Unit u ON mt.unitID = u.id 
                JOIN Property p ON u.propertyId = p.id 
                WHERE mt.isResolved = FALSE AND mt.isDeleted = FALSE AND u.isDeleted = FALSE AND p.isDeleted = FALSE
            """)
            open_tickets = cur.fetchone()['total'] or 0

            return jsonify({
                "totalUsers": total_users,
                "totalProperties": total_properties,
                "totalUnits": total_units,
                "totalTenants": total_tenants,
                "totalTickets": total_tickets,
                "openTickets": open_tickets,
            }), 200
    finally:
        release_db_connection(conn)


@admin_bp.route('/admin/users', methods=['GET'])
@require_admin
def get_admin_users():
    """Returns a list of all registered users with their property and unit counts."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT 
                    u.id, u.name, u.email, u.isSuspended, u.createdAt, u.isAdmin, u.lastLogin,
                    COUNT(DISTINCT p.id) as properties,
                    COUNT(DISTINCT un.id) as units
                FROM AppUser u
                LEFT JOIN Property p ON p.userId = u.id AND p.isDeleted = FALSE
                LEFT JOIN Unit un ON un.userId = u.id AND un.isDeleted = FALSE
                GROUP BY u.id
                ORDER BY u.createdAt DESC
            """)
            
            users = []
            
            for index, row in enumerate(cur.fetchall()):
                props = row['properties']
                if props >= 5:
                    plan = "Enterprise"
                elif props >= 3:
                    plan = "Pro"
                else:
                    plan = "Free"
                    
                users.append({
                    "id": row.get('id'),
                    "name": row.get('name'),
                    "email": row.get('email'),
                    "plan": plan,
                    "infrastructure": f"{props} Properties - {row.get('units', 0)} Units",
                    "joined": row.get('createdAt', row.get('createdat')).isoformat() if row.get('createdAt', row.get('createdat')) else "",
                    "isSuspended": row.get('isSuspended', row.get('issuspended', False)),
                    "isAdmin": row.get('isAdmin', row.get('isadmin', False)),
                    "lastLogin": row.get('lastlogin') or row.get('lastLogin')
                })

            for u in users:
                if u['lastLogin']:
                    u['lastLogin'] = u['lastLogin'].isoformat()
            
            return jsonify(users), 200
    finally:
        release_db_connection(conn)


@admin_bp.route('/admin/recent-activity', methods=['GET'])
@require_admin
def get_recent_activity():
    """Returns a combined feed of recent tickets and tenants across all users."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Recent tickets across the platform
            cur.execute("""
                SELECT
                    mt.id,
                    mt.title,
                    mt.description,
                    mt.isResolved as "isResolved",
                    u.unitName as "unitName",
                    au.name as "ownerName"
                FROM MaintenanceTicket mt
                LEFT JOIN Unit u ON mt.unitID = u.id
                LEFT JOIN AppUser au ON mt.userId = au.id
                WHERE mt.isDeleted = FALSE
                ORDER BY mt.id DESC
                LIMIT 10
            """)
            tickets = [dict(r) for r in cur.fetchall()]

            # Recent tenants across the platform
            cur.execute("""
                SELECT
                    t.id,
                    t.firstName || ' ' || t.lastName as name,
                    t.email,
                    t.status,
                    u.unitName as "unitName",
                    au.name as "ownerName"
                FROM Tenant t
                LEFT JOIN Unit u ON t.unitID = u.id
                LEFT JOIN AppUser au ON t.userId = au.id
                WHERE t.isDeleted = FALSE
                ORDER BY t.id DESC
                LIMIT 10
            """)
            tenants = [dict(r) for r in cur.fetchall()]

            return jsonify({
                "recentTickets": tickets,
                "recentTenants": tenants,
            }), 200
    finally:
        release_db_connection(conn)

@admin_bp.route('/admin/users/<user_id>/toggle-admin', methods=['PATCH'])
@require_admin
def toggle_admin(user_id):
    """Toggles the isAdmin status for a specific user."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT isAdmin FROM AppUser WHERE id = %s", (user_id,))
            row = cur.fetchone()
            if not row:
                return jsonify({"error": "User not found"}), 404
            
            new_status = not row[0]
            cur.execute("UPDATE AppUser SET isAdmin = %s WHERE id = %s", (new_status, user_id))
            conn.commit()
            return jsonify({"message": f"Admin status updated to {new_status}"}), 200
    finally:
        release_db_connection(conn)


@admin_bp.route('/admin/users/<user_id>/toggle-suspend', methods=['PATCH'])
@require_admin
def toggle_suspend(user_id):
    """Toggles the isSuspended status for a specific user."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT isSuspended FROM AppUser WHERE id = %s", (user_id,))
            row = cur.fetchone()
            if not row:
                return jsonify({"error": "User not found"}), 404
            
            new_status = not (row[0] is True)
            cur.execute("UPDATE AppUser SET isSuspended = %s WHERE id = %s", (new_status, user_id))
            conn.commit()
            return jsonify({"message": f"Suspended status updated to {new_status}"}), 200
    finally:
        release_db_connection(conn)


import time

@admin_bp.route('/admin/users/<user_id>', methods=['DELETE'])
@require_admin
def delete_user(user_id):
    """Irreversibly deletes a user and all cascade-linked data."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM AppUser WHERE id = %s RETURNING id", (user_id,))
            deleted = cur.fetchone()
            if not deleted:
                return jsonify({"error": "User not found"}), 404
            conn.commit()
            return jsonify({"message": "User and associated data permanently deleted"}), 200
    finally:
        release_db_connection(conn)


@admin_bp.route('/admin/users/<user_id>/impersonate', methods=['POST'])
@require_admin
def impersonate(user_id):
    """Generates a fresh JWT for the target user so the admin can view their session."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT id, name, email, picture, isAdmin FROM AppUser WHERE id = %s", (user_id,))
            row = cur.fetchone()
            if not row:
                return jsonify({"error": "User not found"}), 404

            user_data = dict(row)
            token = jwt.encode(
                {"user_id": user_data['id'], "exp": int(time.time()) + (7 * 24 * 3600)},
                current_app.config['SECRET_KEY'],
                algorithm="HS256"
            )

            resp = jsonify({"message": "Impersonation session established", "user": user_data})
            resp.set_cookie(
                'jwt_token', token, httponly=True, secure=True,
                samesite='Strict', max_age=7 * 24 * 3600
            )
            return resp
    finally:
        release_db_connection(conn)


@admin_bp.route('/admin/communications', methods=['GET'])
@require_admin
def get_all_communications():
    """Fetches a platform-wide log of communications sent by all users."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT
                    c.id, c.title, c.body, c.sentAt as "createdAt",
                    c.channel,
                    t.firstName || ' ' || t.lastName as "tenantName",
                    u.name as "senderName",
                    u.email as "senderEmail",
                    p.name as "propertyName"
                FROM Communication c
                LEFT JOIN Tenant t ON c.tenantID = t.id
                LEFT JOIN AppUser u ON c.userId = u.id
                LEFT JOIN Unit un ON c.unitID = un.id
                LEFT JOIN Property p ON un.propertyId = p.id
                WHERE c.isDeleted = FALSE
                ORDER BY c.sentAt DESC
                LIMIT 50
            """)
            rows = []
            for row in cur.fetchall():
                d = dict(row)
                if d.get('createdAt'):
                    d['createdAt'] = d['createdAt'].isoformat()
                elif d.get('createdat'):
                    d['createdAt'] = d['createdat'].isoformat()
                d['channel'] = d.get('channel') or 'email'
                rows.append(d)
            return jsonify(rows), 200
    finally:
        release_db_connection(conn)


@admin_bp.route('/admin/communication-stats', methods=['GET'])
@require_admin
def get_communication_stats():
    """Returns aggregated communication metrics for the admin monitor page."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT COUNT(id) as total FROM Communication WHERE isDeleted = FALSE")
            total = cur.fetchone()['total'] or 0

            cur.execute("""
                SELECT COUNT(id) as total FROM Communication
                WHERE isDeleted = FALSE
                AND sentAt >= DATE_TRUNC('month', NOW())
            """)
            this_month = cur.fetchone()['total'] or 0

            cur.execute("""
                SELECT u.name, COUNT(c.id) as count
                FROM Communication c
                JOIN AppUser u ON c.userId = u.id
                WHERE c.isDeleted = FALSE
                GROUP BY u.name
                ORDER BY count DESC
                LIMIT 1
            """)
            top_row = cur.fetchone()
            top_sender = top_row['name'] if top_row else 'N/A'

            cur.execute("""
                SELECT
                    TO_CHAR(DATE_TRUNC('month', m.month_start), 'Mon') as month,
                    COALESCE(c.count, 0) as count
                FROM (
                    SELECT * FROM generate_series(
                        DATE_TRUNC('month', NOW() - INTERVAL '5 months'),
                        DATE_TRUNC('month', NOW()),
                        '1 month'::interval
                    ) as month_start
                ) m
                LEFT JOIN (
                    SELECT DATE_TRUNC('month', sentAt) as month, COUNT(id) as count
                    FROM Communication
                    WHERE isDeleted = FALSE AND sentAt >= NOW() - INTERVAL '6 months'
                    GROUP BY DATE_TRUNC('month', sentAt)
                ) c ON c.month = m.month_start
                ORDER BY m.month_start
            """)
            monthly = [dict(r) for r in cur.fetchall()]

            return jsonify({
                "total": total,
                "thisMonth": this_month,
                "topSender": top_sender,
                "monthly": monthly,
            }), 200
    finally:
        release_db_connection(conn)


@admin_bp.route('/admin/send-communication', methods=['POST'])
@require_admin
def admin_send_communication():
    """Sends a targeted communication from admin to landlords by plan or individually."""
    data = request.get_json()
    audience = data.get('audience', '')
    title = data.get('title', '').strip()
    body = data.get('body', '').strip()
    channel = data.get('channel', 'email')

    if not title or not body:
        return jsonify({"error": "Title and body are required"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if audience.startswith('landlord:'):
                user_id = audience.split(':', 1)[1]
                cur.execute("SELECT id, name, email FROM AppUser WHERE id = %s", (user_id,))
                targets = cur.fetchall()
            elif audience.startswith('plan:'):
                plan_name = audience.split(':', 1)[1]
                plan_thresholds = {
                    'Free': (0, 2),
                    'Pro': (3, 4),
                    'Enterprise': (5, 999999),
                }
                low, high = plan_thresholds.get(plan_name, (0, 0))
                cur.execute("""
                    SELECT u.id, u.name, u.email, COUNT(DISTINCT p.id) as props
                    FROM AppUser u
                    LEFT JOIN Property p ON p.userId = u.id AND p.isDeleted = FALSE
                    GROUP BY u.id
                    HAVING COUNT(DISTINCT p.id) >= %s AND COUNT(DISTINCT p.id) <= %s
                """, (low, high))
                targets = cur.fetchall()
            else:
                cur.execute("SELECT id, name, email FROM AppUser")
                targets = cur.fetchall()

            if not targets:
                return jsonify({"error": "No users match the selected audience"}), 404

            admin_id = request.user_id
            sent_count = 0

            for target in targets:
                comm_id = str(uuid.uuid4())
                cur.execute(
                    "INSERT INTO Communication (id, title, body, userId, channel) VALUES (%s, %s, %s, %s, %s)",
                    (comm_id, title, body, admin_id, channel)
                )

                if channel == 'email' and target.get('email'):
                    recipient_name = target.get('name', 'User')
                    email_html = general_communication_template(
                        tenant_name=recipient_name,
                        subject=title,
                        body=body,
                        landlord_name="Acres Admin",
                    )
                    def _send_email(email=target['email'], html=email_html, subj=title):
                        try:
                            resend.Emails.send({
                                "from": "Acres <onboarding@resend.dev>",
                                "to": [email],
                                "subject": subj,
                                "html": html,
                            })
                        except Exception as e:
                            current_app.logger.error(f"Admin email send failed: {e}")
                    threading.Thread(target=_send_email).start()
                    sent_count += 1

                elif channel == 'sms':
                    cur.execute("SELECT phoneNumber FROM Tenant WHERE userId = %s AND isDeleted = FALSE LIMIT 1", (target['id'],))
                    phone_row = cur.fetchone()
                    if phone_row and phone_row.get('phonenumber'):
                        threading.Thread(target=send_sms, args=(phone_row['phonenumber'], f"{title}\n\n{body}")).start()
                        sent_count += 1

            conn.commit()
            return jsonify({"message": f"Communication sent to {sent_count} recipient(s)", "count": sent_count}), 201
    finally:
        release_db_connection(conn)

@admin_bp.route('/admin/tickets', methods=['GET'])
@require_admin
def get_admin_tickets():
    """Returns all tickets globally for the admin, with unit and property info mapping Landlord to Tenant entity to satisfy frontend TicketCard schema."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT
                    mt.id,
                    mt.title,
                    mt.description as body,
                    mt.status,
                    mt.isResolved as "isResolved",
                    u.unitName as "unitName",
                    p.name as "propertyName",
                    au.name as "ownerName"
                FROM MaintenanceTicket mt
                LEFT JOIN Unit u ON mt.unitID = u.id
                LEFT JOIN Property p ON u.propertyId = p.id
                LEFT JOIN AppUser au ON mt.userId = au.id
                WHERE mt.isDeleted = FALSE
                ORDER BY mt.id DESC
            """)
            rows = []
            for row in cur.fetchall():
                d = dict(row)
                # Map expected UI schema natively so frontend TicketCard doesn't break
                d['tenant'] = {'firstName': d.get('ownerName', 'System'), 'lastName': ''}
                d['createdAt'] = None # MaintenanceTicket currently lacks createdAt but UI won't fail if null
                d['body'] = d.get('body', d.get('description', ''))
                rows.append(d)
            return jsonify(rows), 200
    finally:
        release_db_connection(conn)


@admin_bp.route('/admin/overview-stats', methods=['GET'])
@require_admin
def get_overview_stats():
    """Aggregated statistics specifically tailored for the Figma dashboard redesign."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # 1. Top Cards
            cur.execute("SELECT COUNT(id) as total FROM Property WHERE isDeleted = FALSE")
            total_properties = cur.fetchone()['total'] or 0

            cur.execute("SELECT COUNT(id) as total FROM AppUser WHERE lastLogin >= NOW() - INTERVAL '7 days'")
            active_landlords = cur.fetchone()['total'] or 0

            cur.execute("""
                SELECT COUNT(u.id) as total 
                FROM Unit u 
                JOIN Property p ON u.propertyId = p.id 
                WHERE u.isDeleted = FALSE AND p.isDeleted = FALSE
            """)
            total_units = cur.fetchone()['total'] or 0

            cur.execute("""
                SELECT COUNT(t.id) as total 
                FROM Tenant t 
                JOIN Unit u ON t.unitID = u.id 
                JOIN Property p ON u.propertyId = p.id 
                WHERE t.isDeleted = FALSE AND u.isDeleted = FALSE AND p.isDeleted = FALSE
            """)
            total_tenants = cur.fetchone()['total'] or 0

            cur.execute("""
                SELECT COUNT(mt.id) as total 
                FROM MaintenanceTicket mt 
                JOIN Unit u ON mt.unitID = u.id 
                JOIN Property p ON u.propertyId = p.id 
                WHERE mt.isDeleted = FALSE AND u.isDeleted = FALSE AND p.isDeleted = FALSE
            """)
            total_tickets = cur.fetchone()['total'] or 0

            # 2. Month-over-month trends for each top card
            def calc_trend(table, joins="", extra_where=""):
                """Calculate % change: items created this month vs last month."""
                try:
                    cur.execute(f"""
                        SELECT 
                            COUNT(CASE WHEN {table}.createdAt >= DATE_TRUNC('month', NOW()) THEN 1 END) as this_month,
                            COUNT(CASE WHEN {table}.createdAt >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
                                        AND {table}.createdAt < DATE_TRUNC('month', NOW()) THEN 1 END) as last_month
                        FROM {table}
                        {joins}
                        WHERE {table}.isDeleted = FALSE {extra_where}
                    """)
                    row = cur.fetchone()
                    this_m = row['this_month'] or 0
                    last_m = row['last_month'] or 0
                    if last_m == 0:
                        pct = 100 if this_m > 0 else 0
                    else:
                        pct = round(((this_m - last_m) / last_m) * 100)
                    return {"percentage": f"{abs(pct)}%", "positive": pct >= 0}
                except Exception as e:
                    current_app.logger.error(f"Error calculating trend for {table}: {e}")
                    return {"percentage": "0%", "positive": True}

            trends = {
                "properties": calc_trend("Property"),
                "units": calc_trend("Unit", "JOIN Property p ON Unit.propertyId = p.id", "AND p.isDeleted = FALSE"),
                "tenants": calc_trend("Tenant", "JOIN Unit u ON Tenant.unitID = u.id JOIN Property p ON u.propertyId = p.id", "AND u.isDeleted = FALSE AND p.isDeleted = FALSE"),
                "tickets": calc_trend("MaintenanceTicket", "JOIN Unit u ON MaintenanceTicket.unitID = u.id JOIN Property p ON u.propertyId = p.id", "AND u.isDeleted = FALSE AND p.isDeleted = FALSE"),
            }

            # Active landlord trend: AppUser has no isDeleted, track by lastLogin instead
            try:
                cur.execute("""
                    SELECT
                        COUNT(CASE WHEN lastLogin >= DATE_TRUNC('month', NOW()) THEN 1 END) as this_month,
                        COUNT(CASE WHEN lastLogin >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
                                    AND lastLogin < DATE_TRUNC('month', NOW()) THEN 1 END) as last_month
                    FROM AppUser
                """)
                row = cur.fetchone()
                this_m = row['this_month'] or 0
                last_m = row['last_month'] or 0
                if last_m == 0:
                    al_pct = 100 if this_m > 0 else 0
                else:
                    al_pct = round(((this_m - last_m) / last_m) * 100)
                trends["activeLandlords"] = {"percentage": f"{abs(al_pct)}%", "positive": al_pct >= 0}
            except Exception as e:
                current_app.logger.error(f"Error calculating activeLandlords trend: {e}")
                trends["activeLandlords"] = {"percentage": "0%", "positive": True}

            # 3. Monthly growth data for the area chart (last 6 months)
            cur.execute("""
                SELECT 
                    TO_CHAR(DATE_TRUNC('month', m.month_start), 'Mon') as month,
                    COALESCE(u.count, 0) as users,
                    COALESCE(p.count, 0) as properties
                FROM (
                    SELECT * FROM generate_series(
                        DATE_TRUNC('month', NOW() - INTERVAL '5 months'),
                        DATE_TRUNC('month', NOW()),
                        '1 month'::interval
                    ) as month_start
                ) m
                LEFT JOIN (
                    SELECT DATE_TRUNC('month', createdAt) as month, COUNT(id) as count
                    FROM AppUser
                    WHERE createdAt >= NOW() - INTERVAL '6 months'
                    GROUP BY DATE_TRUNC('month', createdAt)
                ) u ON u.month = m.month_start
                LEFT JOIN (
                    SELECT DATE_TRUNC('month', createdAt) as month, COUNT(id) as count
                    FROM Property
                    WHERE createdAt >= NOW() - INTERVAL '6 months' AND isDeleted = FALSE
                    GROUP BY DATE_TRUNC('month', createdAt)
                ) p ON p.month = m.month_start
                ORDER BY m.month_start
            """)
            growth_data = [dict(r) for r in cur.fetchall()]

            # 4. Communications — all Communication records are emails sent via Resend.
            #    SMS (Pindo) sends are not tracked in the Communication table.
            cur.execute("SELECT COUNT(id) as total FROM Communication WHERE isDeleted = FALSE")
            total_comms = cur.fetchone()['total'] or 0
            
            resend_count = total_comms  # All recorded comms are Resend emails
            pindo_count = 0             # SMS not tracked in Communication table
            
            # 5. Subscriptions (Assign based on property count thresholds)
            cur.execute("""
                SELECT 
                    u.id, u.name, u.email, u.isSuspended, u.createdAt, u.isAdmin, u.lastLogin,
                    COUNT(DISTINCT p.id) as properties,
                    COUNT(DISTINCT un.id) as units
                FROM AppUser u
                LEFT JOIN Property p ON p.userId = u.id AND p.isDeleted = FALSE
                LEFT JOIN Unit un ON un.userId = u.id AND un.isDeleted = FALSE
                GROUP BY u.id
                ORDER BY u.lastLogin DESC NULLS LAST
            """)
            
            users = []
            sub_counts = {"enterprise": 0, "pro": 0, "free": 0}
            
            for index, row in enumerate(cur.fetchall()):
                props = row['properties']
                if props >= 5:
                    plan = "Enterprise"
                    sub_counts["enterprise"] += 1
                elif props >= 3:
                    plan = "Pro"
                    sub_counts["pro"] += 1
                else:
                    plan = "Free"
                    sub_counts["free"] += 1
                    
                users.append({
                    "id": row.get('id'),
                    "name": row.get('name'),
                    "email": row.get('email'),
                    "plan": plan,
                    "infrastructure": f"{props} Properties - {row.get('units', 0)} Units",
                    "joined": row.get('createdAt', row.get('createdat')).isoformat() if row.get('createdAt', row.get('createdat')) else "",
                    "isSuspended": row.get('isSuspended', row.get('issuspended', False)),
                    "isAdmin": row.get('isAdmin', row.get('isadmin', False)),
                    "lastLogin": row.get('lastlogin') or row.get('lastLogin')
                })

            for u in users:
                if u['lastLogin']:
                    u['lastLogin'] = u['lastLogin'].isoformat()

            return jsonify({
                "topCards": {
                    "totalProperties": total_properties,
                    "activeLandlords": active_landlords,
                    "totalUnits": total_units,
                    "totalTenants": total_tenants,
                    "totalTickets": total_tickets,
                },
                "trends": trends,
                "growthData": growth_data,
                "communications": {
                    "pindo": pindo_count,
                    "resend": resend_count,
                    "total": total_comms
                },
                "subscriptions": sub_counts,
                "recentUsers": users[:5]
            }), 200
    finally:
        release_db_connection(conn)


@admin_bp.route('/admin/properties', methods=['GET'])
@require_admin
def get_admin_properties():
    """Returns all properties platform-wide with unit, tenant, and ticket counts."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT
                    p.id,
                    p.name,
                    p.address,
                    u.name as owner_name,
                    COUNT(DISTINCT un.id) as units,
                    COUNT(DISTINCT t.id) as tenants,
                    COUNT(DISTINCT mt.id) as tickets
                FROM Property p
                LEFT JOIN AppUser u ON p.userId = u.id
                LEFT JOIN Unit un ON un.propertyId = p.id AND un.isDeleted = FALSE
                LEFT JOIN Tenant t ON t.unitId = un.id AND t.isDeleted = FALSE
                LEFT JOIN MaintenanceTicket mt ON mt.unitId = un.id AND mt.isDeleted = FALSE
                WHERE p.isDeleted = FALSE
                GROUP BY p.id, u.name
                ORDER BY p.id DESC
            """)
            rows = [dict(r) for r in cur.fetchall()]
            return jsonify(rows), 200
    finally:
        release_db_connection(conn)
