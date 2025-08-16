// Store client configurations
let clients = [];

// Load clients from localStorage on page load
document.addEventListener('DOMContentLoaded', function() {
    loadClients();
    renderClients();
    // Check client status every 30 seconds
    setInterval(checkAllClientsStatus, 30000);
});

function loadClients() {
    const savedClients = localStorage.getItem('assettoClients');
    if (savedClients) {
        clients = JSON.parse(savedClients);
    }
}

function saveClients() {
    localStorage.setItem('assettoClients', JSON.stringify(clients));
}

function addClient() {
    const name = document.getElementById('client-name').value.trim();
    const ip = document.getElementById('client-ip').value.trim();
    
    if (!name || !ip) {
        alert('Please enter both client name and IP address');
        return;
    }
    
    // Check if client already exists
    if (clients.find(c => c.ip === ip)) {
        alert('Client with this IP already exists');
        return;
    }
    
    const client = {
        id: Date.now(),
        name: name,
        ip: ip,
        status: 'unknown'
    };
    
    clients.push(client);
    saveClients();
    renderClients();
    
    // Clear input fields
    document.getElementById('client-name').value = '';
    document.getElementById('client-ip').value = '';
    
    // Check status of new client
    checkClientStatus(client.id);
}

function removeClient(clientId) {
    if (confirm('Are you sure you want to remove this client?')) {
        clients = clients.filter(c => c.id !== clientId);
        saveClients();
        renderClients();
    }
}

function renderClients() {
    const container = document.getElementById('clients-container');
    container.innerHTML = '';
    
    clients.forEach(client => {
        const clientBox = createClientBox(client);
        container.appendChild(clientBox);
    });
}

function createClientBox(client) {
    const box = document.createElement('div');
    box.className = `client-box ${client.status}`;
    box.id = `client-${client.id}`;
    
    box.innerHTML = `
        <div class="client-header">
            <div>
                <div class="client-name">${client.name}</div>
                <div class="client-ip">${client.ip}:5000</div>
            </div>
            <div class="status-indicator ${client.status}" title="Status: ${client.status}"></div>
        </div>
        
        <div class="controls">
            <button class="btn btn-primary" onclick="sendRaceInvite('${client.id}')">
                Race Invite
            </button>
            <button class="btn btn-secondary" onclick="toggleRacingLine('${client.id}')">
                Racing Line
            </button>
            <button class="btn btn-secondary" onclick="toggleTractionControl('${client.id}')">
                Traction Control
            </button>
            <button class="btn btn-danger" onclick="stopAssetto('${client.id}')">
                Stop Assetto
            </button>
            <button class="btn btn-danger btn-full" onclick="removeClient('${client.id}')">
                Remove Client
            </button>
        </div>
        
        <div class="status-message" id="status-${client.id}" style="display: none;"></div>
    `;
    
    return box;
}

async function sendCommand(clientId, command) {
    const client = clients.find(c => c.id == clientId);
    if (!client) return;
    
    const clientBox = document.getElementById(`client-${clientId}`);
    const statusDiv = document.getElementById(`status-${clientId}`);
    
    // Show loading state
    clientBox.classList.add('loading');
    statusDiv.style.display = 'block';
    statusDiv.className = 'status-message';
    statusDiv.textContent = 'Sending command...';
    
    try {
        const response = await fetch(`http://${client.ip}:5000/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(command)
        });
        
        const result = await response.json();
        
        if (response.ok && result.status === 'success') {
            statusDiv.className = 'status-message status-success';
            statusDiv.textContent = 'Command sent successfully';
            client.status = 'online';
        } else {
            statusDiv.className = 'status-message status-error';
            statusDiv.textContent = result.stderr || result.error || 'Command failed';
            client.status = 'online'; // Still online, just command failed
        }
    } catch (error) {
        statusDiv.className = 'status-message status-error';
        statusDiv.textContent = 'Failed to connect to client';
        client.status = 'offline';
    }
    
    // Remove loading state and update UI
    clientBox.classList.remove('loading');
    clientBox.className = `client-box ${client.status}`;
    document.querySelector(`#client-${clientId} .status-indicator`).className = `status-indicator ${client.status}`;
    
    // Hide status message after 3 seconds
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
    
    saveClients();
}

async function checkClientStatus(clientId) {
    const client = clients.find(c => c.id == clientId);
    if (!client) return;
    
    try {
        const response = await fetch(`http://${client.ip}:5000/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                script_name: "send-keystroke.ahk",
                args: ["notepad.exe", ""] // Simple test command
            })
        });
        
        client.status = response.ok ? 'online' : 'offline';
    } catch (error) {
        client.status = 'offline';
    }
    
    // Update UI
    const clientBox = document.getElementById(`client-${clientId}`);
    if (clientBox) {
        clientBox.className = `client-box ${client.status}`;
        document.querySelector(`#client-${clientId} .status-indicator`).className = `status-indicator ${client.status}`;
    }
    
    saveClients();
}

function checkAllClientsStatus() {
    clients.forEach(client => {
        checkClientStatus(client.id);
    });
}

// Command functions
function sendRaceInvite(clientId) {
    // You'll need to update this with your actual server IP and port
    const raceInviteCommand = {
        script_name: "start-process.ahk",
        args: [
            "C:/Users/gideon/Documents/Content Manager.exe acmanager://race/online/join?ip=192.168.1.211&httpPort=8081"
        ]
    };
    sendCommand(clientId, raceInviteCommand);
}

function toggleRacingLine(clientId) {
    const racingLineCommand = {
        script_name: "send-keystroke.ahk",
        args: ["acs.exe", "^i"]
    };
    sendCommand(clientId, racingLineCommand);
}

function toggleTractionControl(clientId) {
    // Assuming some keystroke for traction control - you may need to adjust this
    const tractionControlCommand = {
        script_name: "send-keystroke.ahk",
        args: ["acs.exe", "^t"]
    };
    sendCommand(clientId, tractionControlCommand);
}

function stopAssetto(clientId) {
    const stopCommand = {
        script_name: "send-keystroke.ahk",
        args: ["acs.exe", "!{f4}"]
    };
    sendCommand(clientId, stopCommand);
}