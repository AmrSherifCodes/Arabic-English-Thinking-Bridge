import os
import sys

def check_env():
    print("Checking dependencies...")
    try:
        import customtkinter
        import requests
        import numpy
    except ImportError as e:
        print(f"Missing dependency: {e}")
        print("Run: pip install -r requirements.txt")
        sys.exit(1)

    print("All good. Launching Wa3i Hub...")

if __name__ == "__main__":
    check_env()
    from Wa3iHubUI import Wa3iHub
    app = Wa3iHub()
    app.mainloop()