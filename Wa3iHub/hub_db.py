import sqlite3
import os

DB_PATH = 'wa3i_hub.db'

def get_connection():
    return sqlite3.connect(DB_PATH)

def init_db():
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''CREATE TABLE IF NOT EXISTS streaks (id INTEGER PRIMARY KEY, count INTEGER, last_open TEXT)''')
            cursor.execute('''CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, title TEXT, content TEXT)''')
            cursor.execute('''CREATE TABLE IF NOT EXISTS exams (id INTEGER PRIMARY KEY, name TEXT, date TEXT)''')
            cursor.execute('''CREATE TABLE IF NOT EXISTS tasbih (id INTEGER PRIMARY KEY, count INTEGER)''')
            cursor.execute('''CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)''')
            conn.commit()
    except Exception as e:
        print(f"DB Init Error: {e}")

def get_streak():
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT count FROM streaks WHERE id=1')
            row = cursor.fetchone()
            return row[0] if row else 0
    except:
        return 0

def bump_streak(today_str):
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT count, last_open FROM streaks WHERE id=1')
            row = cursor.fetchone()
            if row:
                count, last_open = row
                if last_open != today_str:
                    cursor.execute('UPDATE streaks SET count=?, last_open=? WHERE id=1', (count+1, today_str))
            else:
                cursor.execute('INSERT INTO streaks (id, count, last_open) VALUES (1, 1, ?)', (today_str,))
            conn.commit()
    except:
        pass

def save_note(title, content):
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('INSERT INTO notes (title, content) VALUES (?, ?)', (title, content))
            conn.commit()
    except:
        pass

def list_notes():
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT id, title, content FROM notes')
            return cursor.fetchall()
    except:
        return []

def add_exam(name, date):
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('INSERT INTO exams (name, date) VALUES (?, ?)', (name, date))
            conn.commit()
    except:
        pass

def list_exams():
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT id, name, date FROM exams')
            return cursor.fetchall()
    except:
        return []

def save_tasbih(count):
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT count FROM tasbih WHERE id=1')
            if cursor.fetchone():
                cursor.execute('UPDATE tasbih SET count=? WHERE id=1', (count,))
            else:
                cursor.execute('INSERT INTO tasbih (id, count) VALUES (1, ?)', (count,))
            conn.commit()
    except:
        pass

def get_tasbih():
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT count FROM tasbih WHERE id=1')
            row = cursor.fetchone()
            return row[0] if row else 0
    except:
        return 0

def save_setting(key, value):
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', (key, value))
            conn.commit()
    except:
        pass

def get_setting(key, default=None):
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT value FROM settings WHERE key=?', (key,))
            row = cursor.fetchone()
            return row[0] if row else default
    except:
        return default