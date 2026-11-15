import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)

from pasmagology_render import render_html

with open(os.path.join(ROOT, "_trial_game.json"), encoding="utf-8") as f:
    game = json.load(f)

html = render_html(game)
out = os.path.join(ROOT, "test_render_real.html")
with open(out, "w", encoding="utf-8") as f:
    f.write(html)

print(f"✅ {out} ({len(html)//1024} KB)")

assert "<script src=" not in html, "EXTERNAL SCRIPT FOUND"
clean_html = html.replace("http://localhost", "").replace("http://www.w3.org/2000/svg", "")
assert "http://" not in clean_html, "EXTERNAL URL FOUND"
assert "https://" not in html, "EXTERNAL URL FOUND"
assert "المصطلحات الأساسية" in html, "GLOSSARY SECTION MISSING"
print("✅ Smoke checks passed")
