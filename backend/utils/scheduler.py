import os
from apscheduler.schedulers.background import BackgroundScheduler
import resend
from psycopg2.extras import RealDictCursor
from backend.utils.db import get_db_connection, release_db_connection
from backend.utils.email_renderer import render_email

def check_overdue_tenants():
    """Finds overdue tenants and sends an automated reminder email."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT email, firstName, lastName FROM Tenant WHERE status = 'OVERDUE' AND isDeleted = FALSE")
            tenants = cur.fetchall()
            
            for t in tenants:
                if t['email']:
                    try:
                        tenant_name = f"{t['firstname']} {t['lastname']}".strip()
                        resend.Emails.send({
                            "from": "Acres <onboarding@resend.dev>",
                            "to": [t['email']],
                            "subject": "Acres: Overdue Rent Reminder",
                            "html": render_email("RentReminder", TENANT_NAME=tenant_name),
                        })
                    except Exception as e:
                        print(f"Failed to send overdue reminder to {t['email']}: {e}")
    except Exception as e:
        print(f"Scheduled job error: {e}")
    finally:
        release_db_connection(conn)

def start_scheduler():
    scheduler = BackgroundScheduler()
    # Runs everyday at 9:00 AM
    scheduler.add_job(func=check_overdue_tenants, trigger="cron", hour=9, minute=0)
    scheduler.start()
