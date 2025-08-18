import os

# Client configuration
CLIENT_PORT = int(os.getenv("CLIENT_PORT", 5000))
CLIENT_HOST = os.getenv("CLIENT_HOST", "0.0.0.0")
CLIENT_DEBUG = os.getenv("CLIENT_DEBUG", "True").lower() == "true"

# AutoHotkey configuration
AHK_EXE = os.getenv("AHK_EXE", "C:/Program Files/AutoHotkey/v2/AutoHotkey.exe")
SCRIPTS_DIR = os.getenv("SCRIPTS_DIR", "scripts/")
