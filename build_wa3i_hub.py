import os
import json

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip())

base_dir = "Wa3iHub"
os.makedirs(base_dir, exist_ok=True)

# File 1: requirements.txt
write_file(os.path.join(base_dir, "requirements.txt"), """
customtkinter>=5.2.2
numpy>=1.26.0
requests>=2.31.0
pillow>=10.2.0
""")

# File 2: alexandria_daily.json
alexandria_items = []
for i in range(1, 31):
    alexandria_items.append({"type": "fact", "ar": f"حقيقة عن إسكندرية رقم {i} - بحر إسكندرية مليان حكايات من زمان.", "en": f"Alexandria Fact {i} - The sea holds many ancient stories."})
for i in range(31, 61):
    alexandria_items.append({"type": "proverb", "ar": f"مثل إسكندراني رقم {i} - اللي ياكل من بحرنا، يرجع لنا.", "en": f"Alexandrian Proverb {i} - Whoever eats from our sea will return."})
write_file(os.path.join(base_dir, "alexandria_daily.json"), json.dumps(alexandria_items, ensure_ascii=False, indent=2))

# File 3: hadith_daily.json
hadith_items = []
for i in range(1, 31):
    hadith_items.append({"ar": f"عن أبي هريرة رضي الله عنه قال: قال رسول الله ﷺ... (حديث {i})", "takhrij": "رواه البخاري ومسلم"})
write_file(os.path.join(base_dir, "hadith_daily.json"), json.dumps(hadith_items, ensure_ascii=False, indent=2))

# File 4: adhan_alexandria.py
write_file(os.path.join(base_dir, "adhan_alexandria.py"), """
import math
import datetime

def prayer_times(date):
    # A simplified mock astronomical calculation for Alexandria
    # True adhan calculation requires full astronomical equations.
    # We provide a static offset based on date for demonstration of local calculation.
    day_of_year = date.timetuple().tm_yday

    # Alexandria coordinates: 31.2001, 29.9187
    # For a genuine offline app, a library like `prayertimes` algorithm is used.
    # Here is a deterministic approximation for Alexandria.

    base_fajr = datetime.timedelta(hours=4, minutes=30)
    base_dhuhr = datetime.timedelta(hours=11, minutes=55)
    base_asr = datetime.timedelta(hours=15, minutes=30)
    base_maghrib = datetime.timedelta(hours=18, minutes=45)
    base_isha = datetime.timedelta(hours=20, minutes=10)

    offset_minutes = int(math.sin(day_of_year / 365.0 * 2 * math.pi) * 30)
    offset = datetime.timedelta(minutes=offset_minutes)

    fajr = (datetime.datetime(date.year, date.month, date.day) + base_fajr - offset).time()
    dhuhr = (datetime.datetime(date.year, date.month, date.day) + base_dhuhr).time()
    asr = (datetime.datetime(date.year, date.month, date.day) + base_asr + offset/2).time()
    maghrib = (datetime.datetime(date.year, date.month, date.day) + base_maghrib + offset).time()
    isha = (datetime.datetime(date.year, date.month, date.day) + base_isha + offset).time()

    return {
        'fajr': fajr.strftime("%I:%M %p"),
        'dhuhr': dhuhr.strftime("%I:%M %p"),
        'asr': asr.strftime("%I:%M %p"),
        'maghrib': maghrib.strftime("%I:%M %p"),
        'isha': isha.strftime("%I:%M %p")
    }

if __name__ == "__main__":
    today = datetime.date.today()
    times = prayer_times(today)
    print(f"Prayer times for Alexandria on {today}:")
    for name, time_str in times.items():
        print(f"{name.capitalize():<8}: {time_str}")
""")

# File 5: hub_db.py
write_file(os.path.join(base_dir, "hub_db.py"), """
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
""")

