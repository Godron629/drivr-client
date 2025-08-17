# Dashboard

Web interface for managing racing sim clients across your network.

## Environment Variables

The dashboard can be configured using environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `DASHBOARD_PORT` | `8080` | Port the dashboard server runs on |
| `DASHBOARD_HOST` | `0.0.0.0` | Host the dashboard server binds to |
| `DASHBOARD_DEBUG` | `True` | Enable debug mode |

## UI Overview

**Client Cards**: Each sim setup appears as a card with control buttons
**Client Configuration**: Clients are loaded from `config/clients.json`
**Server Configuration**: Race servers are loaded from `config/servers.json`
**Control Buttons**: Execute commands instantly on target machines

## Adding Custom Buttons

Edit `config/buttons.json` to add new commands:

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

## Configuration Files

Configure clients and servers by editing the JSON files in `config/`:

**clients.json**: Define your sim rigs
```json
{
  "clients": [
    {
      "id": 1,
      "name": "Rig 6",
      "ip": "192.168.1.106",
      "port": 5000,
      "selectedServer": null
    }
  ]
}
```

**servers.json**: Define available race servers
```json
{
  "servers": [
    {
      "id": 1,
      "name": "Main Race Server",
      "ip": "192.168.1.100",
      "port": "9600",
      "password": ""
    }
  ]
}
```

**buttons.json**: Define custom control buttons
```json
{
  "buttons": [
    {
      "id": "pit_limiter",
      "label": "Pit Limiter",
      "type": "secondary",
      "script": "send-keystroke.ahk",
      "args": ["acs.exe", "^p"]
    }
  ]
}
```

All files are loaded automatically when the dashboard starts.

## API Endpoints

- `GET /` - Main dashboard interface
- `GET /config/<filename>` - Serve configuration files (clients.json, servers.json, buttons.json)

The dashboard runs on port 8080 by default and accepts connections from any IP (0.0.0.0).

