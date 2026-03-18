import jwt  # pip install PyJWT
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token


@app.route('/api/auth/login', methods=['POST'])
def login_or_signup():
    data = request.json
    token = data.get('token')
    provider = data.get('provider')

    # 1. Validate Token
    p_uid, email, name, avatar = verify_token(token, provider)

    # 2. Find Identity
    identity = Identity.query.filter_by(
        provider=provider, provider_user_id=p_uid).first()

    if not identity:
        # 3. Handle New Identity (Check if user exists by email)
        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(email=email, name=name, avatar=avatar)
            db.session.add(user)
            db.session.flush()  # Populate user.id

        identity = Identity(
            user_id=user.id, provider=provider, provider_user_id=p_uid)
        db.session.add(identity)
    else:
        user = identity.user

    db.session.commit()

    # 4. Return your OWN system's JWT
    # (Don't use Google's token for your app session)
    app_token = create_access_token(identity=str(user.id))
    return jsonify({"token": app_token, "user": {"name": user.name, "email": user.email}})


def verify_token(token, provider):
    if provider == 'google':
        # Verify Google ID Token
        idinfo = id_token.verify_oauth2_token(
            token, google_requests.Request(), GOOGLE_CLIENT_ID)
        return idinfo['sub'], idinfo['email'], idinfo.get('name'), idinfo.get('picture')

    elif provider == 'microsoft':
        # Verify Microsoft ID Token (Requires decoding and validating Apple/MS public keys)
        # For an MVP, you can decode the JWT, but in production use a library like 'msal'
        decoded = jwt.decode(
            token, options={"verify_signature": False})  # simplified
        return decoded['sub'], decoded.get('email') or decoded.get('preferred_username'), decoded.get('name'), None
