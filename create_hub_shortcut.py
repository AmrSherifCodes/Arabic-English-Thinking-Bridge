import os
import subprocess
import sys
from pathlib import Path

def create_shortcut():
    root = Path(__file__).resolve().parent
    desktop = Path(os.path.expanduser("~/Desktop"))
    shortcut = desktop / "Wa3i Coder.lnk"

    py = Path(sys.executable)
    pyw = py.with_name("pythonw.exe")
    launcher = pyw if pyw.exists() else py
    work_dir = root / "Wa3iCoder"
    script_path = work_dir / "run_wa3i_coder.py"

    ps = f"""
$ws = New-Object -ComObject WScript.Shell
$s = $ws.CreateShortcut('{shortcut}')
$s.TargetPath = '{launcher}'
$s.Arguments = '"{script_path}"'
$s.WorkingDirectory = '{work_dir}'
$s.IconLocation = '{launcher},0'
$s.Description = "Wa3i Coder — مساعد البرمجة والتعلم"
$s.Save()
"""
    subprocess.run(["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", ps], check=True)
    print(f"✅ Shortcut created at {shortcut}")

if __name__ == "__main__":
    try:
        create_shortcut()
    except Exception as e:
        print(f"Error creating shortcut: {e}")