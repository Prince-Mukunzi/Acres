from flask import Blueprint, request, jsonify, current_app
from psycopg2.extras import RealDictCursor
from backend.utils.db import get_db_connection, release_db_connection
from backend.utils.email_renderer import render_email
import uuid
import os
import jwt
import resend
import threading
from datetime import datetime, timedelta, timezone
from backend.utils.limiter import limiter

resend.api_key = os.environ.get("RESEND_API_KEY")

auth_bp = Blueprint('auth_bp', __name__)


@auth_bp.route('/auth/google', methods=['POST'])
@limiter.limit("5 per minute")
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
                user['isAdmin'] = existing.get('isadmin', False)
                
                # Generate JWT
                token = jwt.encode(
                    {
                        "user_id": user['id'],
                        "exp": datetime.now(timezone.utc) + timedelta(days=1)
                    },
                    current_app.config['SECRET_KEY'],
                    algorithm="HS256"
                )
                
                resp = jsonify({"message": "Login successful", "user": user, "token": token})
                resp.set_cookie('jwt_token', token, httponly=True, secure=True, samesite='None', max_age=24*60*60)
                return resp, 200
            else:
                # Create new user
                new_id = str(uuid.uuid4())
                is_admin_flag = True if email == 'princemukunzi11@gmail.com' else False
                
                cur.execute(
                    """INSERT INTO AppUser (id, name, email, picture, provider, isAdmin) 
                       VALUES (%s, %s, %s, %s, 'google', %s)""",
                    (new_id, name, email, picture, is_admin_flag)
                )
                conn.commit()

                # Send welcome email asynchronously
                welcome_html = render_email("WelcomeLandlord", USER_NAME=name)
                def send_welcome_email():
                    try:
                        resend.Emails.send({
                            "from": "Acres <onboarding@resend.dev>",
                            "to": [email],
                            "subject": f"Welcome to Acres, {name.split()[0] if name else 'there'}!",
                            "html": welcome_html,
                        })
                    except Exception as e:
                        print(f"Failed to send welcome email to {email}: {e}")
                threading.Thread(target=send_welcome_email).start()

                user = {"id": new_id, "name": name, "email": email, "picture": picture, "isAdmin": is_admin_flag}
                token = jwt.encode(
                    {
                        "user_id": new_id,
                        "exp": datetime.now(timezone.utc) + timedelta(days=1)
                    },
                    current_app.config['SECRET_KEY'],
                    algorithm="HS256"
                )
                
                resp = jsonify({"message": "User created", "user": user, "token": token})
                resp.set_cookie('jwt_token', token, httponly=True, secure=True, samesite='None', max_age=24*60*60)
                return resp, 201
    finally:
        release_db_connection(conn)


@auth_bp.route('/auth/profile', methods=['PATCH'])
@limiter.limit("10 per minute")
def update_profile():
    """Update the logged-in user's display name."""
    from backend.utils.auth_middleware import require_user
    token = request.cookies.get('jwt_token') or request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
        user_id = payload['user_id']
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    data = request.get_json()
    new_name = data.get('name', '').strip()
    if not new_name:
        return jsonify({"error": "Name is required"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("UPDATE AppUser SET name = %s WHERE id = %s RETURNING id, name, email, picture, isAdmin", (new_name, user_id))
            updated = cur.fetchone()
            conn.commit()
            if not updated:
                return jsonify({"error": "User not found"}), 404
            return jsonify({"message": "Profile updated", "user": dict(updated)}), 200
    finally:
        release_db_connection(conn)


@auth_bp.route('/auth/logout', methods=['POST'])
@limiter.limit("10 per minute")
def logout():
    """Clear the JWT cookie to log the user out."""
    resp = jsonify({"message": "Logout successful"})
    # Setting max_age=0 and expires=0 clears the cookie
    resp.set_cookie('jwt_token', '', httponly=True, secure=True, samesite='None', expires=0, max_age=0)
    return resp, 200
