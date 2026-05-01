"""
Data Migration Script: CockroachDB → Aiven PostgreSQL

Connects to the old CockroachDB database and the new Aiven PostgreSQL database,
reads all rows from every table, and inserts them into Aiven.

Usage: python database/migrate_to_aiven.py
"""

import os
import sys
import psycopg2

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv

load_dotenv(override=True)

# --- Old CockroachDB credentials (hardcoded since .env now points to Aiven) ---
COCKROACH_CONFIG = {
    "user": "mukunzi",
    "password": "-Pvl3bMX2GMQ_OU_3M-wdQ",
    "host": "tusked-laika-24012.j77.aws-ap-south-1.cockroachlabs.cloud",
    "port": "26257",
    "dbname": "Acres",
    "sslmode": "require",
}

# Tables in dependency order (parents before children)
TABLES = [
    "appuser",
    "property",
    "unit",
    "tenant",
    "maintenanceticket",
    "communication",
    "communicationtemplate",
    "payment",
    "feedback",
]


def get_columns(cursor, table_name):
    """Get column names for a table."""
    cursor.execute(
        "SELECT column_name FROM information_schema.columns WHERE table_name = %s ORDER BY ordinal_position",
        (table_name,),
    )
    return [row[0] for row in cursor.fetchall()]


def migrate_table(src_conn, dst_conn, table_name):
    """Copy all rows from source to destination for a given table."""
    src_cur = src_conn.cursor()
    dst_cur = dst_conn.cursor()

    # Get columns from source
    columns = get_columns(src_cur, table_name)
    if not columns:
        print(f"  ⚠️  Table '{table_name}' not found in source — skipping.")
        return 0

    # Check if table exists in destination
    dst_columns = get_columns(dst_cur, table_name)
    if not dst_columns:
        print(f"  ⚠️  Table '{table_name}' not found in destination — skipping.")
        return 0

    # Use only columns that exist in both source and destination
    common_columns = [c for c in columns if c in dst_columns]
    col_list = ", ".join(f'"{c}"' for c in common_columns)
    placeholders = ", ".join(["%s"] * len(common_columns))

    # Read all rows from source
    src_cur.execute(f'SELECT {col_list} FROM "{table_name}"')
    rows = src_cur.fetchall()

    if not rows:
        print(f"  ℹ️  Table '{table_name}' is empty — nothing to migrate.")
        return 0

    # Insert into destination with conflict handling
    insert_sql = f'INSERT INTO "{table_name}" ({col_list}) VALUES ({placeholders}) ON CONFLICT DO NOTHING'

    inserted = 0
    for row in rows:
        try:
            dst_cur.execute(insert_sql, row)
            inserted += 1
        except Exception as e:
            dst_conn.rollback()
            print(f"  ❌ Error inserting row into '{table_name}': {e}")
            return inserted

    dst_conn.commit()
    print(f"  ✅ '{table_name}': {inserted}/{len(rows)} rows migrated.")
    return inserted


