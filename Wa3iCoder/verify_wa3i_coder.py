"""Wa3i Coder verification harness — 9 stages, exit 0 = all green.

Run from the Wa3iCoder folder:
    python verify_wa3i_coder.py
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
import time
from unittest import mock

HERE = os.path.dirname(os.path.abspath(__file__))
PARENT = os.path.dirname(HERE)
if HERE not in sys.path:
    sys.path.insert(0, HERE)

RESULTS: list = []


def _record(name: str, ok: bool, detail: str = "") -> None:
    RESULTS.append((name, "PASS" if ok else "FAIL", detail))
    print(("✅ " if ok else "❌ ") + name + (f" — {detail}" if detail and not ok else ""))


def check(name: str):
    def deco(fn):
        try:
            fn()
            _record(name, True)
        except Exception as exc:
            _record(name, False, f"{type(exc).__name__}: {exc}")
        return fn
    return deco


# ---------------------------------------------------------------- Stage 0
@check("Stage 0: files exist & compile")
def stage0():
    here_files = ["Wa3iCoderCore.py", "Wa3iCoderGamify.py", "Wa3iCoderUI.py", "run_wa3i_coder.py"]
    for name in here_files:
        path = os.path.join(HERE, name)
        assert os.path.exists(path), f"missing {name} in {HERE}"

    req_here = os.path.join(HERE, "requirements.txt")
    req_parent = os.path.join(PARENT, "requirements.txt")
    assert os.path.exists(req_here) or os.path.exists(req_parent), \
        f"requirements.txt not found in {HERE} or {PARENT}"

    for name in here_files:
        r = subprocess.run(
            [sys.executable, "-m", "py_compile", os.path.join(HERE, name)],
            capture_output=True, text=True,
        )
        assert r.returncode == 0, f"{name} py_compile failed: {r.stderr}"


# ---------------------------------------------------------------- Stage 1
@check("Stage 1: XP / level math")
def stage1():
    from Wa3iCoderGamify import xp_for_level, level_for_xp, MAX_LEVEL
    assert xp_for_level(1) == 0
    assert xp_for_level(2) == 100
    assert xp_for_level(3) == 300
    assert level_for_xp(0) == 1
    assert level_for_xp(99) == 1
    assert level_for_xp(100) == 2
    assert level_for_xp(299) == 2
    assert level_for_xp(300) == 3
    prev = -1
    for lvl in range(1, 25):
        v = xp_for_level(lvl)
        assert v > prev, f"non-monotonic at level {lvl}"
        prev = v
    assert xp_for_level(MAX_LEVEL + 5) == xp_for_level(MAX_LEVEL)


# ---------------------------------------------------------------- Stage 2
@check("Stage 2: profile save/load/streak")
def stage2():
    from Wa3iCoderGamify import GameProfile
    import datetime as dt
    with tempfile.TemporaryDirectory() as tmp:
        p = os.path.join(tmp, "prof.json")
        g = GameProfile(path=p)
        g.state["xp"] = 250
        g.state["last_active"] = (dt.date.today() - dt.timedelta(days=1)).isoformat()
        g.state["streak"] = 4
        assert g.save()
        g2 = GameProfile.load(p)
        assert g2.state["xp"] == 250
        assert g2.state["streak"] == 4
        g2.touch_day()
        assert g2.state["streak"] == 5, f"expected 5, got {g2.state['streak']}"
        g2.state["last_active"] = (dt.date.today() - dt.timedelta(days=5)).isoformat()
        g2.state["streak"] = 9
        g2.touch_day()
        assert g2.state["streak"] == 1, f"expected reset to 1, got {g2.state['streak']}"
        g2.touch_day()
        assert g2.state["streak"] == 1


# ---------------------------------------------------------------- Stage 3
@check("Stage 3: daily challenge determinism")
def stage3():
    from Wa3iCoderGamify import daily_challenge, CHALLENGES
    a = daily_challenge("2026-01-01")
    b = daily_challenge("2026-01-01")
    assert a["id"] == b["id"]
    assert a["id"] in {c["id"] for c in CHALLENGES}
    seen = set()
    for d in ("2026-01-01", "2026-01-02", "2026-01-03", "2026-01-04", "2026-01-05",
              "2026-01-06", "2026-01-07", "2026-01-08", "2026-01-09", "2026-01-10"):
        seen.add(daily_challenge(d)["id"])
    assert len(seen) >= 3, f"not varied enough: {seen}"


# ---------------------------------------------------------------- Stage 4
@check("Stage 4: extract_code")
def stage4():
    from Wa3iCoderCore import Wa3iCoderAgent
    a = Wa3iCoderAgent()
    assert a.extract_code("```python\nprint('hi')\n```") == "print('hi')"
    assert a.extract_code("```py\nx = 1\n```") == "x = 1"
    assert a.extract_code("```\nprint(2)\n```") == "print(2)"
    assert a.extract_code("print(3)") == "print(3)"
    assert a.extract_code("") == ""


# ---------------------------------------------------------------- Stage 5
@check("Stage 5: sandbox execution")
def stage5():
    from Wa3iCoderCore import Wa3iCoderAgent
    a = Wa3iCoderAgent()
    ok = a.execute_code("print('WA3I_OK')")
    assert ok.success and "WA3I_OK" in ok.stdout
    bad = a.execute_code("print(1/0)")
    assert not bad.success and "ZeroDivisionError" in bad.stderr
    t0 = time.time()
    to = a.execute_code("import time; time.sleep(10)", timeout=1)
    assert not to.success and (time.time() - t0) < 8.0
    uni = a.execute_code("print('مرحبا يا بطل')")
    assert uni.success and "مرحبا" in uni.stdout
    assert not a.execute_code("").success
    before = {p for p in os.listdir(tempfile.gettempdir()) if p.startswith("wa3i_sandbox_")}
    a.execute_code("print(1)")
    after = {p for p in os.listdir(tempfile.gettempdir()) if p.startswith("wa3i_sandbox_")}
    assert before == after, "temp sandbox leaked"


# ---------------------------------------------------------------- Stage 6
@check("Stage 6: auto-heal with fake LLM")
def stage6():
    from Wa3iCoderCore import Wa3iCoderAgent
    a = Wa3iCoderAgent()
    broken = "print(undefined_name)"
    fixed = "try:\n    print(undefined_name)\nexcept NameError:\n    print('handled')"
    with mock.patch.object(a, "generate_code", return_value=fixed):
        _, result, attempts = a.self_heal(broken, "NameError", max_attempts=2)
    assert result.success and "handled" in result.stdout
    assert len(attempts) >= 1
    with mock.patch.object(a, "generate_code", return_value="print(1/0)"):
        _, r2, a2 = a.self_heal("print(1/0)", "ZeroDivisionError", max_attempts=2)
    assert not r2.success and len(a2) == 2
    with mock.patch.object(a, "generate_code", side_effect=["print(1/0)", "print('FIXED')"]):
        out = a.generate_and_test("say FIXED", max_heal=2)
    assert out["result"].success and out["healed"] and "FIXED" in out["result"].stdout


# ---------------------------------------------------------------- Stage 7
@check("Stage 7: challenge evaluator")
def stage7():
    from Wa3iCoderCore import Wa3iCoderAgent, ExecutionResult
    from Wa3iCoderGamify import evaluate_challenge, CHALLENGES
    a = Wa3iCoderAgent()
    sum100 = next(c for c in CHALLENGES if c["id"] == "sum100")
    assert evaluate_challenge(sum100, a.execute_code("print(sum(range(1,101)))")) is True
    assert evaluate_challenge(sum100, a.execute_code("print(1)")) is False
    assert evaluate_challenge(sum100, ExecutionResult(success=False)) is False
    assert evaluate_challenge(sum100, None) is False


# ---------------------------------------------------------------- Stage 8
@check("Stage 8: hub registry")
def stage8():
    hub = os.path.join(PARENT, "Wa3iHub.py")
    if not os.path.exists(hub):
        print("   (Wa3iHub.py not found at repo root — skipped)")
        return
    with open(hub, "r", encoding="utf-8", errors="replace") as fh:
        src = fh.read().lower()
    assert "apps" in src or "registry" in src


# ---------------------------------------------------------------- Stage 9
@check("Stage 9: UI smoke")
def stage9():
    try:
        import customtkinter  # noqa: F401
    except Exception:
        print("   (customtkinter not installed — skipped)")
        return
    from Wa3iCoderUI import Wa3iCoderUI
    with tempfile.TemporaryDirectory() as tmp:
        os.environ["WA3I_CODER_PROFILE"] = os.path.join(tmp, "prof.json")
        app = Wa3iCoderUI()
        app.update_idletasks()
        app.update()
        assert "💬 الشات" in app.tabs._tab_dict
        assert "🎯 التحديات" in app.tabs._tab_dict
        assert "🏅 الإنجازات" in app.tabs._tab_dict
        assert "📚 مكتبة الأكواد" in app.tabs._tab_dict
        assert app.level_badge.cget("text").startswith("Lv")
        app.destroy()


# ---------------------------------------------------------------- report
def main() -> int:
    print("=" * 60)
    print("Wa3i Coder — verification harness")
    print(f"folder: {HERE}")
    print("=" * 60)
    failures = [r for r in RESULTS if r[1] == "FAIL"]
    print()
    print(f"PASS: {len(RESULTS) - len(failures)} / {len(RESULTS)}")
    if failures:
        print("FAILED:")
        for n, _, d in failures:
            print(f"  - {n} — {d}")
    print("=" * 60)
    try:
        with open(os.path.join(HERE, "verify_report.json"), "w", encoding="utf-8") as fh:
            json.dump([{"name": n, "status": s, "detail": d} for n, s, d in RESULTS],
                      fh, ensure_ascii=False, indent=2)
    except Exception:
        pass
    return 0 if not failures else 1


if __name__ == "__main__":
    raise SystemExit(main())