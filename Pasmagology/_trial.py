"""First trial — prove RAG + Core pipeline works end-to-end with a synthetic PDF.
Run:  python Pasmagology\_trial.py
"""
import json
import os
import sys
import time
import traceback

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
sys.path.insert(0, ROOT)

# TRIAL SETTINGS (set small for fast CPU execution)
TRY_LEVEL = {
    "cards": 2,
    "formulas": 1,
    "battle_cats": 2,
    "exam": 3
}

# ---- 1. Ollama preflight ------------------------------------------------
print("=" * 60)
print("STEP 1: Ollama preflight")
print("=" * 60)
try:
    import requests
    r = requests.get("http://localhost:11434/api/tags", timeout=3)
    r.raise_for_status()
    models = [m["name"] for m in r.json().get("models", [])]
    print(f"✅ Ollama reachable — {len(models)} models")
    for m in models[:8]:
        print(f"   • {m}")
    has_1_5b = any("1.5b" in m for m in models)
    if not has_1_5b:
        print(f"\n❌ qwen2.5:1.5b is NOT pulled.")
        print(f"   Run:  ollama pull qwen2.5:1.5b")
        print(f"   Then re-run this trial.")
        sys.exit(1)
    print("✅ qwen2.5:1.5b is available")
except Exception as exc:
    print(f"❌ Ollama preflight failed: {exc}")
    print("   Make sure Ollama is running:  ollama serve")
    sys.exit(1)

# ---- 2. Build a small test PDF -----------------------------------------
print("\n" + "=" * 60)
print("STEP 2: Build test PDF")
print("=" * 60)
try:
    import pymupdf
except ImportError:
    print("❌ pymupdf not installed. Run:  python -m pip install pymupdf")
    sys.exit(1)

test_pdf = os.path.join(ROOT, "_trial_envchem.pdf")
doc = pymupdf.open()

page1 = doc.new_page()
rect1 = pymupdf.Rect(50, 50, 550, 800)
page1.insert_textbox(rect1, """Air Pollution — Lecture 1

The atmosphere has 5 layers. The troposphere contains 78% N2, 21% O2,
0.93% Argon, and 0.03% CO2.

The stratosphere has the ozone layer which absorbs UV radiation.

CO binds to hemoglobin with 240x more affinity than O2.

Particulate matter PM2.5 is 2.5 micrometers or smaller and penetrates
deep into the lungs. PM10 is 10 micrometers or smaller.

The 1952 London Smog killed approximately 4000 people.

NAAQS standards: CO 8-hour = 9 ppm, Ozone 8-hour = 0.070 ppm,
PM2.5 annual = 9.0 ug/m3, Lead = 0.15 ug/m3.
""", fontsize=11)

page2 = doc.new_page()
rect2 = pymupdf.Rect(50, 50, 550, 800)
page2.insert_textbox(rect2, """Water Pollution — Lecture 2

Eutrophication is caused by excess phosphorus and nitrogen from detergents
and fertilizers. Phosphorus is the limiting nutrient in most freshwater.

BOD (Biochemical Oxygen Demand) measures oxygen consumed by microorganisms
over 5 days.

Lead is a heavy metal that causes brain damage in children.

Mercury in water is methylated by bacteria to methylmercury, which
bioaccumulates 1000x or more in fish tissue.

The oxygen sag curve has 4 zones: Clean, Decomposition, Septic, Recovery.
""", fontsize=11)

doc.save(test_pdf)
doc.close()
print(f"✅ Test PDF created: {test_pdf}")

# ---- 3. RAG test -------------------------------------------------------
print("\n" + "=" * 60)
print("STEP 3: RAG extraction")
print("=" * 60)
from pasmagology_rag import PasmagologyRAG

t0 = time.time()
rag = PasmagologyRAG.from_pdf(test_pdf)
dt = time.time() - t0
print(f"✅ Pages: {len(rag.pages)} | Chunks: {len(rag.chunks)} | Index size: {len(rag.inverted_index)} | Time: {dt:.2f}s")

if not rag.chunks:
    print("❌ RAG returned zero chunks — extraction failed")
    sys.exit(1)

# ---- 4. Full pipeline with Batched Multi-Call Generation --------------
print("\n" + "=" * 60)
print("STEP 4: Full Batched generate_game()")
print("=" * 60)
from pasmagology_core import PasmagologyCore

core = PasmagologyCore()
t0 = time.time()

try:
    game = core.generate_game(
        test_pdf,
        age_band="10-12",
        language="ar",
        cards_n=TRY_LEVEL["cards"],
        formulas_n=TRY_LEVEL["formulas"],
        battle_cats=TRY_LEVEL["battle_cats"],
        exam_n=TRY_LEVEL["exam"]
    )
    dt = time.time() - t0
    print(f"\n✅ Generated in {dt:.1f}s")
    print(f"   cards:    {len(game['cards'])}")
    print(f"   formulas: {len(game['formulas'])}")
    print(f"   battle:   {len(game['battle'])}")
    print(f"   exam:     {len(game['exam'])}")
    print(f"   glossary: {len(game['glossary'])}")
    print(f"   title:    {game['meta']['title']}")

    out_path = os.path.join(ROOT, "_trial_game.json")
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(game, fh, ensure_ascii=False, indent=2)
    print(f"   → saved to {out_path}")
    print("\n✅ TRIAL PASSED — game_json ready for render.")
except Exception as exc:
    print(f"\n⚠️ TRIAL PARTIAL / FAILED — {type(exc).__name__}: {exc}")
    traceback.print_exc()
    sys.exit(1)