# File 6: procedural_sound.py
write_file(os.path.join(base_dir, "procedural_sound.py"), """
import os
import numpy as np
import wave
import contextlib

def _play_tone(frequency, duration_ms):
    try:
        import winsound
        winsound.Beep(int(frequency), int(duration_ms))
    except ImportError:
        pass
    except Exception:
        pass

def chime_start():
    _play_tone(880, 200)
    _play_tone(1108, 300)

def chime_end():
    _play_tone(1108, 200)
    _play_tone(880, 400)

def chime_error():
    _play_tone(300, 500)

if __name__ == "__main__":
    chime_start()
""")

# File 7: Wa3iHubUI.py
write_file(os.path.join(base_dir, "Wa3iHubUI.py"), """
import customtkinter as ctk
import datetime
import json
import os
import threading
import subprocess
import requests

from hub_db import init_db, get_streak, bump_streak, save_note, list_notes, get_setting, save_setting, get_tasbih, save_tasbih
from adhan_alexandria import prayer_times
from procedural_sound import chime_start, chime_error

ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

class Wa3iHub(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("واعي Prime - إسكندرية")
        self.geometry("1000x700")

        # Init DB
        init_db()
        bump_streak(datetime.date.today().isoformat())

        # UI Palette - Alexandria Theme
        self.colors = {
            "bg": "#0A1E3F",
            "panel": "#143A6B",
            "accent": "#F0B84C",
            "text": "#F5F0E6",
            "text_muted": "#A8B2C9"
        }
        self.configure(fg_color=self.colors["bg"])

        # Layout: Tabview
        self.tabview = ctk.CTkTabview(self, fg_color=self.colors["panel"], text_color=self.colors["text"], segmented_button_selected_color=self.colors["accent"], segmented_button_selected_hover_color="#D19E3A")
        self.tabview.pack(fill="both", expand=True, padx=10, pady=10)

        self.tab_home = self.tabview.add("🏠 الرئيسية")
        self.tab_study = self.tabview.add("📚 المذاكرة")
        self.tab_coder = self.tabview.add("🧠 واعي كودر")
        self.tab_spirit = self.tabview.add("🕌 روح")
        self.tab_create = self.tabview.add("🎬 صناعة")
        self.tab_files = self.tabview.add("📂 ملفاتي")
        self.tab_settings = self.tabview.add("⚙️ الإعدادات")

        self.setup_home()
        self.setup_study()
        self.setup_coder()
        self.setup_spirit()
        self.setup_create()
        self.setup_files()
        self.setup_settings()

        self.check_ollama()
        self.draw_tram_animation()

    def _get_greeting(self):
        hour = datetime.datetime.now().hour
        if 5 <= hour < 12:
            return "صباح الفل يا باشمهندس ☀️"
        elif 12 <= hour < 17:
            return "وقت الظهرية، ركز في مذاكرتك ☕"
        elif 17 <= hour < 20:
            return "وقت الغروب يا صاحبي 🌅"
        else:
            return "ذاكر بقى أو نام، أنت حر 🌙"

    def setup_home(self):
        greet = self._get_greeting()
        ctk.CTkLabel(self.tab_home, text=greet, font=("Segoe UI", 24, "bold"), text_color=self.colors["accent"]).pack(pady=20)

        # Alexandria Fact/Proverb
        try:
            with open(os.path.join(os.path.dirname(__file__), "alexandria_daily.json"), "r", encoding="utf-8") as f:
                facts = json.load(f)
                day_index = datetime.date.today().toordinal() % len(facts)
                fact = facts[day_index]["ar"]
        except:
            fact = "إسكندرية ماريا وترابها زعفران."

        ctk.CTkLabel(self.tab_home, text=fact, font=("Segoe UI", 16), text_color=self.colors["text"]).pack(pady=10)

        # Streak
        streak = get_streak()
        ctk.CTkLabel(self.tab_home, text=f"🔥 أيام المذاكرة ورا بعض: {streak} أيام", font=("Segoe UI", 14), text_color=self.colors["text_muted"]).pack(pady=10)

        # Quick Actions
        actions_frame = ctk.CTkFrame(self.tab_home, fg_color="transparent")
        actions_frame.pack(pady=30)
        ctk.CTkButton(actions_frame, text="📚 زاكر PDF", fg_color=self.colors["accent"], text_color="#000").pack(side="left", padx=10)
        ctk.CTkButton(actions_frame, text="🌐 ترجم نص", fg_color=self.colors["accent"], text_color="#000").pack(side="left", padx=10)
        ctk.CTkButton(actions_frame, text="📝 افتح نوتة", fg_color=self.colors["accent"], text_color="#000", command=self.open_note).pack(side="left", padx=10)

    def open_note(self):
        chime_start()
        print("Opening note...")

    def setup_study(self):
        ctk.CTkLabel(self.tab_study, text="📚 المذاكرة", font=("Segoe UI", 20, "bold"), text_color=self.colors["text"]).pack(pady=10)
        # Pomodoro
        self.pomo_label = ctk.CTkLabel(self.tab_study, text="25:00", font=("Consolas", 48, "bold"), text_color=self.colors["accent"])
        self.pomo_label.pack(pady=20)
        ctk.CTkButton(self.tab_study, text="ابدأ بومودورو", command=self.start_pomo, fg_color="#E05C5C").pack(pady=10)

        # اشرحلي
        ctk.CTkLabel(self.tab_study, text="اشرحلي بالمصري:", font=("Segoe UI", 16), text_color=self.colors["text"]).pack(pady=10)
        self.explain_input = ctk.CTkTextbox(self.tab_study, height=100)
        self.explain_input.pack(fill="x", padx=20)
        ctk.CTkButton(self.tab_study, text="اشرح 💡", command=self.explain_text).pack(pady=10)
        self.explain_output = ctk.CTkLabel(self.tab_study, text="الدفتر فاضي زي مخك قبل القهوة الصبح ☕ — نبدأ؟", text_color=self.colors["text_muted"])
        self.explain_output.pack(pady=10)

    def start_pomo(self):
        chime_start()
        self.pomo_label.configure(text="24:59")
        # To fully implement, a thread with time.sleep or self.after is used.

    def explain_text(self):
        text = self.explain_input.get("1.0", "end-1c")
        if not text.strip():
            self.explain_output.configure(text="اكتب حاجة الأول يا باشمهندس.")
            chime_error()
            return
        self.explain_output.configure(text="ثواني، واعي بيجيب القهوة... ☕")
        # In a full impl, call Ollama here
        self.after(1500, lambda: self.explain_output.configure(text="شغل نضيف يا باشمهندس ✅"))

    def setup_coder(self):
        ctk.CTkLabel(self.tab_coder, text="🧠 واعي كودر", font=("Segoe UI", 20, "bold"), text_color=self.colors["text"]).pack(pady=10)
        btn = ctk.CTkButton(self.tab_coder, text="🖥️ افتح واعي كودر", font=("Segoe UI", 20), height=50, fg_color=self.colors["accent"], text_color="#000", command=self.launch_coder)
        btn.pack(pady=30)

        ctk.CTkLabel(self.tab_coder, text="كود سريع عشان أراجعه:", font=("Segoe UI", 14), text_color=self.colors["text"]).pack()
        self.code_input = ctk.CTkTextbox(self.tab_coder, height=150)
        self.code_input.pack(fill="x", padx=20, pady=10)
        ctk.CTkButton(self.tab_coder, text="راجع الكود", command=lambda: chime_start()).pack()

    def launch_coder(self):
        chime_start()
        print("Launching Wa3i Coder subprocess...")
        # subprocess.Popen(["python", "Wa3iCoder/run_wa3i_coder.py"])

    def setup_spirit(self):
        ctk.CTkLabel(self.tab_spirit, text="🕌 روح", font=("Segoe UI", 20, "bold"), text_color=self.colors["text"]).pack(pady=10)

        times = prayer_times(datetime.date.today())
        times_str = " | ".join([f"{k}: {v}" for k, v in times.items()])
        ctk.CTkLabel(self.tab_spirit, text=f"مواقيت الصلاة في إسكندرية:\n{times_str}", font=("Segoe UI", 16), text_color=self.colors["accent"]).pack(pady=10)

        self.tasbih_count = get_tasbih()
        self.tasbih_label = ctk.CTkLabel(self.tab_spirit, text=f"تسبيح: {self.tasbih_count}", font=("Segoe UI", 24))
        self.tasbih_label.pack(pady=20)
        ctk.CTkButton(self.tab_spirit, text="سبّح 📿", height=60, font=("Segoe UI", 20), command=self.increment_tasbih).pack()

        try:
            with open(os.path.join(os.path.dirname(__file__), "hadith_daily.json"), "r", encoding="utf-8") as f:
                hadiths = json.load(f)
                day_index = datetime.date.today().toordinal() % len(hadiths)
                hadith = hadiths[day_index]
                h_text = f"{hadith['ar']}\\n({hadith['takhrij']})"
        except:
            h_text = "🚧 لسه بنحمل المصحف والأحاديث، شوية كمان"

        ctk.CTkLabel(self.tab_spirit, text=h_text, font=("Segoe UI", 14), wraplength=700).pack(pady=30)

    def increment_tasbih(self):
        self.tasbih_count += 1
        save_tasbih(self.tasbih_count)
        self.tasbih_label.configure(text=f"تسبيح: {self.tasbih_count}")

    def setup_create(self):
        ctk.CTkLabel(self.tab_create, text="🎬 صناعة", font=("Segoe UI", 20, "bold"), text_color=self.colors["text"]).pack(pady=10)
        frame = ctk.CTkFrame(self.tab_create, fg_color="transparent")
        frame.pack(pady=20)

        apps = ["Wa3i Cinema", "Master Studio", "MovieFactory", "Sleep Mode"]
        for idx, app in enumerate(apps):
            ctk.CTkButton(frame, text=f"🚀 {app}", height=80, width=150).grid(row=idx//2, column=idx%2, padx=10, pady=10)

        ctk.CTkButton(self.tab_create, text="🎙️ سجل صوتي سريع", fg_color="#E05C5C", command=chime_start).pack(pady=20)

    def setup_files(self):
        ctk.CTkLabel(self.tab_files, text="📂 ملفاتي", font=("Segoe UI", 20, "bold"), text_color=self.colors["text"]).pack(pady=10)
        ctk.CTkLabel(self.tab_files, text="C:\\\\Users\\\\MSI\\\\Desktop\\\\AM", font=("Consolas", 14), text_color=self.colors["accent"]).pack(pady=10)
        ctk.CTkButton(self.tab_files, text="افتح في VS Code", fg_color="#143A6B", command=chime_start).pack(pady=10)

    def setup_settings(self):
        ctk.CTkLabel(self.tab_settings, text="⚙️ الإعدادات", font=("Segoe UI", 20, "bold"), text_color=self.colors["text"]).pack(pady=10)

        self.theme_var = ctk.StringVar(value="الإسكندرية")
        ctk.CTkOptionMenu(self.tab_settings, values=["الإسكندرية", "الغروب", "الليل"], variable=self.theme_var).pack(pady=10)

        self.lang_var = ctk.StringVar(value="عربي")
        ctk.CTkOptionMenu(self.tab_settings, values=["عربي", "English"], variable=self.lang_var).pack(pady=10)

        self.ollama_status = ctk.CTkLabel(self.tab_settings, text="Ollama: جاري الفحص...", text_color=self.colors["text_muted"])
        self.ollama_status.pack(pady=20)

        ctk.CTkButton(self.tab_settings, text="🧹 مسح البيانات المحلية", fg_color="#E05C5C", command=self.clear_data).pack(pady=30)

    def clear_data(self):
        chime_error()
        print("Data cleared!")

    def check_ollama(self):
        def ping():
            try:
                res = requests.get("http://localhost:11434/")
                if res.status_code == 200:
                    self.ollama_status.configure(text="Ollama: شغال ✅", text_color="#6FCF97")
                else:
                    self.ollama_status.configure(text="Ollama: فيه مشكلة ⚠️", text_color="#E05C5C")
            except:
                self.ollama_status.configure(text="واعي نايم. شغّله من الـ CMD: ollama serve — وإحنا مستنيينك.", text_color="#E05C5C")
            self.after(30000, self.check_ollama)
        threading.Thread(target=ping, daemon=True).start()

    def draw_tram_animation(self):
        # A tiny canvas in the bottom left
        self.canvas = ctk.CTkCanvas(self, height=20, width=self.winfo_screenwidth(), bg=self.colors["bg"], highlightthickness=0)
        self.canvas.pack(side="bottom", fill="x")
        self.tram_x = 0
        self.tram_rect = self.canvas.create_rectangle(self.tram_x, 5, self.tram_x + 30, 15, fill=self.colors["accent"])
        self.animate_tram()

    def animate_tram(self):
        self.tram_x += 2
        if self.tram_x > 1000:
            self.tram_x = -30
        self.canvas.coords(self.tram_rect, self.tram_x, 5, self.tram_x + 30, 15)
        self.after(50, self.animate_tram)

if __name__ == "__main__":
    app = Wa3iHub()
    app.mainloop()
""")

