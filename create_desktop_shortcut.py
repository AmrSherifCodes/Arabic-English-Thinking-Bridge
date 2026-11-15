"""Create the Wa3i Hub desktop shortcut. Idempotent, safe to rerun."""
from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path


def _ps_quote(v: str) -> str:
    return "'" + str(v).replace("'", "''") + "'"


def main() -> int:
    root = Path(__file__).resolve().parent
    target = root / "Wa3iHub.py"
    if not target.exists():
        print(f"❌ missing: {target}")
        return 1

    py = Path(sys.executable)
    pyw = py.with_name("pythonw.exe")
    launcher = pyw if pyw.exists() else py

    desktop = Path(os.path.expanduser("~/Desktop"))
    if not desktop.exists():
        desktop = Path(os.path.expanduser("~"))
    shortcut = desktop / "Wa3i Hub.lnk"

    ps = f"""
$ws = New-Object -ComObject WScript.Shell
$s = $ws.CreateShortcut({_ps_quote(str(shortcut))})
$s.TargetPath = {_ps_quote(str(launcher))}
$s.Arguments = {_ps_quote(f'"{target}"')}
$s.WorkingDirectory = {_ps_quote(str(root))}
$s.IconLocation = {_ps_quote(str(launcher) + ',0')}
$s.Description = "Wa3i Hub — مركز تطبيقات واعي"
$s.Save()
"""
    try:
        subprocess.run(
            ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", ps],
            check=True, capture_output=True, text=True,
        )
    except subprocess.CalledProcessError as exc:
        print(f"❌ PowerShell failed: {exc.stderr or exc.stdout}")
        return 1

    print(f"✅ Shortcut created: {shortcut}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())