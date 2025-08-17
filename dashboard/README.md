# Assetto Corsa Dashboard

A web-based dashboard for controlling multiple Assetto Corsa client setups remotely.

## Features

- Control multiple client setups from a single dashboard
- Send race invites to specific clients
- Toggle racing line and traction control
- Stop Assetto Corsa on any client
- Real-time client status monitoring
- Simple client management (add/remove)

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the dashboard:
```bash
python run.py
```

3. Open your browser to `http://localhost:8080`

## Usage

1. **Add Clients**: Use the "Add New Client" section to add your client setups by name and IP address
2. **Control Clients**: Each client appears as a control box with buttons for:
   - **Race Invite**: Sends Content Manager race invite
   - **Racing Line**: Toggles racing line (Ctrl+I)
   - **Traction Control**: Toggles traction control (Ctrl+T)
   - **Stop Assetto**: Closes Assetto Corsa (Alt+F4)
3. **Monitor Status**: Color-coded indicators show client online/offline status

## Client Configuration

- Each client must be running the Flask client server on port 5000
- Clients are stored in browser localStorage
- Status is checked automatically every 30 seconds

## Button Configuration

The dashboard uses a data-driven approach where all buttons are defined in `app/static/buttons-config.json`. This makes it easy to add, modify, or remove commands without touching the code.

### Button Configuration Format

```json
{
  "buttons": [
    {
      "id": "unique_button_id",
      "label": "Button Text", 
      "type": "primary|secondary|danger",
      "script": "script-name.ahk",
      "args": ["arg1", "arg2", "arg3"],
      "requires_server": true|false,
      "special": "remove_client",
      "full_width": true|false
    }
  ]
}
```

### Button Properties

- **`id`**: Unique identifier for the button
- **`label`**: Text displayed on the button
- **`type`**: Button style - `primary` (blue), `secondary` (teal), `danger` (red)
- **`script`**: AutoHotkey script to execute (`send-keystroke.ahk`, `start-process.ahk`, etc.)
- **`args`**: Array of arguments to pass to the script
- **`requires_server`**: If `true`, shows server dropdown and replaces `{server_ip}` placeholder
- **`special`**: Special command handler (currently only `remove_client`)
- **`full_width`**: If `true`, button spans full width of control area

### Argument Placeholders

- **`{server_ip}`**: Replaced with selected race server IP address
- **Path prefixes**: For `start-process.ahk`, use third argument for path prefix:
  - `["Content Manager.exe", "args", "A_MyDocuments"]` → `%USERPROFILE%\Documents\Content Manager.exe`

### Adding New Buttons

1. Edit `app/static/buttons-config.json`
2. Add new button object to the `buttons` array
3. Refresh the dashboard - buttons load automatically
4. Order is determined by position in the array

### Example: Adding Pit Limiter Button

```json
{
  "id": "pit_limiter",
  "label": "Pit Limiter",
  "type": "secondary", 
  "script": "send-keystroke.ahk",
  "args": ["acs.exe", "^p"],
  "requires_server": false
}
```

## Notes

- The dashboard runs on port 8080 to avoid conflicts with client servers (port 5000)
- CORS is enabled to allow cross-origin requests to client APIs
- All commands are executed via AutoHotkey scripts on the client machines