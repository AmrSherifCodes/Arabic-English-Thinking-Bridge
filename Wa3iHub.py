"""Wa3iHub — smart launcher. Auto-discovers apps, glob-resolves paths, allows import."""
from __future__ import annotations

import glob
import json
import os
import subprocess
import sys
import time
import tkinter as tk
from pathlib import Path
from tkinter import filedialog, messagebox

import customtkinter as ctk

HERE = Path(__file__).resolve().parent
REGISTRY = HERE / "apps_registry.json"

SEARCH_DIRS = [Path.home() / "Desktop", Path.home() / "Downloads", Path.home() / "Documents"]

KNOWN_APPS: list[dict] = [
    {
        "id": "wa3i_coder", "icon": "🧠", "name": "Wa3i Coder",
        "desc": "مساعدك المصري للبرمجة — أوفلاين",
        "entry": "Wa3iCoder/run_wa3i_coder.py", "type": "python",
        "globs": ["Wa3iCoder/run_*.py"],
    },
    {
        "id": "pasmagology", "icon": "🎮", "name": "Pasmagology",
        "desc": "حوّل أي PDF إلى لعبة تفاعلية",
        "entry": "Pasmagology/run_pasmagology.py", "type": "python",
        "globs": ["Pasmagology/run_*.py", "Pasmagology/landing/index.html"],
        "coming_soon": True,
    },
    {
        "id": "envchem", "icon": "⚗️", "name": "EnvChem Blitz",
        "desc": "لعبة كيمياء بيئية ثنائية اللغة",
        "entry": "EnvChem Blitz_ 90-Min Exam & Colleague Battle Arena.html", "type": "html",
        "globs": ["*EnvChem*.html", "EnvChem*.html", "**/*EnvChem*.html"],
    },
    {
        "id": "wa3i_cinema", "icon": "🎬", "name": "Wa3i Cinema",
        "desc": "استوديو السينما الإسكندرية",
        "entry": "Wa3iCinema.py", "type": "python",
        "globs": ["Wa3iCinema.py", "Wa3iCinema/**/*.py", "**/Wa3iCinema.py"],
        "coming_soon": True,
    },
]

STATUS_LABEL = {
    "ready":         ("✓ جاهز",                 "#7CFFB2"),
    "found_nearby":  ("📂 لقيته في مكان تاني", "#FFD700"),
    "coming_soon":   ("⏳ قيد البناء",            "#B8C7FF"),
    "missing":       ("⚠ مش موجود",             "#FF6B6B"),
}


def _load_registry() -> list[dict]:
    try:
        if REGISTRY.exists():
            data = json.loads(REGISTRY.read_text(encoding="utf-8"))
            if isinstance(data, list) and data:
                return data
    except Exception:
        pass
    return []


def _save_registry(apps: list[dict]) -> None:
    try:
        REGISTRY.write_text(json.dumps(apps, ensure_ascii=False, indent=2), encoding="utf-8")
    except Exception:
        pass


def _resolve(app: dict) -> tuple[str | None, str]:
    """Return (absolute_path_or_None, status_key)."""
    # 1. persisted resolved path
    saved = app.get("resolved_path")
    if saved and os.path.isfile(saved):
        return saved, "ready"

    # 2. hard-coded entry
    entry = app.get("entry", "")
    if entry:
        p = HERE / entry
        if p.exists():
            return str(p), "ready"

    # 3. globs inside repo
    for pat in app.get("globs", []):
        for m in glob.glob(str(HERE / pat), recursive=True):
            if os.path.isfile(m):
                return m, "found_nearby"

    # 4. globs in user's Desktop/Downloads/Documents
    for base in SEARCH_DIRS:
        if not base.exists():
            continue
        for pat in app.get("globs", []):
            clean = pat.replace("**/", "")
            for m in glob.glob(str(base / clean), recursive=True):
                if os.path.isfile(m):
                    return m, "found_nearby"
        # last-resort fuzzy: first token of the id
        if app.get("id"):
            for m in base.rglob(f"*{app['id']}*"):
                if os.path.isfile(m):
                    return str(m), "found_nearby"

    if app.get("coming_soon"):
        return None, "coming_soon"
    return None, "missing"


