from flask import Blueprint, request, jsonify
from psycopg2.extras import RealDictCursor
import uuid
import os
import resend
from dsa.extras import get_cache, create_cache, clear_cache
from backend.utils.db import get_db_connection
from backend.utils.auth_middleware import require_user

# Initialize Resend
resend.api_key = os.environ.get("RESEND_API_KEY")

#COMMUNICATION ENDPOINTS
#creating a blueprint for communication routes
communication_bp = Blueprint('communication_bp', __name__)


#registering the blueprint with the main app
@communication_bp.route('/communication', methods=['GET', 'POST'])
@require_user
def communication_collection():
    user_id = request.user_id
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            if request.method == 'POST':
                data = request.get_json()
                new_id = str(uuid.uuid4())
                tenant_id = data.get('tenantID')
                
                # Insert communication record into database
                cur.execute(
                    "INSERT INTO Communication (id, tenantID, unitID, title, body, userId) VALUES (%s, %s, %s, %s, %s, %s)",
                    (new_id, tenant_id, data.get('unitID'), data['title'], data.get('body'), user_id)
                )
                
                # Fetch tenant email and send message via Resend
                if tenant_id:
                    cur.execute("SELECT email FROM Tenant WHERE id = %s", (tenant_id,))
                    tenant = cur.fetchone()
                    
                    if tenant and tenant['email']:
                        try:
                            # Send email to the tenant
                            resend.Emails.send({
                                "from": "Acres <onboarding@resend.dev>",
                                "to": [tenant['email']],
                                "subject": data['title'],
                                "html": f"<p>{data.get('body')}</p>"
                            })
                        except Exception as e:
                            # Catch error to avoid disrupting the request if email fails
                            print(f"Failed to send email: {e}")
                
                conn.commit()
                clear_cache(f"communication:{user_id}")
                return jsonify({"message": "Communication logged", "id": new_id}), 201

            cached_data = get_cache(f"communication:{user_id}")
            if cached_data:
                return jsonify(cached_data), 200

            cur.execute("SELECT id, title, body as message FROM Communication WHERE userId = %s", (user_id,))
            rows = [dict(row) for row in cur.fetchall()]
            create_cache(f"communication:{user_id}", rows)
            return jsonify(rows), 200

    finally:
        conn.close()


@communication_bp.route('/communication/<string:id>', methods=['GET', 'PUT', 'DELETE'])
@require_user
def communication_resource(id):
    user_id = request.user_id
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            if request.method == 'GET':
                cache_key = f"communication:{id}:{user_id}"
                cached_data = get_cache(cache_key)
                if cached_data:
                    return jsonify(cached_data), 200

                cur.execute("SELECT id, title, body as message FROM Communication WHERE id = %s AND userId = %s", (id, user_id))
                comm = cur.fetchone()
                if not comm:
                    return jsonify({"error": "Communication not found"}), 404

                comm = dict(comm)
                create_cache(cache_key, comm)
                return jsonify(comm), 200

            elif request.method == 'PUT':
                data = request.get_json()
                cur.execute(
                    "UPDATE Communication SET tenantID = %s, title = %s, body = %s WHERE id = %s AND userId = %s",
                    (data.get('tenantID'), data['title'], data.get('body'), id, user_id)
                )
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Communication not found or unauthorized"}), 404
                clear_cache(f"communication:{user_id}")
                clear_cache(f"communication:{id}:{user_id}")
                return jsonify({"message": "Communication updated successfully"}), 200

            elif request.method == 'DELETE':
                cur.execute("DELETE FROM Communication WHERE id = %s AND userId = %s", (id, user_id))
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Communication not found or unauthorized"}), 404
                clear_cache(f"communication:{user_id}")
                clear_cache(f"communication:{id}:{user_id}")
                return jsonify({"message": "Communication deleted successfully"}), 200

    finally:
        conn.close()
