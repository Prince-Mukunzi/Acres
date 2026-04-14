import os
import requests
from flask import Blueprint, request, jsonify

pindo_bp = Blueprint('pindo', __name__)

PINDO_API_URL = "https://api.pindo.io/v1/sms/"
PINDO_TOKEN = os.getenv("PINDO_TOKEN", "")

def send_sms(to_number, text):
    if not PINDO_TOKEN:
        print("PINDO_TOKEN is missing. SMS not sent.")
        return False
        
    headers = {
        'Authorization': f'Bearer {PINDO_TOKEN}',
        'Content-Type': 'application/json'
    }
    payload = {
        "to": to_number,
        "text": text,
        "sender": "Pindo"
    }

    try:
        response = requests.post(PINDO_API_URL, json=payload, headers=headers, timeout=5)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Failed to send SMS via Pindo: {str(e)}")
        return False

@pindo_bp.route('/pindo/dlr', methods=['POST'])
def handle_dlr():
    # Intended to be bound in the Pindo Webhook dashboard
    # https://app.pindo.io -> Configurations -> DLR SMS Webhook URL
    data = request.get_json()
    print(f"Pindo DLR Webhook Received: {data}")
    # E.g. { "status": "DELIVRD", "sms_id": 1058918, "modified_at": "...", "retries_count": 0 }
    return jsonify({"message": "DLR received"}), 200

@pindo_bp.route('/pindo/outbound/callback', methods=['POST'])
def handle_outbound_callback():
    # Intended to be bound in the Pindo Sender ID webhook URL
    data = request.get_json()
    print(f"Pindo Outbound Webhook Received: {data}")
    return jsonify({"message": "Outbound received"}), 200
