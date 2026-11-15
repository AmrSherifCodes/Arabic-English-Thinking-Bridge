#!/usr/bin/env python3
"""
Pasmagology Orchestrator
------------------------
CLI: python Pasmagology/pasmagology.py <input.pdf> [--age 10-12] [--lang ar] [--preview] [--fast]
"""

import argparse
import os
import re
import sys
import webbrowser

import requests

OLLAMA_URL = "http://localhost:11434/api/tags"
MODEL_NAME = "qwen2.5:1.5b"


def fail(bilingual_lines, code=1):
    for line in bilingual_lines:
        print(line, file=sys.stderr)
    sys.exit(code)


def preflight(pdf_path):
    # Ollama reachable?
    try:
        r = requests.get(OLLAMA_URL, timeout=3)
        r.raise_for_status()
        models = r.json().get("models", [])
    except requests.exceptions.ConnectionError:
        fail([
            "❌ Ollama مش شغال — شغّل `ollama serve` ثم حاول تاني",
            "❌ Ollama not running. Run `ollama serve` first.",
        ])
    except Exception:
        fail([
            "❌ مش قادر أوصل لـ Ollama — تأكد إنه شغال",
            "❌ Cannot reach Ollama. Make sure it is running.",
        ])

    if not any(MODEL_NAME in m.get("name", "") for m in models):
        fail([
            f"❌ الموديل {MODEL_NAME} مش موجود — نفذ `ollama pull {MODEL_NAME}`",
            f"❌ Model {MODEL_NAME} not found. Run `ollama pull {MODEL_NAME}`.",
        ])

    # PDF exists and is valid?
    if not os.path.isfile(pdf_path):
        fail([
            f"❌ الملف مش موجود: {pdf_path}",
            f"❌ File not found: {pdf_path}",
        ])
    if not pdf_path.lower().endswith(".pdf"):
        fail([
            f"❌ الملف مش PDF صالح: {pdf_path}",
            f"❌ Not a valid PDF: {pdf_path}",
        ])


def slugify(path):
    base = os.path.splitext(os.path.basename(path))[0]
    slug = base.lower().replace(" ", "_")
    slug = re.sub(r"[^a-z0-9_]", "", slug)
    return slug or "game"


def ensure_unique(path):
    if not os.path.exists(path):
        return path
    root, ext = os.path.splitext(path)
    i = 2
    while os.path.exists(f"{root}-{i}{ext}"):
        i += 1
    return f"{root}-{i}{ext}"


def main():
    parser = argparse.ArgumentParser(description="Pasmagology orchestrator")
    parser.add_argument("input_pdf", help="Path to input PDF")
    parser.add_argument("--age", default="10-12")
    parser.add_argument("--lang", default="ar")
    parser.add_argument("--preview", action="store_true", help="Open generated HTML in browser")
    parser.add_argument("--fast", action="store_true", help="Use trial counts (2/1/10/3)")
    parser.add_argument("--outdir", default="Pasmagology/games")
    args = parser.parse_args()

    try:
        preflight(args.input_pdf)

        os.makedirs(args.outdir, exist_ok=True)

        # Import core lazily so preflight failures don't trigger heavy imports
        from pasmagology_core import PasmagologyCore
        from pasmagology_render import render_html

        core = PasmagologyCore()
        game = core.generate_game(
            args.input_pdf,
            age_band=args.age,
            language=args.lang,
            cards_n=2 if args.fast else 6,
            formulas_n=1 if args.fast else 3,
            battle_cats=2 if args.fast else 5,
            exam_n=3 if args.fast else 15,
        )

        html = render_html(game)

        slug = slugify(args.input_pdf)
        out_path = ensure_unique(os.path.join(args.outdir, f"{slug}.html"))
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(html)

        size_kb = len(html) // 1024
        cards_n = len(game.get("cards", []))
        forms_n = len(game.get("formulas", []))
        battle_n = len(game.get("battle", []))
        exam_n = len(game.get("exam", []))

        print(f"✅ Cards: {cards_n} | Formulas: {forms_n} | Battle: {battle_n} | Exam: {exam_n} | Size: {size_kb} KB")
        print(f"🎮 Game ready: {os.path.abspath(out_path)}")
        print("📱 Transfer to phone via WhatsApp / Telegram")
        print("📴 Works 100% offline — no internet needed after transfer")

        if args.preview:
            try:
                webbrowser.open("file:///" + os.path.abspath(out_path).replace("\\", "/"))
            except Exception:
                pass

        sys.exit(0)

    except Exception as e:
        reason = str(e)[:200]
        fail([
            f"❌ فشل غير متوقع: {reason}",
            f"❌ Unexpected failure: {reason}",
        ])


if __name__ == "__main__":
    main()
