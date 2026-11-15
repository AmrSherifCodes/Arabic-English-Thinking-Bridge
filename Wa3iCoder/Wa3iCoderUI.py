from __future__ import annotations

import datetime as dt
import os
import random
import re
import threading
import time
import tkinter as tk
import traceback
from tkinter import messagebox
from typing import Any, Dict, List, Optional

import customtkinter as ctk

from Wa3iCoderCore import ExecutionResult, Wa3iCoderAgent
from Wa3iCoderGamify import (
    BADGES,
    CHALLENGES,
    GameProfile,
    daily_challenge,
    evaluate_challenge,
    xp_for_level,
)

ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("dark-blue")

BG, PANEL, HEADER = "#0B132B", "#111C3D", "#101B3B"
GOLD, GOLD_HOVER = "#FFD700", "#E6C200"
WHITE, MUTED, BLUE, SECONDARY = "#FFFFFF", "#B8C7FF", "#26418F", "#1F2A55"
ERROR, OK = "#FF6B6B", "#7CFFB2"

DEFAULT_CODE = """# اكتب طلبك على الشمال يا بطل...
# أو اختار تحدي من تاب 🎯 التحديات
# أو حمّل كود جاهز من 📚 مكتبة الأكواد
"""

SNIPPETS: List[Dict[str, str]] = [
    {"icon": "📄", "name": "قراءة ملف",
     "code": 'from pathlib import Path\n\npath = Path("data.txt")\n'
             'if path.exists():\n    print(path.read_text(encoding="utf-8"))\nelse:\n    print("الملف مش موجود")'},
    {"icon": "💾", "name": "كتابة ملف",
     "code": 'from pathlib import Path\n\nPath("out.txt").write_text("أهلاً واعي", encoding="utf-8")\nprint("اتكتب")'},
    {"icon": "🧾", "name": "JSON",
     "code": 'import json\n\ndata = {"name": "Wa3i", "level": 1}\nprint(json.dumps(data, ensure_ascii=False, indent=2))'},
    {"icon": "📊", "name": "CSV",
     "code": 'import csv\n\nrows = [["name", "score"], ["Wa3i", 10]]\n'
             'with open("scores.csv", "w", newline="", encoding="utf-8") as f:\n'
             '    csv.writer(f).writerows(rows)\nprint("تم")'},
    {"icon": "🔎", "name": "Regex",
     "code": 'import re\n\ntext = "كود 12 و 345"\nprint(re.findall(r"\\d+", text))'},
    {"icon": "🏗️", "name": "Class",
     "code": 'class Player:\n    def __init__(self, name):\n        self.name = name\n        self.xp = 0\n\n'
             '    def add(self, n):\n        self.xp += n\n        return self.xp\n\np = Player("Amr")\nprint(p.add(50))'},
    {"icon": "🎁", "name": "Decorator",
     "code": 'import time\n\ndef timer(fn):\n    def wrap(*a, **k):\n        t = time.time()\n'
             '        r = fn(*a, **k)\n        print("elapsed", round(time.time() - t, 3))\n        return r\n'
             '    return wrap\n\n@timer\ndef slow():\n    time.sleep(0.2)\n\nslow()'},
    {"icon": "♻️", "name": "Generator",
     "code": 'def countdown(n):\n    while n > 0:\n        yield n\n        n -= 1\n\nprint(list(countdown(5)))'},
    {"icon": "⌨️", "name": "CLI args",
     "code": 'import argparse\n\np = argparse.ArgumentParser()\np.add_argument("--name", default="Wa3i")\n'
             'print(p.parse_args().name)'},
    {"icon": "🗄️", "name": "SQLite",
     "code": 'import sqlite3\n\ncon = sqlite3.connect(":memory:")\n'
             'con.execute("create table t (x int)")\ncon.execute("insert into t values (7)")\n'
             'print(con.execute("select x from t").fetchone()[0])'},
    {"icon": "🌐", "name": "HTTP GET",
     "code": 'import urllib.request\n\ntry:\n'
             '    with urllib.request.urlopen("https://example.com", timeout=5) as r:\n'
             '        print(r.status)\nexcept Exception as e:\n    print("فشل:", e)'},
    {"icon": "🪟", "name": "نافذة صغيرة",
     "code": 'import tkinter as tk\n\nroot = tk.Tk()\nroot.title("Wa3i")\n'
             'tk.Label(root, text="أهلاً يا بطل").pack(padx=20, pady=20)\nroot.mainloop()'},
]

COMBO_WINDOW_SEC = 60


def _has_arabic(text: str) -> bool:
    return bool(re.search(r"[\u0600-\u06FF]", text or ""))


def _play_beep(freq: int = 800, ms: int = 120) -> None:
    try:
        if os.name == "nt":
            import winsound
            winsound.Beep(freq, ms)
    except Exception:
        pass


