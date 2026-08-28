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
        ('firebase_uid', 'VARCHAR(128)'),
        ('mobile_number', 'VARCHAR(20)'),
        ('full_name', 'VARCHAR(255)'),
        ('profile_completed', 'BOOLEAN DEFAULT 0'),
        ('gender', 'VARCHAR(20)'),
        ('house_number', 'VARCHAR(100)'),
        ('street', 'VARCHAR(255)'),
        ('city', 'VARCHAR(100)'),
        ('state', 'VARCHAR(100)'),
        ('pincode', 'VARCHAR(20)')
    ]

    for col_name, col_type in new_cols:
        if col_name not in existing_cols:
            cursor.execute(f'ALTER TABLE users ADD COLUMN {col_name} {col_type};')
            print(f'Added column: {col_name}')

    conn.commit()
    conn.close()
    print('Firebase User schema migration completed successfully!')
else:
    print('Database file does not exist yet.')