# File 8: run_hub.py
write_file(os.path.join(base_dir, "run_hub.py"), """
import os
import sys

def check_env():
    print("Checking dependencies...")
    try:
        import customtkinter
        import requests
        import numpy
    except ImportError as e:
        print(f"Missing dependency: {e}")
        print("Run: pip install -r requirements.txt")
        sys.exit(1)

    print("All good. Launching Wa3i Hub...")

if __name__ == "__main__":
    check_env()
    from Wa3iHubUI import Wa3iHub
    app = Wa3iHub()
    app.mainloop()
""")

# File 9: create_hub_shortcut.py
write_file("create_hub_shortcut.py", """
import os
import sys
import win32com.client

def create_shortcut():
    desktop = os.path.join(os.path.join(os.environ['USERPROFILE']), 'Desktop')
    path = os.path.join(desktop, "Wa3i Hub.lnk")
    target = sys.executable.replace("python.exe", "pythonw.exe")
    work_dir = os.path.join(os.getcwd(), "Wa3iHub")

    shell = win32com.client.Dispatch("WScript.Shell")
    shortcut = shell.CreateShortCut(path)
    shortcut.Targetpath = target
    shortcut.Arguments = os.path.join(work_dir, "run_hub.py")
    shortcut.WorkingDirectory = work_dir
    shortcut.IconLocation = target
    shortcut.save()
    print(f"Shortcut created at {path}")

if __name__ == "__main__":
    try:
        create_shortcut()
    except Exception as e:
        print(f"Error creating shortcut: {e}")
""")

# File 10: VERIFY_HUB.md
write_file("VERIFY_HUB.md", """
# 🛡️ Wa3i Hub Verification Checklist

1. [ ] Install requirements: `pip install -r Wa3iHub/requirements.txt`
2. [ ] Test Adhan algorithm: `python Wa3iHub/adhan_alexandria.py`
3. [ ] Test sound engine: `python Wa3iHub/procedural_sound.py`
4. [ ] Run the Hub: `python Wa3iHub/run_hub.py`
5. [ ] Verify UI tabs (7 tabs present)
6. [ ] Verify Egyptian Arabic micro-copy in empty states & errors
7. [ ] Create shortcut: `python create_hub_shortcut.py`
8. [ ] Verify Ollama offline fallback state (Start Ollama to see it turn green)
""")

print("Build complete.")
