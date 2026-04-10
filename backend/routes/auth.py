from flask import Blueprint, request, jsonify, current_app
from psycopg2.extras import RealDictCursor
from backend.utils.db import get_db_connection, release_db_connection
from backend.utils.email_templates import welcome_user_template
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
                        "exp": datetime.now(timezone.utc) + timedelta(days=7)
                    },
                    current_app.config['SECRET_KEY'],
                    algorithm="HS256"
                )
                
                resp = jsonify({"message": "Login successful", "user": user, "token": token})
                resp.set_cookie('jwt_token', token, httponly=True, secure=True, samesite='None', max_age=7*24*60*60)
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
                welcome_html = welcome_user_template(user_name=name)
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
                        "exp": datetime.now(timezone.utc) + timedelta(days=7)
                    },
                    current_app.config['SECRET_KEY'],
                    algorithm="HS256"
                )
                
                resp = jsonify({"message": "User created", "user": user, "token": token})
                resp.set_cookie('jwt_token', token, httponly=True, secure=True, samesite='None', max_age=7*24*60*60)
                return resp, 201
    finally:
        release_db_connection(conn)
