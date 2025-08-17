# Dashboard

Web interface for managing racing sim clients across your network.

## UI Overview

**Client Cards**: Each sim setup appears as a card with control buttons  
**Client Configuration**: Clients are loaded from `app/static/clients-config.json`  
**Control Buttons**: Execute commands instantly on target machines

## Adding Custom Buttons

Edit `app/static/buttons-config.json` to add new commands:

```json
{
  "id": "pit_limiter",
  "label": "Pit Limiter", 
  "type": "secondary",
  "script": "send-keystroke.ahk",
  "args": ["acs.exe", "^p"]
}
```

**Button Types**: `primary` (blue), `secondary` (teal), `danger` (red)  
**Scripts**: `send-keystroke.ahk`, `start-process.ahk`, etc.  
**Placeholders**: Use `{server_ip}` for race server selection

Buttons load automatically on refresh.

