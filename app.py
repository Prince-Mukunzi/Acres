import os
from flask import Flask
from dotenv import load_dotenv

from backend.routes.property import property_bp
from backend.routes.unit import unit_bp
from backend.routes.tenant import tenant_bp
from backend.routes.ticket import ticket_bp
from backend.routes.communication import communication_bp
from backend.routes.login import auth_bp

# load environment variables
load_dotenv()

# Initialize flask
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

api_version = '/api/v1'


# blueprints with the url_prefix
app.register_blueprint(property_bp, url_prefix=api_version)
app.register_blueprint(unit_bp, url_prefix=api_version)
app.register_blueprint(tenant_bp, url_prefix=api_version)
app.register_blueprint(ticket_bp, url_prefix=api_version)
app.register_blueprint(communication_bp, url_prefix=api_version)
app.register_blueprint(auth_bp, url_prefix=api_version)


if __name__ == '__main__':
    app.run(debug=True)