class Wa3iCoderUI(ctk.CTk):
    def __init__(self) -> None:
        super().__init__()
        self.agent = Wa3iCoderAgent()
        self.game = GameProfile.load()
        self.game.touch_day()
        self.game.save()

        self._busy = False
        self._combo = 0
        self._last_success = 0.0
        self._active_challenge: Optional[Dict[str, Any]] = None
        self._toasts: List[tk.Toplevel] = []

        self.title("🧠 واعي كودر — Wa3i Coder")
        self.geometry("1460x900")
        self.minsize(1180, 720)
        self.configure(fg_color=BG)
        self.grid_rowconfigure(1, weight=1)
        self.grid_columnconfigure(0, weight=1)

        self._fonts()
        self._build_header()
        self._build_tabs()
        self._build_statusbar()
        self._set_code(DEFAULT_CODE)
        self._refresh_profile_ui()
        self._refresh_challenges_ui()
        self._refresh_badges_ui()
        self._bind_shortcuts()
        self.after(300, self._startup_checks)

    # ---------------------------------------------------------------- fonts
    def _fonts(self) -> None:
        self.f_title = ctk.CTkFont(family="Segoe UI", size=26, weight="bold")
        self.f_sub = ctk.CTkFont(family="Segoe UI", size=12)
        self.f_label = ctk.CTkFont(family="Segoe UI", size=13, weight="bold")
        self.f_btn = ctk.CTkFont(family="Segoe UI", size=13, weight="bold")
        self.f_chat = ctk.CTkFont(family="Segoe UI", size=13)
        self.f_code = ("Consolas", 11)
        self.f_big = ctk.CTkFont(family="Segoe UI", size=22, weight="bold")

    # ---------------------------------------------------------------- header
    def _build_header(self) -> None:
        header = ctk.CTkFrame(self, fg_color=HEADER, corner_radius=0)
        header.grid(row=0, column=0, sticky="ew")
        header.grid_columnconfigure(0, weight=1)

        left = ctk.CTkFrame(header, fg_color="transparent")
        left.grid(row=0, column=0, sticky="w", padx=20, pady=10)
        ctk.CTkLabel(left, text="🧠 واعي كودر", font=self.f_title, text_color=GOLD).pack(anchor="w")
        ctk.CTkLabel(
            left,
            text="مساعدك المصري للبرمجة — أوفلاين 100% • العب، اكسب XP، وابني حاجات حلوة",
            font=self.f_sub, text_color=MUTED,
        ).pack(anchor="w")

        stats = ctk.CTkFrame(header, fg_color="transparent")
        stats.grid(row=0, column=1, sticky="e", padx=20, pady=10)

        # Level badge
        badge_frame = ctk.CTkFrame(stats, fg_color=SECONDARY, corner_radius=14)
        badge_frame.grid(row=0, column=0, padx=(0, 14), sticky="ns")
        self.level_badge = ctk.CTkLabel(
            badge_frame, text="Lv 1", font=self.f_big, text_color=GOLD, width=78,
        )
        self.level_badge.pack(padx=10, pady=6)

        # XP progress
        xp_frame = ctk.CTkFrame(stats, fg_color="transparent")
        xp_frame.grid(row=0, column=1, padx=(0, 18), sticky="w")
        self.xp_label = ctk.CTkLabel(xp_frame, text="XP: 0 / 100", font=self.f_sub, text_color=MUTED)
        self.xp_label.pack(anchor="w")
        self.xp_bar = ctk.CTkProgressBar(
            xp_frame, width=170, height=10, progress_color=GOLD, fg_color=SECONDARY,
        )
        self.xp_bar.set(0)
        self.xp_bar.pack(anchor="w", pady=(3, 0))

        # Coins
        self.coins_label = ctk.CTkLabel(stats, text="🪙 0", font=self.f_label, text_color=GOLD)
        self.coins_label.grid(row=0, column=2, padx=(0, 12))

        # Combo
        self.combo_label = ctk.CTkLabel(stats, text="", font=self.f_label, text_color=ERROR)
        self.combo_label.grid(row=0, column=3, padx=(0, 12))

        # Streak
        self.streak_label = ctk.CTkLabel(stats, text="📅 0", font=self.f_label, text_color=OK)
        self.streak_label.grid(row=0, column=4, padx=(0, 12))

        # Sound toggle
        self.sound_btn = ctk.CTkButton(
            stats, text="🔊" if self.game.state.get("sound", True) else "🔇",
            width=42, height=34,
            fg_color=SECONDARY, hover_color=BLUE, text_color=WHITE,
            command=self._toggle_sound,
        )
        self.sound_btn.grid(row=0, column=5)

    # ---------------------------------------------------------------- tabs
    def _build_tabs(self) -> None:
        self.tabs = ctk.CTkTabview(
            self, fg_color=PANEL, corner_radius=14,
            segmented_button_fg_color=SECONDARY,
            segmented_button_selected_color=GOLD,
            segmented_button_selected_hover_color=GOLD_HOVER,
            segmented_button_unselected_color=SECONDARY,
            segmented_button_unselected_hover_color=BLUE,
            text_color=WHITE,
        )
        self.tabs.grid(row=1, column=0, sticky="nsew", padx=14, pady=14)

        self.tab_chat = self.tabs.add("💬 الشات")
        self.tab_challenges = self.tabs.add("🎯 التحديات")
        self.tab_badges = self.tabs.add("🏅 الإنجازات")
        self.tab_snippets = self.tabs.add("📚 مكتبة الأكواد")

        self._build_chat_tab()
        self._build_challenges_tab()
        self._build_badges_tab()
        self._build_snippets_tab()

    # ---------------------------------------------------------------- chat tab
    def _build_chat_tab(self) -> None:
        self.tab_chat.grid_rowconfigure(0, weight=1)
        self.tab_chat.grid_columnconfigure(0, minsize=460, weight=0)
        self.tab_chat.grid_columnconfigure(1, weight=1)

        # Left: chat + input
        left = ctk.CTkFrame(self.tab_chat, fg_color="transparent")
        left.grid(row=0, column=0, sticky="nsew", padx=(6, 6), pady=6)
        left.grid_rowconfigure(1, weight=1)
        left.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(left, text="💬 الشات", font=self.f_label, text_color=GOLD)\
            .grid(row=0, column=0, padx=6, pady=(6, 4), sticky="w")

        chat_frame = ctk.CTkFrame(left, fg_color=BG, corner_radius=12)
        chat_frame.grid(row=1, column=0, sticky="nsew", padx=6, pady=(0, 8))
        chat_frame.grid_rowconfigure(0, weight=1)
        chat_frame.grid_columnconfigure(0, weight=1)

        self.chat_text = tk.Text(
            chat_frame, bg=BG, fg=WHITE, insertbackground=GOLD, selectbackground=BLUE,
            relief="flat", wrap="word", font=self.f_chat, padx=10, pady=10, state="disabled",
        )
        chat_scroll = tk.Scrollbar(chat_frame, command=self.chat_text.yview)
        self.chat_text.configure(yscrollcommand=chat_scroll.set)
        self.chat_text.grid(row=0, column=0, sticky="nsew")
        chat_scroll.grid(row=0, column=1, sticky="ns")
        for tag, color in (
            ("user", GOLD), ("agent", WHITE), ("system", MUTED), ("error", ERROR), ("win", OK),
        ):
            self.chat_text.tag_configure(tag, foreground=color)

        ctk.CTkLabel(left, text="📝 طلبك (Ctrl+Enter للتوليد)", font=self.f_label, text_color=GOLD)\
            .grid(row=2, column=0, padx=6, pady=(0, 4), sticky="w")

        self.input_text = ctk.CTkTextbox(
            left, height=110, fg_color=BG, text_color=WHITE,
            border_color=BLUE, border_width=1, corner_radius=12, font=self.f_chat,
        )
        self.input_text.grid(row=3, column=0, sticky="ew", padx=6, pady=(0, 8))
        self.input_text.insert(
            "1.0", "مثال: اعملي سكريبت بايثون يطبع Hello World ويحسب 2 + 3",
        )

        buttons = ctk.CTkFrame(left, fg_color="transparent")
        buttons.grid(row=4, column=0, sticky="ew", padx=6, pady=(0, 6))
        buttons.grid_columnconfigure(0, weight=1)

        self.generate_btn = ctk.CTkButton(
            buttons, text="🚀 شغل الكود", command=self._generate,
            fg_color=GOLD, hover_color=GOLD_HOVER, text_color=BG,
            font=self.f_btn, corner_radius=12, height=42,
        )
        self.generate_btn.grid(row=0, column=0, sticky="ew", padx=(0, 8))

        ctk.CTkButton(
            buttons, text="🧹 نظف", command=self._clear_all,
            fg_color=SECONDARY, hover_color=BLUE, text_color=WHITE,
            font=self.f_btn, corner_radius=12, height=42, width=90,
        ).grid(row=0, column=1, sticky="e")

        # Right: code + output
        right = ctk.CTkFrame(self.tab_chat, fg_color="transparent")
        right.grid(row=0, column=1, sticky="nsew", padx=(6, 6), pady=6)
        right.grid_rowconfigure(1, weight=3)
        right.grid_rowconfigure(3, weight=1)
        right.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(right, text="🧾 الكود", font=self.f_label, text_color=GOLD)\
            .grid(row=0, column=0, padx=6, pady=(6, 4), sticky="w")

        code_frame = ctk.CTkFrame(right, fg_color=BG, corner_radius=12)
        code_frame.grid(row=1, column=0, sticky="nsew", padx=6, pady=(0, 8))
        code_frame.grid_rowconfigure(0, weight=1)
        code_frame.grid_columnconfigure(0, weight=1)

        self.code_text = tk.Text(
            code_frame, bg=BG, fg=WHITE, insertbackground=GOLD, selectbackground=BLUE,
            relief="flat", wrap="none", undo=True, font=self.f_code, padx=10, pady=10,
        )
        code_sy = tk.Scrollbar(code_frame, command=self.code_text.yview)
        code_sx = tk.Scrollbar(code_frame, orient="horizontal", command=self.code_text.xview)
        self.code_text.configure(yscrollcommand=code_sy.set, xscrollcommand=code_sx.set)
        self.code_text.grid(row=0, column=0, sticky="nsew")
        code_sy.grid(row=0, column=1, sticky="ns")
        code_sx.grid(row=1, column=0, sticky="ew")
        for tag, color in (
            ("kw", "#FF7AB6"), ("str", "#A8FF60"), ("com", "#6C7A9C"),
            ("num", "#FFD166"), ("func", "#7DD3FC"),
        ):
            self.code_text.tag_configure(tag, foreground=color)

        ctk.CTkLabel(right, text="🖥️ النتيجة / Terminal", font=self.f_label, text_color=GOLD)\
            .grid(row=2, column=0, padx=6, pady=(0, 4), sticky="w")

        out_frame = ctk.CTkFrame(right, fg_color=BG, corner_radius=12)
        out_frame.grid(row=3, column=0, sticky="nsew", padx=6, pady=(0, 8))
        out_frame.grid_rowconfigure(0, weight=1)
        out_frame.grid_columnconfigure(0, weight=1)

        self.output_text = tk.Text(
            out_frame, bg=BG, fg=WHITE, insertbackground=GOLD, selectbackground=BLUE,
            relief="flat", wrap="word", font=self.f_code, padx=10, pady=10,
            state="disabled", height=10,
        )
        out_sy = tk.Scrollbar(out_frame, command=self.output_text.yview)
        self.output_text.configure(yscrollcommand=out_sy.set)
        self.output_text.grid(row=0, column=0, sticky="nsew")
        out_sy.grid(row=0, column=1, sticky="ns")
        self.output_text.tag_configure("ok", foreground=OK)
        self.output_text.tag_configure("err", foreground=ERROR)
        self.output_text.tag_configure("normal", foreground=WHITE)

        right_buttons = ctk.CTkFrame(right, fg_color="transparent")
        right_buttons.grid(row=4, column=0, sticky="ew", padx=6, pady=(0, 6))
        right_buttons.grid_columnconfigure(0, weight=1)
        right_buttons.grid_columnconfigure(1, weight=0)
        right_buttons.grid_columnconfigure(2, weight=0)

        self.run_btn = ctk.CTkButton(
            right_buttons, text="▶️ جرب الكود", command=self._run_code,
            fg_color=SECONDARY, hover_color=BLUE, text_color=WHITE,
            font=self.f_btn, corner_radius=12, height=42,
        )
        self.run_btn.grid(row=0, column=0, sticky="ew", padx=(0, 8))

        ctk.CTkButton(
            right_buttons, text="📋 انسخ الكود", command=self._copy_code,
            fg_color=GOLD, hover_color=GOLD_HOVER, text_color=BG,
            font=self.f_btn, corner_radius=12, height=42,
        ).grid(row=0, column=1, sticky="e", padx=(0, 8))

        ctk.CTkButton(
            right_buttons, text="🧽 نظف النتيجة", command=self._clear_output,
            fg_color=SECONDARY, hover_color=BLUE, text_color=WHITE,
            font=self.f_btn, corner_radius=12, height=42,
        ).grid(row=0, column=2, sticky="e")

    # ---------------------------------------------------------------- challenges tab
    def _build_challenges_tab(self) -> None:
        self.tab_challenges.grid_rowconfigure(1, weight=1)
        self.tab_challenges.grid_columnconfigure(0, weight=1)

        top = ctk.CTkFrame(self.tab_challenges, fg_color=SECONDARY, corner_radius=14)
        top.grid(row=0, column=0, sticky="ew", padx=8, pady=(8, 6))

        daily = daily_challenge()
        self.daily_label = ctk.CTkLabel(
            top,
            text=f"🔥 تحدي اليوم: {daily['title']} • {daily['xp']} XP + 25 bonus",
            font=self.f_label, text_color=GOLD,
        )
        self.daily_label.pack(side="left", padx=14, pady=10)

        ctk.CTkButton(
            top, text="▶️ ابدأ التحدي اليومي", command=lambda: self._start_challenge(daily),
            fg_color=GOLD, hover_color=GOLD_HOVER, text_color=BG,
            font=self.f_btn, corner_radius=10, height=34,
        ).pack(side="right", padx=14, pady=8)

        scroll = ctk.CTkScrollableFrame(self.tab_challenges, fg_color="transparent")
        scroll.grid(row=1, column=0, sticky="nsew", padx=8, pady=(0, 8))
        scroll.grid_columnconfigure(0, weight=1)
        self.challenges_frame = scroll

    def _refresh_challenges_ui(self) -> None:
        try:
            for w in self.challenges_frame.winfo_children():
                w.destroy()
            done = set(self.game.state.get("challenges_done", []))
            for idx, ch in enumerate(CHALLENGES):
                row = ctk.CTkFrame(self.challenges_frame, fg_color=PANEL, corner_radius=12)
                row.grid(row=idx, column=0, sticky="ew", padx=6, pady=5)
                row.grid_columnconfigure(1, weight=1)

                status = "✅" if ch["id"] in done else "🎯"
                ctk.CTkLabel(row, text=status, font=self.f_big, text_color=OK if ch["id"] in done else GOLD, width=44)\
                    .grid(row=0, column=0, rowspan=2, padx=(12, 8), pady=10)

                ctk.CTkLabel(row, text=ch["title"], font=self.f_label, text_color=WHITE)\
                    .grid(row=0, column=1, sticky="w", pady=(8, 0))
                ctk.CTkLabel(
                    row,
                    text=f"{ch['difficulty']} • {ch['xp']} XP",
                    font=self.f_sub, text_color=MUTED,
                ).grid(row=1, column=1, sticky="w", pady=(0, 8))

                ctk.CTkButton(
                    row, text="ابدأ", width=80, height=32,
                    fg_color=SECONDARY if ch["id"] not in done else BLUE,
                    hover_color=BLUE, text_color=WHITE, font=self.f_btn,
                    command=lambda c=ch: self._start_challenge(c),
                ).grid(row=0, column=2, rowspan=2, padx=12)
        except Exception:
            pass

    # ---------------------------------------------------------------- badges tab
    def _build_badges_tab(self) -> None:
        self.tab_badges.grid_rowconfigure(0, weight=1)
        self.tab_badges.grid_columnconfigure(0, weight=1)
        scroll = ctk.CTkScrollableFrame(self.tab_badges, fg_color="transparent")
        scroll.grid(row=0, column=0, sticky="nsew", padx=8, pady=8)
        scroll.grid_columnconfigure(0, weight=1)
        self.badges_frame = scroll

    def _refresh_badges_ui(self) -> None:
        try:
            for w in self.badges_frame.winfo_children():
                w.destroy()
            owned = set(self.game.state.get("badges", []))
            for idx, (bid, meta) in enumerate(BADGES.items()):
                unlocked = bid in owned
                card = ctk.CTkFrame(
                    self.badges_frame,
                    fg_color=SECONDARY if unlocked else PANEL,
                    corner_radius=12, border_width=2 if unlocked else 1,
                    border_color=GOLD if unlocked else BLUE,
                )
                card.grid(row=idx, column=0, sticky="ew", padx=6, pady=4)
                card.grid_columnconfigure(2, weight=1)

                ctk.CTkLabel(
                    card, text=meta["icon"], font=self.f_big,
                    text_color=WHITE if unlocked else MUTED, width=44,
                ).grid(row=0, column=0, rowspan=2, padx=(12, 8), pady=10)

                ctk.CTkLabel(
                    card, text=meta["title"], font=self.f_label,
                    text_color=GOLD if unlocked else MUTED,
                ).grid(row=0, column=1, sticky="w", pady=(8, 0))
                ctk.CTkLabel(card, text=meta["desc"], font=self.f_sub, text_color=MUTED)\
                    .grid(row=1, column=1, columnspan=2, sticky="w", pady=(0, 8))

                ctk.CTkLabel(
                    card, text="✅" if unlocked else "🔒",
                    font=self.f_label, text_color=OK if unlocked else MUTED, width=36,
                ).grid(row=0, column=2, rowspan=2, padx=12)
        except Exception:
            pass

    # ---------------------------------------------------------------- snippets tab
    def _build_snippets_tab(self) -> None:
        self.tab_snippets.grid_rowconfigure(0, weight=1)
        self.tab_snippets.grid_columnconfigure(0, weight=1)
        scroll = ctk.CTkScrollableFrame(self.tab_snippets, fg_color="transparent")
        scroll.grid(row=0, column=0, sticky="nsew", padx=8, pady=8)
        scroll.grid_columnconfigure(0, weight=1)

        for idx, snip in enumerate(SNIPPETS):
            row = ctk.CTkFrame(scroll, fg_color=PANEL, corner_radius=12)
            row.grid(row=idx, column=0, sticky="ew", padx=6, pady=4)
            row.grid_columnconfigure(1, weight=1)

            ctk.CTkLabel(row, text=snip["icon"], font=self.f_big, text_color=GOLD, width=44)\
                .grid(row=0, column=0, padx=(12, 8), pady=10)
            ctk.CTkLabel(row, text=snip["name"], font=self.f_label, text_color=WHITE)\
                .grid(row=0, column=1, sticky="w")

            ctk.CTkButton(
                row, text="حمّل", width=80, height=32,
                fg_color=SECONDARY, hover_color=BLUE, text_color=WHITE,
                font=self.f_btn, command=lambda s=snip: self._load_snippet(s),
            ).grid(row=0, column=2, padx=12)

    # ---------------------------------------------------------------- status bar
    def _build_statusbar(self) -> None:
        bar = ctk.CTkFrame(self, fg_color=HEADER, corner_radius=0, height=32)
        bar.grid(row=2, column=0, sticky="ew")
        self.status_label = ctk.CTkLabel(
            bar, text="جاهز يا بطل...", font=self.f_sub, text_color=MUTED, anchor="w",
        )
        self.status_label.pack(fill="x", padx=18, pady=6)

    # ---------------------------------------------------------------- helpers
    def _set_status(self, text: str, color: str = MUTED) -> None:
        try:
            self.status_label.configure(text=text, text_color=color)
        except Exception:
            pass

    def _append_chat(self, speaker: str, message: str, tag: str = "agent") -> None:
        try:
            self.chat_text.configure(state="normal")
            self.chat_text.insert("end", f"\n{speaker}\n", tag)
            self.chat_text.insert("end", f"{message}\n", tag)
            self.chat_text.see("end")
            self.chat_text.configure(state="disabled")
        except Exception:
            pass

    def _append_output(self, text: str, tag: str = "normal") -> None:
        try:
            self.output_text.configure(state="normal")
            self.output_text.insert("end", text + "\n\n", tag)
            self.output_text.see("end")
            self.output_text.configure(state="disabled")
        except Exception:
            pass

    def _clear_output(self) -> None:
        try:
            self.output_text.configure(state="normal")
            self.output_text.delete("1.0", "end")
            self.output_text.configure(state="disabled")
        except Exception:
            pass

    def _clear_all(self) -> None:
        try:
            self.chat_text.configure(state="normal")
            self.chat_text.delete("1.0", "end")
            self.chat_text.configure(state="disabled")
            self._clear_output()
            self._set_code(DEFAULT_CODE)
            self._append_chat("⚙️ النظام", "نظفت كل حاجة. ابعت طلبك الجديد يا بطل.", "system")
        except Exception:
            pass

    def _set_busy(self, busy: bool) -> None:
        self._busy = busy
        state = "disabled" if busy else "normal"
        try:
            self.generate_btn.configure(state=state)
            self.run_btn.configure(state=state)
        except Exception:
            pass

    def _set_code(self, code: str) -> None:
        try:
            self.code_text.delete("1.0", "end")
            self.code_text.insert("1.0", code or "")
            self._highlight_code()
        except Exception:
            pass

    def _get_code(self) -> str:
        try:
            return self.code_text.get("1.0", "end-1c")
        except Exception:
            return ""

    def _highlight_code(self) -> None:
        try:
            text = self.code_text
            for tag in ("kw", "str", "com", "num", "func"):
                text.tag_remove(tag, "1.0", "end")
            content = text.get("1.0", "end-1c")
            if not content:
                return
            keywords = (
                "False|None|True|and|as|assert|async|await|break|class|continue|"
                "def|del|elif|else|except|finally|for|from|global|if|import|in|"
                "is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield|match|case"
            )
            patterns = [
                (rf"\b(?:{keywords})\b", "kw"),
                (r"\b\d+(?:\.\d+)?\b", "num"),
                (r"\b(?:def|class)\s+([A-Za-z_][A-Za-z0-9_]*)", "func"),
                (r'("""[\s\S]*?"""|\'\'\'[\s\S]*?\'\'\'|"[^"\\]*(?:\\.[^"\\]*)*"|\'[^\'\\]*(?:\\.[^\'\\]*)*\')', "str"),
                (r"#[^\n]*", "com"),
            ]
            for pattern, tag in patterns:
                for m in re.finditer(pattern, content):
                    start = text.index(f"1.0 + {m.start()} chars")
                    end = text.index(f"1.0 + {m.end()} chars")
                    text.tag_add(tag, start, end)
        except Exception:
            pass

    # ---------------------------------------------------------------- sound + toast + confetti
    def _toggle_sound(self) -> None:
        cur = bool(self.game.state.get("sound", True))
        self.game.state["sound"] = not cur
        self.game.save()
        try:
            self.sound_btn.configure(text="🔊" if not cur else "🔇")
        except Exception:
            pass

    def _play_sound(self, kind: str = "tap") -> None:
        if not self.game.state.get("sound", True):
            return
        try:
            if kind == "win":
                _play_beep(880, 80); _play_beep(1320, 110)
            elif kind == "level":
                _play_beep(660, 80); _play_beep(880, 80); _play_beep(1320, 140)
            elif kind == "error":
                _play_beep(220, 180)
            else:
                _play_beep(800, 60)
        except Exception:
            pass

    def _show_toast(self, title: str, subtitle: str = "", duration_ms: int = 2200) -> None:
        try:
            top = tk.Toplevel(self)
            top.overrideredirect(True)
            top.configure(bg=GOLD)
            w, h = 320, 90
            x = self.winfo_x() + self.winfo_width() - w - 40
            y = self.winfo_y() + 100 + (len(self._toasts) * (h + 12))
            top.geometry(f"{w}x{h}+{x}+{y}")
            frame = tk.Frame(top, bg=HEADER, padx=10, pady=8)
            frame.pack(fill="both", expand=True, padx=2, pady=2)
            tk.Label(frame, text=title, bg=HEADER, fg=GOLD,
                     font=("Segoe UI", 12, "bold"), anchor="w").pack(fill="x")
            if subtitle:
                tk.Label(frame, text=subtitle, bg=HEADER, fg=WHITE,
                         font=("Segoe UI", 10), anchor="w", justify="left", wraplength=280)\
                    .pack(fill="x", pady=(4, 0))
            self._toasts.append(top)
            top.after(duration_ms, lambda: self._dismiss_toast(top))
        except Exception:
            pass

    def _dismiss_toast(self, top: tk.Toplevel) -> None:
        try:
            self._toasts.remove(top)
        except ValueError:
            pass
        try:
            top.destroy()
        except Exception:
            pass

    def _confetti(self) -> None:
        try:
            w = self.winfo_width() or 1200
            h = self.winfo_height() or 800
            canvas = tk.Canvas(self, width=w, height=h, bg=BG, highlightthickness=0)
            canvas.place(x=0, y=0, relwidth=1, relheight=1)
            colors = ["#FFD700", "#7CFFB2", "#FF6B6B", "#B8C7FF", "#E6C200"]
            pieces = []
            for _ in range(60):
                x = random.randint(0, w)
                y = random.randint(-100, 0)
                size = random.randint(4, 9)
                c = random.choice(colors)
                rect = canvas.create_rectangle(x, y, x + size, y + size, fill=c, outline="")
                pieces.append((rect, random.uniform(2.5, 6.0)))

            def animate(steps: int = 0) -> None:
                if steps > 60:
                    try:
                        canvas.destroy()
                    except Exception:
                        pass
                    return
                for rect, speed in pieces:
                    try:
                        canvas.move(rect, 0, speed)
                    except Exception:
                        pass
                canvas.after(30, lambda: animate(steps + 1))

            animate()
        except Exception:
            pass

    # ---------------------------------------------------------------- profile UI
    def _refresh_profile_ui(self) -> None:
        try:
            level = self.game.level
            xp = int(self.game.state.get("xp", 0))
            cur = xp_for_level(level)
            nxt = xp_for_level(level + 1)
            self.level_badge.configure(text=f"Lv {level}")
            self.xp_label.configure(text=f"XP: {xp} / {nxt}")
            self.xp_bar.set(self.game.level_progress())
            self.coins_label.configure(text=f"🪙 {int(self.game.state.get('coins', 0))}")
            self.streak_label.configure(text=f"📅 {int(self.game.state.get('streak', 0))}")
            if self._combo >= 3:
                mult = 1 + min(self._combo, 10) * 0.1
                self.combo_label.configure(text=f"🔥 x{self._combo}  ({mult:.1f}×)", text_color=ERROR)
            else:
                self.combo_label.configure(text="")
        except Exception:
            pass

    # ---------------------------------------------------------------- shortcuts
    def _bind_shortcuts(self) -> None:
        try:
            self.bind("<Control-Return>", lambda _e: self._generate())
            self.bind("<Control-r>", lambda _e: self._run_code())
            self.bind("<Control-Shift-C>", lambda _e: self._copy_code())
            self.bind("<Control-s>", lambda _e: self._save_code())
            self.bind("<F1>", lambda _e: self._focus_tab(self.tab_challenges))
        except Exception:
            pass

    def _focus_tab(self, tab) -> None:
        try:
            for name in ("💬 الشات", "🎯 التحديات", "🏅 الإنجازات", "📚 مكتبة الأكواد"):
                if self.tabs._tab_dict.get(name) is tab:
                    self.tabs.set(name)
                    return
        except Exception:
            pass

    # ---------------------------------------------------------------- startup
    def _startup_checks(self) -> None:
        threading.Thread(target=self._check_ollama_worker, daemon=True).start()

    def _check_ollama_worker(self) -> None:
        try:
            online = self.agent.is_online()
            if online:
                models = self.agent.list_models()
                if any(self.agent.model == m or self.agent.model in m for m in models):
                    self.after(0, self._set_status, f"✅ متصل بـ Ollama — {self.agent.model}", OK)
                    self.after(0, self._append_chat, "⚙️ النظام",
                               f"Ollama شغال والموديل {self.agent.model} موجود. أنا جاهز يا بطل.", "system")
                else:
                    self.after(0, self._set_status,
                               f"⚠️ الموديل {self.agent.model} مش موجود — ollama pull {self.agent.model}", GOLD)
            else:
                self.after(0, self._set_status, "❌ Ollama مش شغال — ollama serve", ERROR)
                self.after(0, self._append_chat, "⚙️ النظام",
                           "Ollama مش شغال. شغله من CMD: ollama serve وبعدها ابعت طلبك.", "error")
        except Exception as exc:
            self.after(0, self._set_status, f"❌ مشكلة في الاتصال: {exc}", ERROR)

    # ---------------------------------------------------------------- actions
    def _load_snippet(self, snip: Dict[str, str]) -> None:
        self._set_code(snip["code"])
        self._focus_tab(self.tab_chat)
        self._append_chat("📚 المكتبة", f"حمّلت لك: {snip['name']} — جربها على طول.", "system")
        self._play_sound("tap")

    def _start_challenge(self, ch: Dict[str, Any]) -> None:
        self._active_challenge = ch
        self._focus_tab(self.tab_chat)
        self.input_text.delete("1.0", "end")
        self.input_text.insert("1.0", ch["prompt"])
        self._set_code(DEFAULT_CODE)
        self._append_chat("🎯 التحدي", f"{ch['title']} — {ch['xp']} XP\n{ch['prompt']}", "system")
        self._set_status(f"🎯 تحدي نشط: {ch['title']}", GOLD)
        self._play_sound("tap")

    def _generate(self) -> None:
        if self._busy:
            return
        prompt = self.input_text.get("1.0", "end-1c").strip()
        if not prompt:
            messagebox.showwarning("ناقص", "اكتب طلبك الأول يا بطل.")
            return
        self._append_chat("🧑 أنت", prompt, "user")
        self._append_chat("🤖 واعي", "ثواني يا بطل، بجهز الكود وبجربه...", "agent")
        self._set_busy(True)
        self._set_status("⏳ واعي بيشتغل على الطلب...", GOLD)
        threading.Thread(target=self._generate_worker, args=(prompt,), daemon=True).start()

    def _generate_worker(self, prompt: str) -> None:
        try:
            data = self.agent.generate_and_test(prompt, max_heal=2)
            self.after(0, self._on_generate_done, data, prompt)
        except Exception as exc:
            self.after(0, self._on_error, f"حصلت مشكلة وأنا بولد الكود: {exc}", traceback.format_exc())

    def _on_generate_done(self, data: Dict[str, Any], prompt: str) -> None:
        try:
            code = data.get("code", "")
            result: Optional[ExecutionResult] = data.get("result")
            attempts = data.get("attempts", [])
            healed = bool(data.get("healed", False))
            self._set_code(code)
            if result is not None:
                self._append_output(result.summary(), "ok" if result.success else "err")
                if result.success:
                    msg = "شغل نضيف يا بطل ✅ الكود اشتغل."
                    if healed:
                        msg += " وكمان صلحت نفسي بعد ما أول نسخة فشلت."
                    self._append_chat("🤖 واعي", msg, "agent")
                    self._on_success(result, healed, prompt)
                else:
                    self._append_chat("🤖 واعي",
                                      "فيه غلطة لسه بعد محاولات الإصلاح. بص على الـ Terminal وابعتلي التفاصيل.",
                                      "error")
                    self._play_sound("error")
            if attempts:
                lines = [f"محاولة {a.get('attempt','?')}: {'نجحت ✅' if a.get('success') else 'فشلت ❌'}"
                         for a in attempts]
                self._append_chat("🩺 إصلاح تلقائي", "\n".join(lines), "system")
            self._set_status("✅ خلصت — الكود جاهز", OK)
        except Exception as exc:
            self._append_chat("❌ خطأ", str(exc), "error")
        finally:
            self._set_busy(False)

    def _run_code(self) -> None:
        if self._busy:
            return
        code = self._get_code().strip()
        if not code:
            messagebox.showwarning("ناقص", "مفيش كود أشغله يا بطل.")
            return
        self._set_busy(True)
        self._set_status("⏳ بجرب الكود...", GOLD)
        self._append_chat("▶️ النظام", "بجرب الكود الحالي...", "system")
        threading.Thread(target=self._run_worker, args=(code,), daemon=True).start()

    def _run_worker(self, code: str) -> None:
        try:
            result = self.agent.execute_code(code)
            self.after(0, self._on_run_done, result)
        except Exception as exc:
            self.after(0, self._on_error, f"حصلت مشكلة وأنا بشغل الكود: {exc}", traceback.format_exc())

    def _on_run_done(self, result: ExecutionResult) -> None:
        try:
            self._append_output(result.summary(), "ok" if result.success else "err")
            self.game.state["runs"] = int(self.game.state.get("runs", 0)) + 1
            if result.success:
                self._append_chat("🤖 واعي", "شغل نضيف يا بطل ✅", "agent")
                self._set_status("✅ الكود اشتغل", OK)
                self._on_success(result, False, "")
            else:
                self._append_chat("🤖 واعي", "فيه غلطة هنا. بص على الـ Terminal.", "error")
                self._set_status("❌ الكود فشل", ERROR)
                self._play_sound("error")
            self.game.save()
            self._refresh_profile_ui()
        finally:
            self._set_busy(False)

    def _copy_code(self) -> None:
        try:
            self.clipboard_clear()
            self.clipboard_append(self._get_code())
            self.update()
            self.game.state["copies"] = int(self.game.state.get("copies", 0)) + 1
            self._check_badges()
            self.game.save()
            self._refresh_profile_ui()
            self._append_chat("📋 النظام", "الكود اتنسخ يا بطل.", "system")
            self._set_status("📋 الكود اتنسخ", OK)
        except Exception as exc:
            self._append_chat("❌ خطأ", f"مش قادر أنسخ: {exc}", "error")

    def _save_code(self) -> None:
        try:
            from tkinter import filedialog
            path = filedialog.asksaveasfilename(
                defaultextension=".py",
                filetypes=[("Python", "*.py"), ("All", "*.*")],
                initialfile="wa3i_snippet.py",
            )
            if not path:
                return
            with open(path, "w", encoding="utf-8") as fh:
                fh.write(self._get_code())
            self._append_chat("💾 النظام", f"اتحفظ في: {path}", "system")
            self._set_status("💾 اتحفظ", OK)
        except Exception as exc:
            self._append_chat("❌ خطأ", f"مش قادر أحفظ: {exc}", "error")

    # ---------------------------------------------------------------- xp / badges / challenge completion
    def _on_success(self, result: ExecutionResult, healed: bool, prompt: str) -> None:
        try:
            now = time.time()
            if now - self._last_success < COMBO_WINDOW_SEC:
                self._combo += 1
            else:
                self._combo = 1
            self._last_success = now

            self.game.state["total_success"] = int(self.game.state.get("total_success", 0)) + 1
            self.game.state["best_combo"] = max(
                int(self.game.state.get("best_combo", 0)), self._combo,
            )
            if healed:
                self.game.state["heal_wins"] = int(self.game.state.get("heal_wins", 0)) + 1

            gained = self.game.add_xp(10, combo=self._combo)

            if result.duration < 15.0:
                self._quick_win = True

            if prompt and _has_arabic(prompt):
                self.game.state["_arabic_seen"] = True

            self._check_badges(prompt=prompt, duration=result.duration)

            # challenge?
            if self._active_challenge:
                if evaluate_challenge(self._active_challenge, result):
                    self._complete_challenge(self._active_challenge)
                else:
                    self._append_chat(
                        "🎯 التحدي",
                        "الكود شغال بس النتيجة مش مطابقة للمطلوب. جرب تاني أو عدّل الكود.",
                        "error",
                    )
                self._active_challenge = None

            self.game.save()
            self._refresh_profile_ui()
            self._refresh_badges_ui()
            self._refresh_challenges_ui()
            self._play_sound("win")
        except Exception:
            pass

    def _complete_challenge(self, ch: Dict[str, Any]) -> None:
        try:
            cid = ch["id"]
            done = self.game.state.setdefault("challenges_done", [])
            if cid in done:
                return
            done.append(cid)
            xp = int(ch.get("xp", 40))
            bonus = 0
            today = dt.date.today().isoformat()
            if ch.get("id") == daily_challenge()["id"] and \
               self.game.state.get("daily_done", {}).get("date") != today:
                bonus = 25
                self.game.state["daily_done"] = {"date": today, "id": cid}
            total = self.game.add_xp(xp + bonus, combo=self._combo)
            self.game.state["coins"] = int(self.game.state.get("coins", 0)) + max(1, total // 10)
            self._check_badges()
            self.game.save()
            self._refresh_profile_ui()
            self._refresh_challenges_ui()
            self._refresh_badges_ui()
            self._show_toast("🎯 تحدي خلص!", f"+{total} XP" + (f" (منهم {bonus} بونص يومي)" if bonus else ""))
            self._append_chat("🎯 التحدي", f"مبروك! خلصت {ch['title']} وكسبت {total} XP.", "win")
            self._confetti()
        except Exception:
            pass

    def _check_badges(self, prompt: str = "", duration: float = 0.0) -> None:
        try:
            s = self.game.state
            hour = dt.datetime.now().hour
            to_unlock: List[str] = []

            if int(s.get("total_success", 0)) >= 1:
                to_unlock.append("first_code")
            if int(s.get("runs", 0)) >= 1:
                to_unlock.append("first_run")
            if int(s.get("heal_wins", 0)) >= 1:
                to_unlock.append("first_heal")
            if int(s.get("heal_wins", 0)) >= 5:
                to_unlock.append("heal_master")
            if int(s.get("best_combo", 0)) >= 5:
                to_unlock.append("combo_5")
            if int(s.get("best_combo", 0)) >= 10:
                to_unlock.append("combo_10")
            if self.game.level >= 5:
                to_unlock.append("level_5")
            if self.game.level >= 10:
                to_unlock.append("level_10")
            if len(s.get("challenges_done", [])) >= 1:
                to_unlock.append("challenge_1")
            if len(s.get("challenges_done", [])) >= 5:
                to_unlock.append("challenge_5")
            if int(s.get("streak", 0)) >= 3:
                to_unlock.append("streak_3")
            if int(s.get("streak", 0)) >= 7:
                to_unlock.append("streak_7")
            if 0 <= hour < 5:
                to_unlock.append("night_owl")
            if 5 <= hour < 8:
                to_unlock.append("early_bird")
            if int(s.get("copies", 0)) >= 10:
                to_unlock.append("copier")
            if int(s.get("total_success", 0)) >= 100:
                to_unlock.append("centurion")
            if duration and 0 < duration < 15.0:
                to_unlock.append("speed_demon")
            if prompt and _has_arabic(prompt):
                to_unlock.append("arabic_coder")

            unlocked_any = False
            for bid in to_unlock:
                meta = self.game.unlock(bid)
                if meta:
                    unlocked_any = True
                    self._show_toast(f"{meta['icon']} {meta['title']}", meta["desc"])
                    self._append_chat(
                        "🏅 إنجاز جديد",
                        f"{meta['icon']} {meta['title']} — {meta['desc']}",
                        "win",
                    )
            if unlocked_any:
                self._play_sound("level")
        except Exception:
            pass

    def _on_error(self, message: str, traceback_text: str = "") -> None:
        self._set_busy(False)
        self._append_chat("❌ خطأ", message, "error")
        if traceback_text:
            self._append_output(traceback_text, "err")
        self._set_status("❌ حصل خطأ", ERROR)
        self._play_sound("error")


if __name__ == "__main__":
    app = Wa3iCoderUI()
    app.mainloop()