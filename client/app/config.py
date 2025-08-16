import os

# Require environment variables at startup
if "AHK_EXE" not in os.environ:
    raise RuntimeError("Environment variable AHK_EXE must be set")

# Assign to globals
AHK_EXE = os.environ["AHK_EXE"]

SCRIPTS_DIR = "../../ahk/"
