import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'ekyc_app.db')
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute('PRAGMA table_info(users);')
    existing_cols = [row[1] for row in cursor.fetchall()]
    print('Existing user columns:', existing_cols)

    new_cols = [
        ('google_id', 'VARCHAR(255)'),
        ('profile_picture', 'VARCHAR(500)'),
        ('auth_provider', "VARCHAR(50) DEFAULT 'EMAIL'"),
        ('phone', 'VARCHAR(20)'),
        ('dob', 'VARCHAR(50)'),
        ('address', 'TEXT'),
        ('occupation', 'VARCHAR(100)'),
        ('annual_income', 'VARCHAR(50)'),
        ('is_profile_complete', 'BOOLEAN DEFAULT 0')
    ]

    for col_name, col_type in new_cols:
        if col_name not in existing_cols:
            cursor.execute(f'ALTER TABLE users ADD COLUMN {col_name} {col_type};')
            print(f'Added column {col_name}')

    conn.commit()
    conn.close()
    print('Database migration complete!')
else:
    print('DB file not found, will be created by SQLAlchemy.')
