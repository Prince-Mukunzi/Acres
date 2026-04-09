from flask import Blueprint, jsonify, request, current_app
import jwt
from psycopg2.extras import RealDictCursor
from backend.utils.db import get_db_connection, release_db_connection
from backend.utils.auth_middleware import require_admin

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

            cur.execute("SELECT COUNT(id) as total FROM Unit WHERE isDeleted = FALSE")
            total_units = cur.fetchone()['total'] or 0

            cur.execute("SELECT COUNT(id) as total FROM Tenant WHERE isDeleted = FALSE")
            total_tenants = cur.fetchone()['total'] or 0

            cur.execute("SELECT COUNT(id) as total FROM MaintenanceTicket WHERE isDeleted = FALSE")
            total_tickets = cur.fetchone()['total'] or 0

            cur.execute("SELECT COUNT(id) as total FROM MaintenanceTicket WHERE isResolved = FALSE AND isDeleted = FALSE")
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
                    u.id, u.name, u.email, u.isSuspended, u.createdAt, u.isAdmin,
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
                    "isAdmin": row.get('isAdmin', row.get('isadmin', False))
                })

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
                    t.firstName || ' ' || t.lastName as "tenantName",
                    u.name as "senderName",
                    p.name as "propertyName"
                FROM Communication c
                LEFT JOIN Tenant t ON c.tenantID = t.id
                LEFT JOIN AppUser u ON c.userId = u.id
                LEFT JOIN Unit un ON c.unitID = un.id
                LEFT JOIN Property p ON un.propertyId = p.id
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
                rows.append(d)
            return jsonify(rows), 200
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

            cur.execute("SELECT COUNT(id) as total FROM Unit WHERE isDeleted = FALSE")
            total_units = cur.fetchone()['total'] or 0

            cur.execute("SELECT COUNT(id) as total FROM Tenant WHERE isDeleted = FALSE")
            total_tenants = cur.fetchone()['total'] or 0

            cur.execute("SELECT COUNT(id) as total FROM MaintenanceTicket WHERE isDeleted = FALSE")
            total_tickets = cur.fetchone()['total'] or 0

            # 2. Communications Split (Pindo vs Resend Mock)
            cur.execute("SELECT COUNT(id) as total FROM Communication")
            total_comms = cur.fetchone()['total'] or 0
            
            pindo_count = int(total_comms * 0.70) if total_comms > 0 else 0
            resend_count = total_comms - pindo_count
            
            # 3. Subscriptions Mock (Assign based on property count thresholds just for visual testing)
            # Enterprise (>5), Pro (3-5), Free (0-2)
            cur.execute("""
                SELECT 
                    u.id, u.name, u.email, u.isSuspended, u.createdAt, u.isAdmin,
                    COUNT(DISTINCT p.id) as properties,
                    COUNT(DISTINCT un.id) as units
                FROM AppUser u
                LEFT JOIN Property p ON p.userId = u.id AND p.isDeleted = FALSE
                LEFT JOIN Unit un ON un.userId = u.id AND un.isDeleted = FALSE
                GROUP BY u.id
                ORDER BY u.createdAt DESC
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
                    "isAdmin": row.get('isAdmin', row.get('isadmin', False))
                })

            return jsonify({
                "topCards": {
                    "totalProperties": total_properties,
                    "totalUnits": total_units,
                    "totalTenants": total_tenants,
                    "totalTickets": total_tickets,
                },
                "communications": {
                    "pindo": pindo_count,
                    "resend": resend_count,
                    "total": total_comms
                },
                "subscriptions": sub_counts,
                "recentUsers": users[:5] # Return latest 5 for the overview table
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
