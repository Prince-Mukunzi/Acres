from functools import wraps
from flask import request, jsonify, current_app
import jwt

def require_user(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Unauthorized. Missing or invalid Authorization header."}), 401
            
        token = auth_header.split(" ")[1]
        
        try:
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            user_id = payload.get("user_id")
            
            if not user_id:
                return jsonify({"error": "Unauthorized. Invalid token payload."}), 401
                
            from backend.utils.db import get_db_connection
            conn = get_db_connection()
            try:
                with conn.cursor() as cur:
                    cur.execute("SELECT id FROM AppUser WHERE id = %s", (user_id,))
                    if not cur.fetchone():
                        return jsonify({"error": "Unauthorized. User session invalidated."}), 401
            finally:
                conn.close()
                
            # Attach user_id securely to the request directly
            request.user_id = user_id
            
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Unauthorized. Token has expired."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Unauthorized. Invalid token."}), 401
            
        return f(*args, **kwargs)
    return decorated_function