def _discover_apps(known_ids: set[str]) -> list[dict]:
    """Scan repo for launchable apps not in KNOWN_APPS."""
    found: list[dict] = []
    seen = set(known_ids)

    for p in HERE.glob("*/run_*.py"):
        aid = p.parent.name.lower()
        if aid in seen:
            continue
        seen.add(aid)
        found.append({
            "id": aid, "icon": "📦", "name": p.parent.name.replace("_", " ").title(),
            "desc": "تطبيق مكتشف تلقائياً",
            "entry": f"{p.parent.name}/{p.name}", "type": "python",
            "auto": True,
        })

    for p in HERE.glob("*.html"):
        aid = p.stem.lower().replace(" ", "_")[:30]
        if aid in seen or "envchem" in aid:
            continue
        seen.add(aid)
        found.append({
            "id": aid, "icon": "🌐", "name": p.stem[:42],
            "desc": "صفحة HTML مكتشفة تلقائياً",
            "entry": p.name, "type": "html", "auto": True,
        })

    return found


def _python_exe() -> str:
    exe = sys.executable or "python"
    try:
        if os.name == "nt" and exe.lower().endswith("pythonw.exe"):
            cand = exe[: -len("pythonw.exe")] + "python.exe"
            if os.path.exists(cand):
                return cand
    except Exception:
        pass
    return exe


