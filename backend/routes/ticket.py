from flask import Blueprint, request, jsonify
from psycopg2.extras import RealDictCursor
import uuid
from dsa.extras import get_cache, create_cache, clear_cache, sort_tickets
from backend.utils.db import get_db_connection

#TICKET ENDPOINTS
ticket_bp = Blueprint('ticket_bp', __name__)

#TICKET ENDPOINTS
@ticket_bp.route('/ticket', methods=['GET', 'POST'])
def ticket_collection():
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            if request.method == 'POST':
                data = request.get_json()
                new_id = str(uuid.uuid4())
                cur.execute(
                    """INSERT INTO MaintenanceTicket (id, unitID, description, isResolved)
                       VALUES (%s, %s, %s, %s)""",
                    (new_id, data.get('unitID'), data.get('description'),
                     data.get('isResolved', True))
                )
                conn.commit()
                clear_cache("ticket")
                return jsonify({"message": "Ticket created", "id": new_id}), 201

            cached_data = get_cache("ticket")
            if cached_data:
                return jsonify(cached_data), 200

            cur.execute("SELECT * FROM MaintenanceTicket")
            rows = [dict(row) for row in cur.fetchall()]
            create_cache("ticket", rows)
            return jsonify(rows), 200

    finally:
        conn.close()


@ticket_bp.route('/ticket/queue', methods=['GET'])
def ticket_queue():
    
    cached_data = get_cache("ticket_queue")
    if cached_data:
        return jsonify(cached_data), 200

    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM MaintenanceTicket")
            rows = [dict(row) for row in cur.fetchall()]

            sorted_tickets = sort_tickets(rows)

            create_cache("ticket_queue", sorted_tickets)
            return jsonify(sorted_tickets), 200
    finally:
        conn.close()


@ticket_bp.route('/ticket/<string:id>', methods=['GET', 'PUT', 'DELETE'])
def ticket_resource(id):
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            if request.method == 'GET':
                cache_key = f"ticket:{id}"
                cached_data = get_cache(cache_key)
                if cached_data:
                    return jsonify(cached_data), 200

                cur.execute("SELECT * FROM MaintenanceTicket WHERE id = %s", (id,))
                ticket = cur.fetchone()
                if not ticket:
                    return jsonify({"error": "Ticket not found"}), 404

                ticket = dict(ticket)
                create_cache(cache_key, ticket)
                return jsonify(ticket), 200

            elif request.method == 'PUT':
                data = request.get_json()
                cur.execute(
                    """UPDATE MaintenanceTicket SET unitID = %s, description = %s,
                     isResolved = %s WHERE id = %s""",
                    (data.get('unitID'), data.get('description'),
                    data.get('isResolved', False), id)
                )
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Ticket not found"}), 404
                clear_cache("ticket")
                clear_cache("ticket_queue")
                clear_cache(f"ticket:{id}")
                return jsonify({"message": "Ticket updated successfully"}), 200

            elif request.method == 'DELETE':
                cur.execute("DELETE FROM MaintenanceTicket WHERE id = %s", (id,))
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Ticket not found"}), 404
                clear_cache("ticket")
                clear_cache("ticket_queue")
                clear_cache(f"ticket:{id}")
                return jsonify({"message": "Ticket deleted successfully"}), 200

    finally:
        conn.close()