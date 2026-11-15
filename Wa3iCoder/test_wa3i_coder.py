"""Wa3i Coder — line-by-line test suite. Run: python test_wa3i_coder.py -v"""
from __future__ import annotations

import io
import os
import sys
import tempfile
import time
import unittest
from contextlib import redirect_stdout, redirect_stderr
from unittest import mock

HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path:
    sys.path.insert(0, HERE)

from Wa3iCoderCore import (
    ExecutionResult,
    Wa3iCoderAgent,
    MAX_OUTPUT_CHARS,
    _kill_tree,
)


def _new_agent(**kw) -> Wa3iCoderAgent:
    return Wa3iCoderAgent(**kw)


class TestOllamaHelpers(unittest.TestCase):
    def test_is_online_returns_bool(self):
        a = _new_agent()
        self.assertIsInstance(a.is_online(), bool)

    def test_list_models_returns_list(self):
        a = _new_agent()
        models = a.list_models()
        self.assertIsInstance(models, list)
        for m in models:
            self.assertIsInstance(m, str)

    def test_request_retry(self):
        """_request must retry on ConnectionError then succeed."""
        import requests

        a = _new_agent()
        calls = {"n": 0}

        class FakeResp:
            status_code = 200
            def raise_for_status(self): pass
            def json(self): return {"ok": True}

        def fake_post(*args, **kwargs):
            calls["n"] += 1
            if calls["n"] < 3:
                raise requests.exceptions.ConnectionError("boom")
            return FakeResp()

        with mock.patch("Wa3iCoderCore.requests.request", side_effect=fake_post):
            resp = a._request("POST", "/api/chat", json={}, retries=3)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(calls["n"], 3)


class TestExtractCode(unittest.TestCase):
    def setUp(self):
        self.a = _new_agent()

    def test_extract_code_python_fence(self):
        raw = "blah\n```python\nprint('hi')\n```\ntail"
        self.assertEqual(self.a.extract_code(raw), "print('hi')")

    def test_extract_code_bare_fence(self):
        raw = "```\nx = 1\n```"
        self.assertEqual(self.a.extract_code(raw), "x = 1")

    def test_extract_code_plain(self):
        self.assertEqual(self.a.extract_code("print(1)"), "print(1)")

    def test_extract_code_empty(self):
        self.assertEqual(self.a.extract_code(""), "")


class TestExecution(unittest.TestCase):
    def setUp(self):
        self.a = _new_agent()

    def test_execute_code_success(self):
        r = self.a.execute_code("print('WA3I_OK')")
        self.assertTrue(r.success, msg=r.stderr)
        self.assertIn("WA3I_OK", r.stdout)
        self.assertEqual(r.returncode, 0)

    def test_execute_code_failure(self):
        r = self.a.execute_code("print(1/0)")
        self.assertFalse(r.success)
        self.assertIn("ZeroDivisionError", r.stderr)
        self.assertNotEqual(r.returncode, 0)

    def test_execute_code_timeout(self):
        t0 = time.time()
        r = self.a.execute_code("import time\ntime.sleep(10)", timeout=1)
        dt = time.time() - t0
        self.assertFalse(r.success)
        self.assertLess(dt, 8.0, "timeout should kill within a few seconds")
        self.assertIn("timeout", r.stderr.lower() + " timeout")

    def test_execute_code_empty(self):
        r = self.a.execute_code("")
        self.assertFalse(r.success)
        self.assertIn("مفيش كود", r.stderr)

    def test_execute_code_unicode(self):
        r = self.a.execute_code("print('مرحبا يا باشمهندس')")
        self.assertTrue(r.success, msg=r.stderr)
        self.assertIn("مرحبا", r.stdout)

    def test_execute_code_truncation(self):
        r = self.a.execute_code("print('x' * 100000)")
        self.assertTrue(r.success)
        self.assertTrue(r.truncated)
        self.assertLessEqual(len(r.stdout), MAX_OUTPUT_CHARS + 500)

    def test_no_temp_leak(self):
        before = {p for p in os.listdir(tempfile.gettempdir()) if p.startswith("wa3i_sandbox_")}
        self.a.execute_code("print(1)")
        after = {p for p in os.listdir(tempfile.gettempdir()) if p.startswith("wa3i_sandbox_")}
        self.assertEqual(before, after)

    def test_summary_success_and_fail(self):
        ok = ExecutionResult(success=True, stdout="hi", duration=0.1)
        bad = ExecutionResult(success=False, stderr="err", returncode=1, duration=0.1)
        self.assertIn("✅", ok.summary())
        self.assertIn("❌", bad.summary())


class TestSelfHeal(unittest.TestCase):
    def setUp(self):
        self.a = _new_agent()

    def test_self_heal_mock(self):
        broken = "print(undefined_name)"
        fixed = "try:\n    print(undefined_name)\nexcept NameError:\n    print('handled')"
        with mock.patch.object(self.a, "generate_code", return_value=fixed):
            code, result, attempts = self.a.self_heal(broken, "NameError: name 'undefined_name' is not defined", max_attempts=2)
        self.assertTrue(result.success, msg=result.stderr)
        self.assertIn("handled", result.stdout)
        self.assertTrue(len(attempts) >= 1)

    def test_self_heal_exhausted(self):
        broken = "print(1/0)"
        with mock.patch.object(self.a, "generate_code", return_value="print(1/0)"):
            code, result, attempts = self.a.self_heal(broken, "ZeroDivisionError", max_attempts=2)
        self.assertFalse(result.success)
        self.assertEqual(len(attempts), 2)


class TestGenerateAndTest(unittest.TestCase):
    def setUp(self):
        self.a = _new_agent()

    def test_generate_and_test_ok(self):
        with mock.patch.object(self.a, "generate_code", return_value="print('OK')"):
            out = self.a.generate_and_test("say OK", max_heal=2)
        self.assertTrue(out["result"].success)
        self.assertFalse(out["healed"])
        self.assertEqual(out["attempts"], [])

    def test_generate_and_test_heals(self):
        with mock.patch.object(
            self.a, "generate_code",
            side_effect=["print(1/0)", "print('FIXED')"],
        ):
            out = self.a.generate_and_test("say FIXED", max_heal=2)
        self.assertTrue(out["result"].success)
        self.assertTrue(out["healed"])
        self.assertIn("FIXED", out["result"].stdout)


class TestLiveOllama(unittest.TestCase):
    def test_live_ollama_chat(self):
        a = _new_agent()
        if not a.is_online():
            self.skipTest("Ollama offline")
        if not any(a.model in m or m.startswith(a.model) for m in a.list_models()):
            self.skipTest(f"model {a.model} not pulled")
        reply = a._chat([{"role": "user", "content": "Reply with the single word: PONG"}], num_predict=8)
        self.assertIsInstance(reply, str)
        self.assertGreater(len(reply.strip()), 0)


class TestUIImports(unittest.TestCase):
    def test_ui_imports(self):
        try:
            import customtkinter  # noqa: F401
        except Exception:
            self.skipTest("customtkinter not installed")
        # Import only — do not start mainloop in CI.
        import Wa3iCoderUI  # noqa: F401
        self.assertTrue(hasattr(Wa3iCoderUI, "Wa3iCoderUI"))


if __name__ == "__main__":
    unittest.main(verbosity=2)