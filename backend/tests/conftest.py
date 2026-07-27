import sys
import os

# Add the backend root directory to sys.path so tests can import backend modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
