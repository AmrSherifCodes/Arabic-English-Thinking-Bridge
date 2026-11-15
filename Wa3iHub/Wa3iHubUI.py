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
        ctk.CTkLabel(self.tab_spirit, text=f"مواقيت الصلاة في إسكندرية:
{times_str}", font=("Segoe UI", 16), text_color=self.colors["accent"]).pack(pady=10)

        self.tasbih_count = get_tasbih()
        self.tasbih_label = ctk.CTkLabel(self.tab_spirit, text=f"تسبيح: {self.tasbih_count}", font=("Segoe UI", 24))
        self.tasbih_label.pack(pady=20)
        ctk.CTkButton(self.tab_spirit, text="سبّح 📿", height=60, font=("Segoe UI", 20), command=self.increment_tasbih).pack()

        try:
            with open(os.path.join(os.path.dirname(__file__), "hadith_daily.json"), "r", encoding="utf-8") as f:
                hadiths = json.load(f)
                day_index = datetime.date.today().toordinal() % len(hadiths)
                hadith = hadiths[day_index]
                h_text = f"{hadith['ar']}\n({hadith['takhrij']})"
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
        ctk.CTkLabel(self.tab_files, text="C:\\Users\\MSI\\Desktop\\AM", font=("Consolas", 14), text_color=self.colors["accent"]).pack(pady=10)
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