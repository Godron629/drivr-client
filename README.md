# DriVR Client

This is a Flask web server that executes AutoHotKey scripts. 

It can: 
* Start processes
* Send keystrokes 
* Stop processes

# Pre-requisites
* Install [AutoHotkey (AHK)](https://www.autohotkey.com/)

# Getting Started

```sh
// Create virtual environment
python -m venv venv
.\venv\Scripts\activate

// Install Dependencies
pip install -r requirements.txt

// Set environment variables (PowerShell)
$env:AHK_EXE="C:\Program Files\AutoHotkey\v2\AutoHotKey.exe"

// Run server 
python .\run.py
```

# Example Requests

### Close Assetto Corsa
```
curl --location 'http://127.0.0.1:5000/run' \
--header 'Content-Type: application/json' \
--data '{
    "script_name": "send-keystroke.ahk", 
    "args": ["acs.exe", "!{f4}"]
}'
```

### Turn on racing line 
```
curl --location 'http://127.0.0.1:5000/run' \
--header 'Content-Type: application/json' \
--data '{
    "script_name": "send-keystroke.ahk", 
    "args": ["acs.exe", "^i"]
}'
```

### Send race invite 
```
curl --location 'http://127.0.0.1:5000/run' \
--header 'Content-Type: application/json' \
--data '{
    "script_name": "start-process.ahk",
    "args": [
        "C:/Users/gideon/Documents/Content Manager.exe acmanager://race/online/join?ip=192.168.1.211&httpPort=8081"
    ]
}
'
```

# Example Errors 

Sending a keystroke to a process that doesn't exist

```
// Request body 
{
    "script_name": "send-keystroke.ahk", 
    "args": ["acs.exe", "^i"]
}

// Response
{
    "status": "error",
    "stderr": "Process Content Manager.exe is not running.",
    "stdout": ""
}
```