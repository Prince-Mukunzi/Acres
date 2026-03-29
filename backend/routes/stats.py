from flask import Blueprint, jsonify
from psycopg2.extras import RealDictCursor
from dsa.extras import get_cache, create_cache, clear_cache
from backend.utils.db import get_db_connection
from backend.utils.auth_middleware import require_user
from flask import request

stats_bp = Blueprint('stats_bp', __name__)

@stats_bp.route('/stats', methods=['GET'])
@require_user
def get_dashboard_stats():
    user_id = request.user_id
    cache_key = f"dashboard_stats:{user_id}"
    cached_data = get_cache(cache_key)
    if cached_data:
        return jsonify(cached_data), 200

    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Get total units
            cur.execute("SELECT COUNT(id) as total_units FROM Unit WHERE userId = %s", (user_id,))
            total_units = cur.fetchone()['total_units'] or 0

            # Get total tenants
            cur.execute("SELECT COUNT(id) as total_tenants FROM Tenant WHERE userId = %s", (user_id,))
            total_tenants = cur.fetchone()['total_tenants'] or 0

            # Calculate collected (sum of rentAmount for PAID tenants)
            # Since we don't have a payments table, we'll mock this by assuming 
            # some tenants are paid and some are overdue. Or we can just sum
            # rentAmount for occupied units. Let's sum rentAmount for occupied units as 'collected' mock
            cur.execute("""
                SELECT SUM(rentAmount) as collected 
                FROM Unit 
                WHERE unitStatus = 'OCCUPIED' AND userId = %s
            """, (user_id,))
            collected_val = cur.fetchone()['collected'] or 0
            
            # Format collected
            collected = f"RWF {collected_val:,.0f}"

            # Calculate overdue amount: sum rentAmount of units whose tenant is OVERDUE
            cur.execute("""
                SELECT SUM(u.rentAmount) as overdue_total
                FROM Tenant t
                JOIN Unit u ON t.unitID = u.id
                WHERE t.status = 'OVERDUE' AND t.userId = %s
            """, (user_id,))
            overdue_val = cur.fetchone()['overdue_total'] or 0
            overdue = f"RWF {overdue_val:,.0f}"

            stats = {
                "totalUnits": total_units,
                "totalTenants": total_tenants,
                "collected": collected,
                "overdue": overdue
            }

            create_cache(cache_key, stats)
            return jsonify(stats), 200
    finally:
        conn.close()


@stats_bp.route('/stats/chart', methods=['GET'])
@require_user
def get_chart_stats():
    """Returns occupied and vacant unit counts for the pie chart."""
    user_id = request.user_id
    cache_key = f"chart_stats:{user_id}"
    cached_data = get_cache(cache_key)
    if cached_data:
        return jsonify(cached_data), 200

    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT 
                    COUNT(CASE WHEN unitStatus = 'OCCUPIED' THEN 1 END) as occupied,
                    COUNT(CASE WHEN unitStatus = 'VACANT' THEN 1 END) as vacant
                FROM Unit
                WHERE userId = %s
            """, (user_id,))
            result = cur.fetchone()
            chart_data = {
                "occupied": result['occupied'] or 0,
                "vacant": result['vacant'] or 0
            }
            create_cache(cache_key, chart_data)
            return jsonify(chart_data), 200
    finally:
        conn.close()
