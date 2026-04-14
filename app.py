import os
from flask import Flask
from dotenv import load_dotenv
from flask_cors import CORS

from backend.routes.property import property_bp
from backend.routes.unit import unit_bp
from backend.routes.tenant import tenant_bp
from backend.routes.ticket import ticket_bp
from backend.routes.communication import communication_bp
from backend.routes.stats import stats_bp
from backend.routes.auth import auth_bp
from backend.routes.admin import admin_bp
from backend.routes.feedback import feedback_bp
from backend.routes.payment import payment_bp
from backend.routes.pindo import pindo_bp
from backend.routes.seed import seed_bp

# load environment variables overriding existing ones to prevent sticky terminal state
load_dotenv(override=True)

# Initialize flask
app = Flask(__name__)
# Handle dynamic frontends via CORS environment variable (e.g. "https://acres.vercel.app,http://localhost:5173")
cors_origins = os.getenv('FRONTEND_URLS', 'http://localhost:5173,http://127.0.0.1:5173').split(',')
CORS(app, supports_credentials=True, origins=cors_origins)
# Use secure random key if environment variable is missing
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY') or os.getenv('AUTH_SECRET') or os.urandom(24).hex()

# Initialize Rate Limiter
from backend.utils.limiter import limiter
limiter.init_app(app)

api_version = '/api/v1'


# blueprints with the url_prefix
app.register_blueprint(property_bp, url_prefix=api_version)
app.register_blueprint(unit_bp, url_prefix=api_version)
app.register_blueprint(tenant_bp, url_prefix=api_version)
app.register_blueprint(ticket_bp, url_prefix=api_version)
app.register_blueprint(communication_bp, url_prefix=api_version)
app.register_blueprint(stats_bp, url_prefix=api_version)
app.register_blueprint(auth_bp, url_prefix=api_version)
app.register_blueprint(seed_bp, url_prefix=api_version)
app.register_blueprint(admin_bp, url_prefix=api_version)
app.register_blueprint(feedback_bp, url_prefix=api_version)
app.register_blueprint(payment_bp, url_prefix=api_version)
app.register_blueprint(pindo_bp, url_prefix=api_version)

# Start background jobs
from backend.utils.scheduler import start_scheduler
start_scheduler()

if __name__ == '__main__':
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(debug=debug_mode, port=5001)