class Wa3iHub(ctk.CTk):
    def __init__(self) -> None:
        super().__init__()
        self._fonts()
        self.apps: list[dict] = []
        self._load_all_apps()

        self.title("🏛️ Wa3i Hub — مركز التطبيقات")
        self.geometry("1220x820")
        self.minsize(980, 680)
        self.configure(fg_color="#0B132B")
        self._build_header()
        self._build_body()
        self._build_footer()
        self._render_cards()

    # ---------- data ----------
    def _load_all_apps(self) -> None:
        saved_by_id = {a["id"]: a for a in _load_registry() if isinstance(a, dict) and a.get("id")}
        base: list[dict] = []
        for known in KNOWN_APPS:
            merged = dict(known)
            if known["id"] in saved_by_id:
                if saved_by_id[known["id"]].get("resolved_path"):
                    merged["resolved_path"] = saved_by_id[known["id"]]["resolved_path"]
            base.append(merged)
        known_ids = {a["id"] for a in base}
        self.apps = base + _discover_apps(known_ids)

    def _persist(self) -> None:
        _save_registry(self.apps)

    # ---------- fonts ----------
    def _fonts(self) -> None:
        self.f_title = ctk.CTkFont(family="Segoe UI", size=30, weight="bold")
        self.f_sub = ctk.CTkFont(family="Segoe UI", size=13)
        self.f_card = ctk.CTkFont(family="Segoe UI", size=16, weight="bold")
        self.f_desc = ctk.CTkFont(family="Segoe UI", size=12)
        self.f_btn = ctk.CTkFont(family="Segoe UI", size=13, weight="bold")
        self.f_chip = ctk.CTkFont(family="Segoe UI", size=11, weight="bold")

    # ---------- header ----------
    def _build_header(self) -> None:
        header = ctk.CTkFrame(self, fg_color="#101B3B", corner_radius=0)
        header.pack(fill="x")

        inner = ctk.CTkFrame(header, fg_color="transparent")
        inner.pack(fill="x", padx=26, pady=14)

        left = ctk.CTkFrame(inner, fg_color="transparent")
        left.pack(side="left", fill="x", expand=True)
        ctk.CTkLabel(left, text="🏛️ Wa3i Hub", font=self.f_title, text_color="#FFD700").pack(anchor="w")
        ctk.CTkLabel(left, text="مركز تطبيقات واعي — كل حاجة في مكان واحد",
                     font=self.f_sub, text_color="#B8C7FF").pack(anchor="w")

        right = ctk.CTkFrame(inner, fg_color="transparent")
        right.pack(side="right")

        self.search_var = tk.StringVar()
        self.search_var.trace_add("write", lambda *_: self._render_cards())
        self.search_entry = ctk.CTkEntry(
            right, textvariable=self.search_var, width=240, height=36,
            placeholder_text="ابحث عن تطبيق...", fg_color="#0B132B",
            border_color="#26418F", text_color="#FFFFFF",
        )
        self.search_entry.pack(side="left", padx=(0, 10))

        ctk.CTkButton(
            right, text="🔄 ابحث تاني", width=110, height=36,
            fg_color="#1F2A55", hover_color="#26418F", text_color="#FFFFFF",
            font=self.f_btn, command=self._refresh_all,
        ).pack(side="left", padx=(0, 10))

        ctk.CTkButton(
            right, text="➕ استورد تطبيق", width=150, height=36,
            fg_color="#FFD700", hover_color="#E6C200", text_color="#0B132B",
            font=self.f_btn, command=self._import_app,
        ).pack(side="left")

    # ---------- body ----------
    def _build_body(self) -> None:
        self.body = ctk.CTkScrollableFrame(self, fg_color="#0B132B")
        self.body.pack(fill="both", expand=True, padx=20, pady=(18, 8))
        for c in range(2):
            self.body.grid_columnconfigure(c, weight=1)

    def _render_cards(self) -> None:
        for w in self.body.winfo_children():
            w.destroy()

        q = self.search_var.get().strip().lower()
        shown = 0
        for app in self.apps:
            if q and q not in (app.get("name", "") + app.get("desc", "") + app.get("id", "")).lower():
                continue
            path, status = _resolve(app)
            self._render_card(app, path, status, shown)
            shown += 1

        if shown == 0:
            ctk.CTkLabel(
                self.body, text="مفيش تطبيقات مطابقة للبحث",
                font=self.f_sub, text_color="#B8C7FF",
            ).grid(row=0, column=0, columnspan=2, pady=40)

    def _render_card(self, app: dict, path: str | None, status: str, idx: int) -> None:
        row, col = idx // 2, idx % 2
        card = ctk.CTkFrame(self.body, fg_color="#111C3D", corner_radius=16,
                            border_width=1, border_color="#1F2A55")
        card.grid(row=row, column=col, padx=10, pady=10, sticky="nsew")
        card.grid_columnconfigure(1, weight=1)

        # click anywhere on card (except buttons) to launch
        def _click(_e=None):
            if status in ("ready", "found_nearby"):
                self._launch(app, path)
            elif status == "coming_soon":
                self._show_coming_soon(app)
            else:
                self._locate_manually(app)
        card.bind("<Button-1>", _click)

        # icon
        icon = ctk.CTkLabel(card, text=app.get("icon", "📦"),
                            font=ctk.CTkFont(family="Segoe UI", size=42))
        icon.grid(row=0, column=0, rowspan=2, padx=(18, 12), pady=(16, 0), sticky="n")
        icon.bind("<Button-1>", _click)

        # name + desc
        name = ctk.CTkLabel(card, text=app.get("name", "App"), font=self.f_card,
                            text_color="#FFFFFF", anchor="w")
        name.grid(row=0, column=1, sticky="ew", pady=(18, 0))
        name.bind("<Button-1>", _click)

        desc = ctk.CTkLabel(card, text=app.get("desc", ""), font=self.f_desc,
                            text_color="#B8C7FF", anchor="w")
        desc.grid(row=1, column=1, sticky="ew", pady=(0, 4))
        desc.bind("<Button-1>", _click)

        # status chip
        label, color = STATUS_LABEL[status]
        chip = ctk.CTkLabel(card, text=label, font=self.f_chip, text_color=color, anchor="w")
        chip.grid(row=2, column=1, sticky="w", padx=(0, 6))
        chip.bind("<Button-1>", _click)

        # resolved path (only when found_nearby)
        if status == "found_nearby" and path:
            tail = "…" + path[-42:] if len(path) > 42 else path
            pth = ctk.CTkLabel(card, text=tail, font=self.f_chip, text_color="#8FA7D0", anchor="w")
            pth.grid(row=3, column=0, columnspan=2, sticky="w", padx=(18, 6), pady=(2, 4))
            pth.bind("<Button-1>", _click)

        # action row
        actions = ctk.CTkFrame(card, fg_color="transparent")
        actions.grid(row=4, column=0, columnspan=2, sticky="ew", padx=16, pady=(4, 16))

        if status in ("ready", "found_nearby"):
            ctk.CTkButton(
                actions, text="🚀 افتح", height=36, font=self.f_btn,
                fg_color="#FFD700", hover_color="#E6C200", text_color="#0B132B",
                command=lambda a=app, p=path: self._launch(a, p),
            ).pack(side="left", fill="x", expand=True)
        elif status == "coming_soon":
            ctk.CTkButton(
                actions, text="📋 إيه المطلوب عشان يشتغل؟", height=36, font=self.f_btn,
                fg_color="#1F2A55", hover_color="#26418F", text_color="#FFFFFF",
                command=lambda a=app: self._show_coming_soon(a),
            ).pack(side="left", fill="x", expand=True)
        else:  # missing
            ctk.CTkButton(
                actions, text="📁 دوّر علي الملف", height=36, font=self.f_btn,
                fg_color="#1F2A55", hover_color="#26418F", text_color="#FFFFFF",
                command=lambda a=app: self._locate_manually(a),
            ).pack(side="left", fill="x", expand=True, padx=(0, 6))
            ctk.CTkButton(
                actions, text="🗑️", width=44, height=36, font=self.f_btn,
                fg_color="#2A1220", hover_color="#3D1A2E", text_color="#FF6B6B",
                command=lambda a=app: self._remove_app(a),
            ).pack(side="left")

    # ---------- actions ----------
    def _launch(self, app: dict, path: str | None) -> None:
        if not path or not os.path.exists(path):
            self._locate_manually(app)
            return
        try:
            if app.get("type") == "html":
                if os.name == "nt":
                    os.startfile(path)  # noqa: S606
                else:
                    subprocess.Popen(["xdg-open", path])
            else:
                flags = getattr(subprocess, "CREATE_NO_WINDOW", 0) if os.name == "nt" else 0
                subprocess.Popen([_python_exe(), path],
                                 cwd=os.path.dirname(path) or str(HERE),
                                 creationflags=flags)
        except Exception as exc:
            messagebox.showerror("Wa3i Hub", f"مقدرتش أفتح التطبيق:\n{exc}")

    def _show_coming_soon(self, app: dict) -> None:
        messagebox.showinfo(
            "⏳ قيد البناء",
            f"«{app.get('name', app['id'])}» لسه مش متبني.\n\n"
            f"المسار المتوقع:\n{HERE / app.get('entry', '')}\n\n"
            f"اطلب من واعي في المحادثة الجاية يبنيه — "
            f"وبعدها التطبيق هيظهر جاهز هنا تلقائياً."
        )

    def _locate_manually(self, app: dict) -> None:
        initial = str(Path.home() / "Downloads")
        path = filedialog.askopenfilename(
            title=f"حدد ملف «{app.get('name', app['id'])}»",
            initialdir=initial if os.path.isdir(initial) else str(HERE),
            filetypes=[("All files", "*.*"),
                       ("HTML", "*.html"), ("Python", "*.py")],
        )
        if not path:
            return
        app["resolved_path"] = path
        self._persist()
        self._render_cards()

    def _remove_app(self, app: dict) -> None:
        if not messagebox.askyesno("Wa3i Hub", f"أشيل «{app.get('name', app['id'])}» من القائمة؟"):
            return
        self.apps = [a for a in self.apps if a.get("id") != app.get("id")]
        self._persist()
        self._render_cards()

    def _import_app(self) -> None:
        path = filedialog.askopenfilename(
            title="اختار ملف تطبيق",
            initialdir=str(HERE),
            filetypes=[("Launchable", "*.py *.html"), ("All files", "*.*")],
        )
        if not path:
            return
        p = Path(path)
        kind = "python" if p.suffix.lower() == ".py" else "html"
        new_app = {
            "id": p.stem.lower().replace(" ", "_")[:40],
            "icon": "📦",
            "name": p.stem[:42],
            "desc": f"مضاف يدوياً من {p.parent.name}/",
            "entry": str(p) if p.is_absolute() else str(p.relative_to(HERE)),
            "type": kind,
            "resolved_path": str(p),
            "auto": True,
        }
        if any(a.get("id") == new_app["id"] for a in self.apps):
            messagebox.showwarning("Wa3i Hub", "تطبيق بنفس الاسم موجود بالفعل")
            return
        self.apps.append(new_app)
        self._persist()
        self._render_cards()

    def _refresh_all(self) -> None:
        for app in self.apps:
            path, status = _resolve(app)
            if status == "ready" and path:
                app["resolved_path"] = path
        self._persist()
        self._load_all_apps()
        self._render_cards()

    # ---------- footer ----------
    def _build_footer(self) -> None:
        bar = ctk.CTkFrame(self, fg_color="#101B3B", corner_radius=0)
        bar.pack(fill="x", side="bottom")

        ready = sum(1 for a in self.apps if _resolve(a)[1] in ("ready", "found_nearby"))
        total = len(self.apps)
        coming = sum(1 for a in self.apps if _resolve(a)[1] == "coming_soon")
        missing = total - ready - coming

        summary = f"✓ {ready} جاهز   •   ⏳ {coming} قيد البناء   •   ⚠ {missing} مفقود"
        ctk.CTkLabel(bar, text=summary, font=self.f_sub, text_color="#B8C7FF")\
            .pack(side="left", padx=20, pady=8)
        ctk.CTkLabel(bar, text=f"Wa3i Prime • Alexandria • أوفلاين 100%  •  {time.strftime('%H:%M')}",
                     font=self.f_sub, text_color="#6E7FA8").pack(side="right", padx=20, pady=8)


if __name__ == "__main__":
    Wa3iHub().mainloop()