def main():
    print("=" * 60)
    print("  CockroachDB → Aiven PostgreSQL Data Migration")
    print("=" * 60)

    # Connect to CockroachDB (source)
    print("\n🔌 Connecting to CockroachDB (source)...")
    try:
        src_conn = psycopg2.connect(**COCKROACH_CONFIG)
        print("   ✅ Connected to CockroachDB.")
    except Exception as e:
        print(f"   ❌ Failed to connect to CockroachDB: {e}")
        return

    # Connect to Aiven (destination) using current .env
    print("🔌 Connecting to Aiven PostgreSQL (destination)...")
    try:
        from backend.utils.db import get_direct_connection

        dst_conn = get_direct_connection()
        print("   ✅ Connected to Aiven PostgreSQL.")
    except Exception as e:
        print(f"   ❌ Failed to connect to Aiven: {e}")
        src_conn.close()
        return

    # First, create the schema on Aiven
    print("\n📋 Creating schema on Aiven...")
    schema_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "schema.sql")
    try:
        with open(schema_file, "r") as f:
            schema_sql = f.read()
        with dst_conn.cursor() as cur:
            cur.execute(schema_sql)
        dst_conn.commit()
        print("   ✅ Schema created successfully.")
    except Exception as e:
        print(f"   ⚠️  Schema creation note: {e}")
        dst_conn.rollback()

    # Run the extra migration scripts' DDL inline (for columns/tables added after initial schema)
    print("\n📋 Applying additional migrations...")
    extra_ddl = [
        "ALTER TABLE AppUser ADD COLUMN IF NOT EXISTS isAdmin BOOLEAN DEFAULT FALSE;",
        "ALTER TABLE AppUser ADD COLUMN IF NOT EXISTS isSuspended BOOLEAN DEFAULT FALSE;",
        "ALTER TABLE AppUser ADD COLUMN IF NOT EXISTS lastLogin TIMESTAMP;",
        "ALTER TABLE Tenant ADD COLUMN IF NOT EXISTS chargingDay INTEGER DEFAULT NULL;",
        "ALTER TABLE Communication ADD COLUMN IF NOT EXISTS channel VARCHAR(10) DEFAULT 'email';",
        """CREATE TABLE IF NOT EXISTS CommunicationTemplate (
            id UUID PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            category VARCHAR(50) NOT NULL,
            color VARCHAR(100) DEFAULT 'bg-muted text-muted-foreground',
            body TEXT NOT NULL,
            userId UUID,
            isDeleted BOOLEAN DEFAULT FALSE,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_template_userId FOREIGN KEY (userId) REFERENCES AppUser (id) ON DELETE CASCADE
        );""",
        """CREATE TABLE IF NOT EXISTS Payment (
            id UUID PRIMARY KEY,
            tenantID UUID NOT NULL,
            amount BIGINT NOT NULL DEFAULT 0,
            paymentMethod VARCHAR(50) DEFAULT 'Manual',
            status VARCHAR(50) DEFAULT 'Paid',
            paidAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            userId UUID,
            isDeleted BOOLEAN DEFAULT FALSE,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_payment_tenantID FOREIGN KEY (tenantID) REFERENCES Tenant (id) ON DELETE CASCADE,
            CONSTRAINT fk_payment_userId FOREIGN KEY (userId) REFERENCES AppUser (id) ON DELETE CASCADE
        );""",
        """CREATE TABLE IF NOT EXISTS Feedback (
            id UUID PRIMARY KEY,
            userId UUID,
            type VARCHAR(20) CHECK (type IN ('BUG', 'FEATURE', 'GENERAL')) DEFAULT 'GENERAL',
            title VARCHAR(200) NOT NULL,
            description TEXT,
            severity VARCHAR(20) CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) DEFAULT 'MEDIUM',
            status VARCHAR(20) CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')) DEFAULT 'OPEN',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            isDeleted BOOLEAN DEFAULT FALSE,
            CONSTRAINT fk_feedback_userId FOREIGN KEY (userId) REFERENCES AppUser (id) ON DELETE CASCADE
        );""",
    ]
    with dst_conn.cursor() as cur:
        for ddl in extra_ddl:
            try:
                cur.execute(ddl)
            except Exception as e:
                dst_conn.rollback()
                print(f"   ⚠️  DDL note: {e}")
    dst_conn.commit()
    print("   ✅ Additional migrations applied.")

    # Migrate data table by table
    print("\n📦 Migrating data...\n")
    total = 0
    for table in TABLES:
        count = migrate_table(src_conn, dst_conn, table)
        total += count

    print(f"\n{'=' * 60}")
    print(f"  Migration complete! {total} total rows migrated.")
    print(f"{'=' * 60}")

    src_conn.close()
    dst_conn.close()


if __name__ == "__main__":
    main()
