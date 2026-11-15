import os
import sys
import win32com.client

def create_shortcut():
    desktop = os.path.join(os.path.join(os.environ['USERPROFILE']), 'Desktop')
    path = os.path.join(desktop, "Wa3i Hub.lnk")
    target = sys.executable.replace("python.exe", "pythonw.exe")
    work_dir = os.path.join(os.getcwd(), "Wa3iHub")

    shell = win32com.client.Dispatch("WScript.Shell")
    shortcut = shell.CreateShortCut(path)
    shortcut.Targetpath = target
    shortcut.Arguments = os.path.join(work_dir, "run_hub.py")
    shortcut.WorkingDirectory = work_dir
    shortcut.IconLocation = target
    shortcut.save()
    print(f"Shortcut created at {path}")

if __name__ == "__main__":
    try:
        create_shortcut()
    except Exception as e:
        print(f"Error creating shortcut: {e}")