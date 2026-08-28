import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'ekyc_app.db')
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 1. Create otps table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS otps (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp_hash VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        is_used BOOLEAN DEFAULT 0 NOT NULL,
        attempt_count INTEGER DEFAULT 0 NOT NULL,
        created_at DATETIME NOT NULL
    );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS ix_otps_email ON otps(email);")
    print("otps table created or verified.")

    # 2. Check users table
    cursor.execute("PRAGMA table_info(users);")
    existing_cols = [row[1] for row in cursor.fetchall()]
    print("Users table columns:", existing_cols)

    conn.commit()
    conn.close()
    print("Database migration for Email OTP schema completed successfully!")
else:
    print("Database file does not exist yet.")
