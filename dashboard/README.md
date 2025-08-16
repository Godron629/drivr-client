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
cd dashboard
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

## Notes

- The dashboard runs on port 8080 to avoid conflicts with client servers (port 5000)
- CORS is enabled to allow cross-origin requests to client APIs
- Race invite command may need adjustment for your specific setup