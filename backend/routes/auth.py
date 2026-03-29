from flask import Blueprint, request, jsonify, current_app
from psycopg2.extras import RealDictCursor
from backend.utils.db import get_db_connection
import uuid
import jwt
import datetime

auth_bp = Blueprint('auth_bp', __name__)


@auth_bp.route('/auth/google', methods=['POST'])
def google_auth():
    """Upsert a user after Google OAuth login."""
    data = request.get_json()
    name = data.get('name', 'User')
    email = data.get('email')
    picture = data.get('picture')

    if not email:
        return jsonify({"error": "Email is required"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Check if user exists
            cur.execute("SELECT * FROM AppUser WHERE email = %s", (email,))
            existing = cur.fetchone()

            if existing:
                # Update last login
                cur.execute(
                    "UPDATE AppUser SET lastLogin = CURRENT_TIMESTAMP, name = %s, picture = %s WHERE email = %s",
                    (name, picture, email)
                )
                conn.commit()
                user = dict(existing)
                user['name'] = name
                user['picture'] = picture
                
                # Generate JWT
                token = jwt.encode(
                    {
                        "user_id": user['id'],
                        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
                    },
                    current_app.config['SECRET_KEY'],
                    algorithm="HS256"
                )
                
                return jsonify({"message": "Login successful", "user": user, "token": token}), 200
            else:
                # Create new user
                new_id = str(uuid.uuid4())
                cur.execute(
                    """INSERT INTO AppUser (id, name, email, picture, provider) 
                       VALUES (%s, %s, %s, %s, 'google')""",
                    (new_id, name, email, picture)
                )
                conn.commit()
                
                user = {"id": new_id, "name": name, "email": email, "picture": picture}
                token = jwt.encode(
                    {
                        "user_id": new_id,
                        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
                    },
                    current_app.config['SECRET_KEY'],
                    algorithm="HS256"
                )
                
                return jsonify({
                    "message": "User created",
                    "user": user,
                    "token": token
                }), 201
    finally:
        conn.close()
