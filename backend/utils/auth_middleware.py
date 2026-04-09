from functools import wraps
from flask import request, jsonify, current_app
import jwt

def require_user(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.cookies.get('jwt_token')
        
        if not token:
            # Fallback to Authorization header for flexibility
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
                
        if not token:
            return jsonify({"error": "Unauthorized. Missing token in cookies or headers."}), 401
        
        try:
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            user_id = payload.get("user_id")
            
            if not user_id:
                return jsonify({"error": "Unauthorized. Invalid token payload."}), 401
                
            from backend.utils.db import get_db_connection, release_db_connection
            conn = get_db_connection()
            try:
                with conn.cursor() as cur:
                    cur.execute("SELECT id, isSuspended FROM AppUser WHERE id = %s", (user_id,))
                    row = cur.fetchone()
                    if not row:
                        return jsonify({"error": "Unauthorized. User session invalidated."}), 401
                    if row[1]:
                        return jsonify({"error": "Forbidden. Account is suspended."}), 403
            finally:
                release_db_connection(conn)
                
            # Attach user_id securely to the request directly
            request.user_id = user_id
            
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Unauthorized. Token has expired."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Unauthorized. Invalid token."}), 401
            
        return f(*args, **kwargs)
    return decorated_function


def require_admin(f):
    """Decorator that checks if the logged-in user has admin privileges."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.cookies.get('jwt_token')

        if not token:
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"error": "Unauthorized. Missing token."}), 401

        try:
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            user_id = payload.get("user_id")

            if not user_id:
                return jsonify({"error": "Unauthorized. Invalid token payload."}), 401

            from backend.utils.db import get_db_connection, release_db_connection
            conn = get_db_connection()
            try:
                with conn.cursor() as cur:
                    cur.execute("SELECT id, isAdmin, isSuspended FROM AppUser WHERE id = %s", (user_id,))
                    row = cur.fetchone()
                    if not row:
                        return jsonify({"error": "Unauthorized. User not found."}), 401
                    if row[2]:
                        return jsonify({"error": "Forbidden. Account is suspended."}), 403
                    if not row[1]:
                        return jsonify({"error": "Forbidden. Admin access required."}), 403
            finally:
                release_db_connection(conn)

            request.user_id = user_id

        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Unauthorized. Token has expired."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Unauthorized. Invalid token."}), 401

        return f(*args, **kwargs)
    return decorated_function
