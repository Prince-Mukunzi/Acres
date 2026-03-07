import os
import uuid
from datetime import datetime, date
import psycopg2
from psycopg2.extras import RealDictCursor
from flask import Flask, request, jsonify
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

# DATABASE CONNECTION
def get_db_connection():
    """Establishes and returns a connection to CockroachDB."""
    return psycopg2.connect(
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASS'),
        host=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT'),
        dbname=os.getenv('DB_NAME')
        #sslmode='require'
    )

# PROPERTY ENDPOINTS
@app.route('/property', methods=['GET', 'POST'])
def property_collection():
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if request.method == 'POST':
                data = request.get_json()
                new_id = str(uuid.uuid4())
                cur.execute(
                    "INSERT INTO Property (id, name, address) VALUES (%s, %s, %s)",
                    (new_id, data['name'], data.get('address'))
                )
                conn.commit()
                return jsonify({"message": "Property created", "id": new_id}), 201
            
            cur.execute("SELECT * FROM Property")
            return jsonify(cur.fetchall()), 200
    finally:
        conn.close()

@app.route('/property/<string:id>', methods=['GET', 'PUT', 'DELETE'])
def property_resource(id):
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if request.method == 'GET':
                cur.execute("SELECT * FROM Property WHERE id = %s", (id,))
                prop = cur.fetchone()
                return jsonify(prop) if prop else (jsonify({"error": "Property not found"}), 404)

            elif request.method == 'PUT':
                data = request.get_json()
                cur.execute(
                    """UPDATE Property SET name = %s, address = %s, updatedAt = CURRENT_TIMESTAMP 
                       WHERE id = %s""",
                    (data['name'], data.get('address'), id)
                )
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Property not found"}), 404
                return jsonify({"message": "Property updated successfully"}), 200

            elif request.method == 'DELETE':
                cur.execute("DELETE FROM Property WHERE id = %s", (id,))
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Property not found"}), 404
                return jsonify({"message": "Property deleted successfully"}), 200
    finally:
        conn.close()

# UNITS ENDPOINTS
@app.route('/unit', methods=['GET', 'POST'])
def unit_collection():
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if request.method == 'POST':
                data = request.get_json()
                new_id = str(uuid.uuid4())
                cur.execute(
                    """INSERT INTO Unit (id, unitName, rentAmount, unitStatus, propertyId) 
                       VALUES (%s, %s, %s, %s, %s)""",
                    (new_id, data['unitName'], data.get('rentAmount'), 
                     data.get('unitStatus', 'VACANT'), data.get('propertyId'))
                )
                conn.commit()
                return jsonify({"message": "Unit created", "id": new_id}), 201

            cur.execute("SELECT * FROM Unit")
            return jsonify(cur.fetchall()), 200
    finally:
        conn.close()

@app.route('/unit/<string:id>', methods=['GET', 'PUT', 'DELETE'])
def unit_resource(id):
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if request.method == 'GET':
                cur.execute("SELECT * FROM Unit WHERE id = %s", (id,))
                unit = cur.fetchone()
                return jsonify(unit) if unit else (jsonify({"error": "Unit not found"}), 404)

            elif request.method == 'PUT':
                data = request.get_json()
                cur.execute(
                    """UPDATE Unit SET unitName = %s, rentAmount = %s, unitStatus = %s, propertyId = %s 
                       WHERE id = %s""",
                    (data['unitName'], data.get('rentAmount'), data.get('unitStatus', 'VACANT'), 
                     data.get('propertyId'), id)
                )
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Unit not found"}), 404
                return jsonify({"message": "Unit updated successfully"}), 200

            elif request.method == 'DELETE':
                cur.execute("DELETE FROM Unit WHERE id = %s", (id,))
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Unit not found"}), 404
                return jsonify({"message": "Unit deleted successfully"}), 200
    finally:
        conn.close()

