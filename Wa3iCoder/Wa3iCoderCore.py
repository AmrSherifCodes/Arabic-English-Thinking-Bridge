from __future__ import annotations

import os
import re
import subprocess
import sys
import tempfile
import time
from dataclasses import dataclass
from typing import Any, Dict, List, Tuple

import requests

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")
DEFAULT_MODEL = os.environ.get("WA3I_MODEL", "qwen2.5-coder:7b")
DEFAULT_TIMEOUT = int(os.environ.get("WA3I_TIMEOUT", "180"))


SYSTEM_PROMPT = """
انت "واعي كودر" — مطور سينيور مصري شاطر جدًا، بتشتغل مع الباشمهندس عمرو شريف في الإسكندرية.
كلامك مع المستخدم بالمصري، دافي، واثق، وبسيط. استخدم جمل زي: "يا باشمهندس"، "شغل نضيف"، "فيه غلطة هنا"، "ثواني وأنا مظبطهالك".

قواعد صارمة:
1. الكود كله يكون بالإنجليزي.
2. الشرح والتعليقات اللي بتكلم بيها المستخدم تكون بالمصري.
3. لما المستخدم يطلب كود، رجّع الكود فقط داخل بلوك ```python ...``` وماتكتبش كلام قبله أو بعده.
4. الكود لازم يكون كامل، قابل للتشغيل، وفيه try/except لو فيه عمليات خارجية.
5. ماتستخدمش أي API سحابي. افترض إن التشغيل أوفلاين وبسيط.
6. لو المستخدم طلب شرح، اشرح بالمصري بعد الكود أو بدونه حسب الطلب.
7. ماتخترعش مكتبات غريبة. استخدم المكتبات القياسية في بايثون إلا لو المستخدم طلب غير كده.
8. لو الكود محتاج input()، حط قيم افتراضية أو اشرح إنه محتاج إدخال.
9. لو الطلب تحدي، ركّز إن الـ output يطابق المطلوب بالظبط (نفس النص/الأرقام).
10. خلي الكود بسيط وواضح ومقروء — المستخدم بيتعلم.
"""


def python_exe() -> str:
    """Return a console-capable Python even when the app runs under pythonw.exe."""
    exe = sys.executable or "python"
    try:
        if os.name == "nt" and exe.lower().endswith("pythonw.exe"):
            candidate = exe[: -len("pythonw.exe")] + "python.exe"
            if os.path.exists(candidate):
                return candidate
    except Exception:
        pass
    return exe


@dataclass
class ExecutionResult:
    success: bool
    stdout: str = ""
    stderr: str = ""
    returncode: int = 0
    command: str = ""
    duration: float = 0.0

    def summary(self) -> str:
        status = "✅ الكود اشتغل تمام" if self.success else f"❌ الكود فشل — returncode={self.returncode}"
        parts = [f"{status}\n⏱️ المدة: {self.duration:.2f} ثانية"]
        if self.stdout.strip():
            parts.append("STDOUT:\n" + self.stdout.strip())
        if self.stderr.strip():
            parts.append("STDERR:\n" + self.stderr.strip())
        if not self.stdout.strip() and not self.stderr.strip():
            parts.append("مفيش output ظاهر.")
        return "\n\n".join(parts)


