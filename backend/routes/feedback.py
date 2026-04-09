from flask import Blueprint, request, jsonify
from psycopg2.extras import RealDictCursor
import uuid
from dsa.extras import get_cache, create_cache, clear_cache
from backend.utils.db import get_db_connection, release_db_connection
from backend.utils.auth_middleware import require_user, require_admin

feedback_bp = Blueprint('feedback_bp', __name__)


@feedback_bp.route('/feedback', methods=['GET', 'POST'])
@require_user
def feedback_collection():
    user_id = request.user_id
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            if request.method == 'POST':
                data = request.get_json()
                new_id = str(uuid.uuid4())
                cur.execute(
                    """INSERT INTO Feedback (id, userId, type, title, description, severity)
                       VALUES (%s, %s, %s, %s, %s, %s)""",
                    (
                        new_id,
                        user_id,
                        data.get('type', 'GENERAL'),
                        data['title'],
                        data.get('description', ''),
                        data.get('severity', 'MEDIUM'),
                    )
                )
                conn.commit()
                clear_cache(f"feedback:{user_id}")
                return jsonify({"message": "Feedback submitted successfully", "id": new_id}), 201

            # GET — user's own feedback
            cached = get_cache(f"feedback:{user_id}")
            if cached:
                return jsonify(cached), 200

            cur.execute(
                """SELECT id, type, title, description, severity, status, createdAt
                   FROM Feedback
                   WHERE userId = %s AND isDeleted = FALSE
                   ORDER BY createdAt DESC""",
                (user_id,)
            )
            rows = []
            for row in cur.fetchall():
                d = dict(row)
                if d.get('createdat'):
                    d['createdAt'] = d.pop('createdat').isoformat()
                elif d.get('createdAt'):
                    d['createdAt'] = d['createdAt'].isoformat()
                rows.append(d)
            create_cache(f"feedback:{user_id}", rows)
            return jsonify(rows), 200

    finally:
        release_db_connection(conn)


# ── Admin endpoints ─────────────────────────────────────────────────────────

@feedback_bp.route('/admin/feedback', methods=['GET'])
@require_admin
def admin_get_all_feedback():
    """Fetches all feedback/bug reports for the admin dashboard."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT
                    f.id, f.type, f.title, f.description, f.severity,
                    f.status, f.createdAt,
                    u.name as "submittedBy", u.email as "submitterEmail"
                FROM Feedback f
                LEFT JOIN AppUser u ON f.userId = u.id
                WHERE f.isDeleted = FALSE
                ORDER BY f.createdAt DESC
            """)
            rows = []
            for row in cur.fetchall():
                d = dict(row)
                if d.get('createdat'):
                    d['createdAt'] = d.pop('createdat').isoformat()
                elif d.get('createdAt'):
                    d['createdAt'] = d['createdAt'].isoformat()
                rows.append(d)
            return jsonify(rows), 200
    finally:
        release_db_connection(conn)


@feedback_bp.route('/admin/feedback/<string:id>', methods=['PATCH', 'DELETE'])
@require_admin
def admin_feedback_resource(id):
    """Admin: update status of feedback or soft-delete it."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:

            if request.method == 'PATCH':
                data = request.get_json()
                new_status = data.get('status')
                if new_status not in ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'):
                    return jsonify({"error": "Invalid status value"}), 400
                cur.execute(
                    "UPDATE Feedback SET status = %s WHERE id = %s AND isDeleted = FALSE",
                    (new_status, id)
                )
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Feedback not found"}), 404
                return jsonify({"message": f"Status updated to {new_status}"}), 200

            elif request.method == 'DELETE':
                cur.execute(
                    "UPDATE Feedback SET isDeleted = TRUE WHERE id = %s",
                    (id,)
                )
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Feedback not found"}), 404
                return jsonify({"message": "Feedback deleted"}), 200

    finally:
        release_db_connection(conn)
