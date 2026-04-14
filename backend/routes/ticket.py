from flask import Blueprint, request, jsonify
from psycopg2.extras import RealDictCursor
import uuid
from dsa.extras import get_cache, create_cache, clear_cache, sort_tickets, clear_cache_prefix
from backend.utils.db import get_db_connection, release_db_connection
from backend.utils.auth_middleware import require_user

#TICKET ENDPOINTS
ticket_bp = Blueprint('ticket_bp', __name__)

#TICKET ENDPOINTS
@ticket_bp.route('/ticket', methods=['GET', 'POST'])
@require_user
def ticket_collection():
    user_id = request.user_id
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            if request.method == 'POST':
                data = request.get_json()
                new_id = str(uuid.uuid4())
                
                # Support unitName lookup (for QR ticket submissions)
                unit_id = data.get('unitID')
                if not unit_id and data.get('unitName'):
                    cur.execute(
                        "SELECT id FROM Unit WHERE unitName = %s LIMIT 1",
                        (data['unitName'],)
                    )
                    unit_row = cur.fetchone()
                    if unit_row:
                        unit_id = unit_row['id']
                
                cur.execute(
                    """INSERT INTO MaintenanceTicket (id, unitID, title, description, isResolved, userId)
                       VALUES (%s, %s, %s, %s, FALSE, %s)""",
                    (new_id, unit_id, data.get('title', 'QR Ticket'), data.get('description'), user_id)
                )
                conn.commit()
                clear_cache_prefix(f"ticket:{user_id}")
                clear_cache_prefix(f"ticket_queue:{user_id}")
                return jsonify({"message": "Ticket created", "id": new_id}), 201

            cached_data = get_cache(f"ticket:{user_id}")
            if cached_data:
                return jsonify(cached_data), 200

            cur.execute("""
                SELECT
                    mt.id,
                    mt.description as body,
                    mt.isResolved as status,
                    u.unitName as unit,
                    t.firstName as "firstName",
                    t.lastName as "lastName"
                FROM MaintenanceTicket mt
                LEFT JOIN Unit u ON mt.unitID = u.id
                LEFT JOIN Tenant t ON t.unitID = u.id
                WHERE mt.userId = %s AND mt.isDeleted = FALSE
            """, (user_id,))
            from datetime import datetime
            rows = []
            for row in cur.fetchall():
                d = dict(row)
                fname = d.pop('firstName', '')
                lname = d.pop('lastName', '')
                d['tenant'] = f"{fname} {lname}".strip() if (fname or lname) else "Unknown"
                d['createdAt'] = datetime.now().isoformat()
                rows.append(d)
                
            sorted_tickets = sort_tickets(rows)
            create_cache(f"ticket:{user_id}", sorted_tickets)
            return jsonify(sorted_tickets), 200

    finally:
        release_db_connection(conn)


@ticket_bp.route('/ticket/queue', methods=['GET'])
@require_user
def ticket_queue():
    user_id = request.user_id
    
    cached_data = get_cache(f"ticket_queue:{user_id}")
    if cached_data:
        return jsonify(cached_data), 200

    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT
                    mt.id,
                    mt.description as body,
                    mt.isResolved as status,
                    u.unitName as unit,
                    t.firstName as "firstName",
                    t.lastName as "lastName"
                FROM MaintenanceTicket mt
                LEFT JOIN Unit u ON mt.unitID = u.id
                LEFT JOIN Tenant t ON t.unitID = u.id
                WHERE mt.userId = %s AND mt.isDeleted = FALSE
            """, (user_id,))
            
            from datetime import datetime
            rows = []
            for row in cur.fetchall():
                d = dict(row)
                fname = d.pop('firstName', '')
                lname = d.pop('lastName', '')
                d['tenant'] = f"{fname} {lname}".strip() if (fname or lname) else "Unknown"
                d['createdAt'] = datetime.now().isoformat()
                rows.append(d)

            sorted_tickets = sort_tickets(rows)

            create_cache(f"ticket_queue:{user_id}", sorted_tickets)
            return jsonify(sorted_tickets), 200
    finally:
        release_db_connection(conn)


@ticket_bp.route('/ticket/<string:id>', methods=['GET', 'PUT', 'DELETE'])
@require_user
def ticket_resource(id):
    user_id = request.user_id
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            if request.method == 'GET':
                cache_key = f"ticket:{id}:{user_id}"
                cached_data = get_cache(cache_key)
                if cached_data:
                    return jsonify(cached_data), 200

                cur.execute("""
                    SELECT
                        mt.id,
                        mt.description as body,
                        mt.isResolved as status,
                        u.unitName as unit,
                        t.firstName as "firstName",
                        t.lastName as "lastName"
                    FROM MaintenanceTicket mt
                    LEFT JOIN Unit u ON mt.unitID = u.id
                    LEFT JOIN Tenant t ON t.unitID = u.id
                    WHERE mt.id = %s AND mt.userId = %s AND mt.isDeleted = FALSE
                """, (id, user_id))
                ticket = cur.fetchone()
                if not ticket:
                    return jsonify({"error": "Ticket not found"}), 404

                d = dict(ticket)
                from datetime import datetime
                fname = d.pop('firstName', '')
                lname = d.pop('lastName', '')
                d['tenant'] = f"{fname} {lname}".strip() if (fname or lname) else "Unknown"
                d['createdAt'] = datetime.now().isoformat()
                
                create_cache(cache_key, d)
                return jsonify(d), 200

            elif request.method == 'PUT':
                data = request.get_json()
                
                # Build a dynamic update query from provided fields
                updates = []
                values = []
                if 'unitID' in data:
                    updates.append("unitID = %s")
                    values.append(data['unitID'])
                if 'description' in data:
                    updates.append("description = %s")
                    values.append(data['description'])
                if 'isResolved' in data:
                    updates.append("isResolved = %s")
                    values.append(data['isResolved'])
                if 'status' in data:
                    updates.append("status = %s")
                    values.append(data['status'])
                
                if not updates:
                    return jsonify({"error": "No fields to update"}), 400
                
                values.append(id)
                values.append(user_id)
                cur.execute(
                    f"UPDATE MaintenanceTicket SET {', '.join(updates)} WHERE id = %s AND userId = %s AND isDeleted = FALSE",
                    values
                )
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Ticket not found or unauthorized"}), 404
                clear_cache_prefix(f"ticket:{user_id}")
                clear_cache_prefix(f"ticket_queue:{user_id}")
                clear_cache_prefix(f"ticket:{id}:{user_id}")
                return jsonify({"message": "Ticket updated successfully"}), 200

            elif request.method == 'DELETE':
                cur.execute("UPDATE MaintenanceTicket SET isDeleted = TRUE WHERE id = %s AND userId = %s", (id, user_id))
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Ticket not found or unauthorized"}), 404
                clear_cache_prefix(f"ticket:{user_id}")
                clear_cache_prefix(f"ticket_queue:{user_id}")
                clear_cache_prefix(f"ticket:{id}:{user_id}")
                return jsonify({"message": "Ticket deleted successfully"}), 200

    finally:
        release_db_connection(conn)