# TENANTS ENDPOINTS
@app.route('/tenant', methods=['GET', 'POST'])
def tenant_collection():
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if request.method == 'POST':
                data = request.get_json()
                new_id = str(uuid.uuid4())
                start_date = data.get('leaseStartDate', date.today().isoformat())
                end_date = data.get('leaseEndDate', date.today().isoformat())

                cur.execute(
                    """INSERT INTO Tenant (id, firstName, lastName, phoneNumber, unitID, leaseStartDate, leaseEndDate) 
                       VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                    (new_id, data['firstName'], data['lastName'], data.get('phoneNumber'), 
                     data.get('unitID'), start_date, end_date)
                )
                conn.commit()
                return jsonify({"message": "Tenant created", "id": new_id}), 201

            cur.execute("SELECT * FROM Tenant")
            return jsonify(cur.fetchall()), 200
    finally:
        conn.close()

@app.route('/tenant/<string:id>', methods=['GET', 'PUT', 'DELETE'])
def tenant_resource(id):
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if request.method == 'GET':
                cur.execute("SELECT * FROM Tenant WHERE id = %s", (id,))
                tenant = cur.fetchone()
                return jsonify(tenant) if tenant else (jsonify({"error": "Tenant not found"}), 404)

            elif request.method == 'PUT':
                data = request.get_json()
                start_date = data.get('leaseStartDate', date.today().isoformat())
                end_date = data.get('leaseEndDate', date.today().isoformat())

                cur.execute(
                    """UPDATE Tenant SET firstName = %s, lastName = %s, phoneNumber = %s, 
                       unitID = %s, leaseStartDate = %s, leaseEndDate = %s WHERE id = %s""",
                    (data['firstName'], data['lastName'], data.get('phoneNumber'), 
                     data.get('unitID'), start_date, end_date, id)
                )
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Tenant not found"}), 404
                return jsonify({"message": "Tenant updated successfully"}), 200

            elif request.method == 'DELETE':
                cur.execute("DELETE FROM Tenant WHERE id = %s", (id,))
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Tenant not found"}), 404
                return jsonify({"message": "Tenant deleted successfully"}), 200
    finally:
        conn.close()

# MAINTENANCE TICKET ENDPOINTS
@app.route('/ticket', methods=['GET', 'POST'])
def ticket_collection():
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if request.method == 'POST':
                data = request.get_json()
                new_id = str(uuid.uuid4())
                cur.execute(
                    """INSERT INTO MaintenanceTicket (id, unitID, title, description, status, isResolved) 
                       VALUES (%s, %s, %s, %s, %s, %s)""",
                    (new_id, data.get('unitID'), data['title'], data.get('description'), 
                     data.get('status', 'RECEIVED'), data.get('isResolved', True))
                )
                conn.commit()
                return jsonify({"message": "Ticket created", "id": new_id}), 201

            cur.execute("SELECT * FROM MaintenanceTicket")
            return jsonify(cur.fetchall()), 200
    finally:
        conn.close()

@app.route('/ticket/<string:id>', methods=['GET', 'PUT', 'DELETE'])
def ticket_resource(id):
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if request.method == 'GET':
                cur.execute("SELECT * FROM MaintenanceTicket WHERE id = %s", (id,))
                ticket = cur.fetchone()
                return jsonify(ticket) if ticket else (jsonify({"error": "Ticket not found"}), 404)

            elif request.method == 'PUT':
                data = request.get_json()
                cur.execute(
                    """UPDATE MaintenanceTicket SET unitID = %s, title = %s, description = %s, 
                       status = %s, isResolved = %s WHERE id = %s""",
                    (data.get('unitID'), data['title'], data.get('description'), 
                     data.get('status', 'RECEIVED'), data.get('isResolved', True), id)
                )
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Ticket not found"}), 404
                return jsonify({"message": "Ticket updated successfully"}), 200

            elif request.method == 'DELETE':
                cur.execute("DELETE FROM MaintenanceTicket WHERE id = %s", (id,))
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Ticket not found"}), 404
                return jsonify({"message": "Ticket deleted successfully"}), 200
    finally:
        conn.close()

# COMMUNICATIONS ENDPOINTS
@app.route('/communication', methods=['GET', 'POST'])
def communication_collection():
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if request.method == 'POST':
                data = request.get_json()
                new_id = str(uuid.uuid4())
                cur.execute(
                    """INSERT INTO Communication (id, tenantID, title, body) 
                       VALUES (%s, %s, %s, %s)""",
                    (new_id, data.get('tenantID'), data['title'], data.get('body'))
                )
                conn.commit()
                return jsonify({"message": "Communication logged", "id": new_id}), 201

            cur.execute("SELECT * FROM Communication")
            return jsonify(cur.fetchall()), 200
    finally:
        conn.close()

@app.route('/communication/<string:id>', methods=['GET', 'PUT', 'DELETE'])
def communication_resource(id):
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if request.method == 'GET':
                cur.execute("SELECT * FROM Communication WHERE id = %s", (id,))
                comm = cur.fetchone()
                return jsonify(comm) if comm else (jsonify({"error": "Communication not found"}), 404)

            elif request.method == 'PUT':
                data = request.get_json()
                cur.execute(
                    """UPDATE Communication SET tenantID = %s, title = %s, body = %s 
                       WHERE id = %s""",
                    (data.get('tenantID'), data['title'], data.get('body'), id)
                )
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Communication not found"}), 404
                return jsonify({"message": "Communication updated successfully"}), 200

            elif request.method == 'DELETE':
                cur.execute("DELETE FROM Communication WHERE id = %s", (id,))
                conn.commit()
                if cur.rowcount == 0:
                    return jsonify({"error": "Communication not found"}), 404
                return jsonify({"message": "Communication deleted successfully"}), 200
    finally:
        conn.close()

# Run App
if __name__ == '__main__':
    app.run(debug=True)