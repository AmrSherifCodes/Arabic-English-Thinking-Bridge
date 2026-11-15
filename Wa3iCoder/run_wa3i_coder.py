import os
import sys

# Ensure we can import from the same directory
HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path:
    sys.path.insert(0, HERE)

from Wa3iCoderUI import Wa3iCoderUI

if __name__ == "__main__":
    app = Wa3iCoderUI()
    app.mainloop()