class Wa3iCoderAgent:
    """Offline brain: talks to local Ollama, runs code in a sandbox, self-heals."""

    def __init__(
        self,
        base_url: str = OLLAMA_URL,
        model: str = DEFAULT_MODEL,
        timeout: int = DEFAULT_TIMEOUT,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.timeout = timeout

    # ------------------------------------------------------------ Ollama
    def is_online(self, timeout: float = 2.0) -> bool:
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=timeout)
            return response.status_code == 200
        except Exception:
            return False

    def list_models(self) -> List[str]:
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            response.raise_for_status()
            data = response.json()
            return [m.get("name", "") for m in data.get("models", []) if m.get("name")]
        except Exception:
            return []

    def warmup(self) -> bool:
        """Preload the model into VRAM so the first real prompt feels instant."""
        try:
            self._chat([{"role": "user", "content": "قول: تمام"}], temperature=0.0, num_predict=8)
            return True
        except Exception:
            return False

    def _chat(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.2,
        num_predict: int = 2048,
    ) -> str:
        payload = {
            "model": self.model,
            "messages": messages,
            "stream": False,
            "options": {"temperature": temperature, "num_predict": num_predict},
        }
        try:
            response = requests.post(f"{self.base_url}/api/chat", json=payload, timeout=self.timeout)
        except requests.exceptions.ConnectionError as exc:
            raise RuntimeError("مش قادر أوصل لـ Ollama. اتأكد إنه شغال: ollama serve") from exc
        except requests.exceptions.Timeout as exc:
            raise RuntimeError("Ollama خد وقت طويل ومردش. جرب تقلل الطلب أو تزود WA3I_TIMEOUT.") from exc

        if response.status_code == 404:
            raise RuntimeError(f"الموديل '{self.model}' مش موجود. شغّل: ollama pull {self.model}")

        response.raise_for_status()
        data = response.json()
        if "message" in data and isinstance(data["message"], dict):
            return data["message"].get("content", "") or ""
        return data.get("response", "") or ""

    # ------------------------------------------------------------ Generation
    def extract_code(self, text: str) -> str:
        if not text:
            return ""
        for pattern in (r"```python\s*(.*?)```", r"```py\s*(.*?)```", r"```\s*(.*?)```"):
            match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return text.strip()

    def generate_code(self, prompt: str, temperature: float = 0.2) -> str:
        prompt = (prompt or "").strip()
        if not prompt:
            raise ValueError("اكتب طلبك الأول يا باشمهندس.")
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ]
        return self.extract_code(self._chat(messages, temperature=temperature, num_predict=2048))

    # ------------------------------------------------------------ Sandbox
    def execute_code(self, code: str, timeout: int = 30) -> ExecutionResult:
        if not (code or "").strip():
            return ExecutionResult(success=False, stderr="مفيش كود أشغله يا باشمهندس.", returncode=-1)

        start = time.time()
        creationflags = getattr(subprocess, "CREATE_NO_WINDOW", 0) if os.name == "nt" else 0

        try:
            with tempfile.TemporaryDirectory(prefix="wa3i_sandbox_") as tmpdir:
                script_path = os.path.join(tmpdir, "main.py")
                with open(script_path, "w", encoding="utf-8") as handle:
                    handle.write(code)

                env = os.environ.copy()
                env["PYTHONIOENCODING"] = "utf-8"
                env["PYTHONUTF8"] = "1"
                command = [python_exe(), "-u", script_path]

                try:
                    completed = subprocess.run(
                        command,
                        cwd=tmpdir,
                        capture_output=True,
                        text=True,
                        encoding="utf-8",
                        errors="replace",
                        timeout=timeout,
                        env=env,
                        creationflags=creationflags,
                    )
                    return ExecutionResult(
                        success=completed.returncode == 0,
                        stdout=completed.stdout or "",
                        stderr=completed.stderr or "",
                        returncode=completed.returncode,
                        command=" ".join(command),
                        duration=time.time() - start,
                    )
                except subprocess.TimeoutExpired as exc:
                    stdout = exc.stdout or ""
                    stderr = exc.stderr or ""
                    if isinstance(stdout, bytes):
                        stdout = stdout.decode("utf-8", errors="replace")
                    if isinstance(stderr, bytes):
                        stderr = stderr.decode("utf-8", errors="replace")
                    return ExecutionResult(
                        success=False,
                        stdout=stdout,
                        stderr=(stderr + f"\n⏱️ الكود عدى المهلة ({timeout} ثانية).").strip(),
                        returncode=-1,
                        command=" ".join(command),
                        duration=time.time() - start,
                    )
        except Exception as exc:
            return ExecutionResult(success=False, stderr=f"حصل خطأ وأنا بشغل الكود: {exc}",
                                   returncode=-1, duration=time.time() - start)

    # ------------------------------------------------------------ Healing
    def self_heal(
        self,
        code: str,
        error: str,
        max_attempts: int = 2,
    ) -> Tuple[str, ExecutionResult, List[Dict[str, Any]]]:
        current_code = code
        current_error = error or "الكود فشل من غير رسالة خطأ واضحة."
        last_result = self.execute_code(current_code)
        attempts: List[Dict[str, Any]] = []

        for attempt in range(1, max(0, max_attempts) + 1):
            heal_prompt = f"""
يا واعي، الكود ده فيه مشكلة وأنا محتاجك تصلحه.

الكود الحالي:
```python
{current_code}
```

رسالة الخطأ:
```text
{current_error}
```

المطلوب:
- رجّع النسخة الكاملة المصححة من الكود فقط.
- حطها داخل بلوك ```python ...```.
- ماتكتبش أي شرح خارج البلوك.
- خلي الكود كامل ومش ناقص.
"""
            try:
                fixed_code = self.generate_code(heal_prompt, temperature=0.1)
            except Exception as exc:
                attempts.append({"attempt": attempt, "success": False, "error": str(exc)})
                break

            result = self.execute_code(fixed_code)
            attempts.append({
                "attempt": attempt,
                "success": result.success,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "returncode": result.returncode,
            })
            current_code, last_result = fixed_code, result
            if result.success:
                break
            current_error = result.stderr or result.stdout or current_error

        return current_code, last_result, attempts

    def generate_and_test(self, prompt: str, max_heal: int = 2) -> Dict[str, Any]:
        code = self.generate_code(prompt)
        result = self.execute_code(code)
        attempts: List[Dict[str, Any]] = []
        healed = False

        if not result.success:
            code, result, attempts = self.self_heal(
                code, result.stderr or result.stdout or "الكود فشل.", max_attempts=max_heal
            )
            healed = result.success

        return {"code": code, "result": result, "attempts": attempts, "healed": healed}
