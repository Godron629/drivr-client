# SimCentre

A system for remotely controlling multiple Assetto Corsa client setups through a web dashboard.

![DriVR Control Dashboard](assets/drivr.png)

## Components

- **Client** (`client/`): Flask server that runs on each sim setup, executes AutoHotkey scripts
- **Dashboard** (`dashboard/`): Web-based control interface for managing multiple clients
- **AHK Scripts** (`ahk/`): AutoHotkey scripts for game interaction

## Quick Start

### 1. Start Client (on each sim setup)

* Install [AutoHotkey (AHK)](https://www.autohotkey.com/).

```sh
pip install -r .\requirements.txt

cd .\client\

// Set environment variables (PowerShell)
$env:AHK_EXE="C:\Program Files\AutoHotkey\v2\AutoHotKey.exe"

// Run client server (port 5000)
python .\run.py
```

### 2. Setup Dashboard (central control)

```sh
pip install -r .\requirements.txt

cd .\dashboard\

// Run dashboard (port 8080)
python .\run.py
```

### 3. Access Dashboard
Open browser to `http://localhost:8080` and add your client IPs to start controlling them.

