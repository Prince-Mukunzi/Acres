import jwt
import os
import requests
from datetime import datetime, timedelta, timezone
from collections import defaultdict
from flask import Blueprint, request, jsonify

auth_bp = Blueprint('auth_bp', __name__)

SECRET_KEY = os.getenv('SECRET_KEY')

# Rate limiting: track login attempts per IP address
login_attempts = defaultdict(list)
MAX_ATTEMPTS = 3
WINDOW_SECONDS = 3600  # 1 hour


def is_rate_limited(ip):
    now = datetime.now(timezone.utc)
    window_start = now - timedelta(seconds=WINDOW_SECONDS)
    login_attempts[ip] = [t for t in login_attempts[ip] if t > window_start]
    if len(login_attempts[ip]) >= MAX_ATTEMPTS:
        return True
    login_attempts[ip].append(now)
    return False


def verify_google_token(access_token):
    response = requests.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    if response.status_code != 200:
        raise ValueError("Invalid Google token")
    info = response.json()
    return info['sub'], info['email'], info.get('name'), info.get('picture')


def create_access_token(user_id):
    payload = {
        'sub': str(user_id),
        'iat': datetime.now(timezone.utc),
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')


@auth_bp.route('/auth/login', methods=['POST'])
def login_or_signup():
    ip = request.remote_addr
    if is_rate_limited(ip):
        return jsonify({"error": "Too many login attempts. Please try again in an hour."}), 429

    data = request.json
    token = data.get('token')
    if not token:
        return jsonify({"error": "token is required"}), 400

    try:
        p_uid, email, name, picture = verify_google_token(token)
    except Exception as e:
        return jsonify({"error": "Invalid token", "details": str(e)}), 401

    app_token = create_access_token(p_uid)
    return jsonify({
        "token": app_token,
        "user": {"name": name, "email": email, "picture": picture}
    }), 200
