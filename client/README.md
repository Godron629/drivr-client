# Client Configuration

This directory contains the client application that runs on each sim racing setup.

## Environment Variables

The client can be configured using environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `CLIENT_PORT` | `5000` | Port the client server runs on |
| `CLIENT_HOST` | `0.0.0.0` | Host the client server binds to |
| `CLIENT_DEBUG` | `True` | Enable debug mode |
| `AHK_EXE` | `C:/Program Files/AutoHotkey/AutoHotkey.exe` | Path to AutoHotkey executable |
| `SCRIPTS_DIR` | `scripts/` | Directory containing AutoHotkey scripts |

### Setting Environment Variables

**Windows (Command Prompt):**
```cmd
set AHK_EXE=C:\path\to\AutoHotkey.exe
set SCRIPTS_DIR=custom_scripts\
python run.py
```

**Windows (PowerShell):**
```powershell
$env:AHK_EXE = "C:\path\to\AutoHotkey.exe"
$env:SCRIPTS_DIR = "custom_scripts\"
python run.py
```

### .env File Support

Create a `.env` file in the client directory for persistent configuration:

```
AHK_EXE=C:/Custom/AutoHotkey/AutoHotkey.exe
SCRIPTS_DIR=my_scripts/
```

## API Endpoints

- `POST /run` - Execute AutoHotkey script
- `GET /health` - Health check endpoint

The client runs on port 5000 by default and accepts connections from any IP (0.0.0.0).