// Store client configurations
let clients = [];
let raceServers = [];

// Load clients from localStorage on page load
document.addEventListener('DOMContentLoaded', function() {
    loadClients();
    loadRaceServers();
    renderClients();
    renderRaceServers();
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

function updateNickname(clientId, nickname) {
    const client = clients.find(c => c.id == clientId);
    if (client) {
        client.nickname = nickname;
        saveClients();
    }
}

function loadRaceServers() {
    const savedServers = localStorage.getItem('assettoRaceServers');
    if (savedServers) {
        raceServers = JSON.parse(savedServers);
    }
}

function saveRaceServers() {
    localStorage.setItem('assettoRaceServers', JSON.stringify(raceServers));
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
        nickname: ''
    };
    
    clients.push(client);
    saveClients();
    renderClients();
    
    // Clear input fields
    document.getElementById('client-name').value = '';
    document.getElementById('client-ip').value = '';
}

function removeClient(clientId) {
    console.log('removeClient called with ID:', clientId);
    console.log('Current clients:', clients);
    if (confirm('Are you sure you want to remove this client?')) {
        clients = clients.filter(c => c.id != clientId); // Use != instead of !== for type coercion
        console.log('Clients after removal:', clients);
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
        
        // Populate the server dropdown for this client
        const select = document.getElementById(`server-select-${client.id}`);
        if (select) {
            updateServerSelect(select);
        }
    });
}

function createClientBox(client) {
    const box = document.createElement('div');
    box.className = 'client-box';
    box.id = `client-${client.id}`;
    
    box.innerHTML = `
        <div class="client-header">
            <div>
                <div class="client-name">${client.name}</div>
                <div class="client-ip">${client.ip}:5000</div>
                <div class="nickname-section">
                    <input type="text" class="nickname-input" id="nickname-${client.id}" 
                           placeholder="Driver nickname..." 
                           value="${client.nickname || ''}"
                           onchange="updateNickname('${client.id}', this.value)">
                </div>
            </div>
        </div>
        
        <div class="controls">
            <select id="server-select-${client.id}" class="server-select">
                <option value="">Select Race Server</option>
            </select>
            <button class="btn btn-primary" onclick="sendRaceInvite('${client.id}')">
                Race Invite
            </button>
            <button class="btn btn-primary" onclick="acceptInvite('${client.id}')">
                Accept Invite
            </button>
            <button class="btn btn-secondary" onclick="toggleRacingLine('${client.id}')">
                Racing Line
            </button>
            <button class="btn btn-secondary" onclick="toggleTractionControl('${client.id}')">
                Traction Control
            </button>
            <button class="btn btn-secondary" onclick="toggleABS('${client.id}')">
                ABS
            </button>
            <button class="btn btn-secondary" onclick="toggleTransmission('${client.id}')">
                Auto/Manual
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
        } else {
            statusDiv.className = 'status-message status-error';
            statusDiv.textContent = result.stderr || result.error || 'Command failed';
        }
    } catch (error) {
        statusDiv.className = 'status-message status-error';
        statusDiv.textContent = `Failed to connect to client: ${error.message}`;
        console.error('Connection error:', error);
    }
    
    // Remove loading state
    clientBox.classList.remove('loading');
    
    // Hide status message after 3 seconds
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
    
    saveClients();
}

function addRaceServer() {
    const name = document.getElementById('server-name').value.trim();
    const ip = document.getElementById('server-ip').value.trim();
    
    if (!name || !ip) {
        alert('Please enter both server name and IP address');
        return;
    }
    
    // Check if server already exists
    if (raceServers.find(s => s.ip === ip)) {
        alert('Server with this IP already exists');
        return;
    }
    
    const server = {
        id: Date.now(),
        name: name,
        ip: ip
    };
    
    raceServers.push(server);
    saveRaceServers();
    renderRaceServers();
    
    // Clear input fields
    document.getElementById('server-name').value = '';
    document.getElementById('server-ip').value = '';
    
    // Update all client dropdowns
    updateAllServerSelects();
}

function removeRaceServer(serverId) {
    if (confirm('Are you sure you want to remove this race server?')) {
        raceServers = raceServers.filter(s => s.id !== serverId);
        saveRaceServers();
        renderRaceServers();
        updateAllServerSelects();
    }
}

function renderRaceServers() {
    const container = document.getElementById('servers-container');
    container.innerHTML = '';
    
    raceServers.forEach(server => {
        const serverItem = document.createElement('div');
        serverItem.className = 'server-item';
        serverItem.innerHTML = `
            <span>${server.name} (${server.ip})</span>
            <button class="btn btn-danger btn-small" onclick="removeRaceServer('${server.id}')">Remove</button>
        `;
        container.appendChild(serverItem);
    });
}

function updateAllServerSelects() {
    clients.forEach(client => {
        const select = document.getElementById(`server-select-${client.id}`);
        if (select) {
            updateServerSelect(select);
        }
    });
}

function updateServerSelect(selectElement) {
    // Keep the current selection if it exists
    const currentValue = selectElement.value;
    
    // Clear existing options except the first one
    selectElement.innerHTML = '<option value="">Select Race Server</option>';
    
    // Add all race servers
    raceServers.forEach(server => {
        const option = document.createElement('option');
        option.value = server.ip;
        option.textContent = `${server.name} (${server.ip})`;
        selectElement.appendChild(option);
    });
    
    // Restore selection if it still exists
    if (currentValue && raceServers.find(s => s.ip === currentValue)) {
        selectElement.value = currentValue;
    }
}


// Command functions
function sendRaceInvite(clientId) {
    const serverSelect = document.getElementById(`server-select-${clientId}`);
    const selectedServerIp = serverSelect.value;
    
    if (!selectedServerIp) {
        alert('Please select a race server first');
        return;
    }
    
    const raceInviteCommand = {
        script_name: "start-process.ahk",
        args: [
            `C:/Users/gideon/Documents/Content Manager.exe acmanager://race/online/join?ip=${selectedServerIp}&httpPort=8081`
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

function toggleABS(clientId) {
    const absCommand = {
        script_name: "send-keystroke.ahk",
        args: ["acs.exe", "^a"]
    };
    sendCommand(clientId, absCommand);
}

function toggleTransmission(clientId) {
    const transmissionCommand = {
        script_name: "send-keystroke.ahk",
        args: ["acs.exe", "^g"]
    };
    sendCommand(clientId, transmissionCommand);
}

function acceptInvite(clientId) {
    const acceptInviteCommand = {
        script_name: "send-keystroke.ahk",
        args: ["Content Manager.exe", "^g"]
    };
    sendCommand(clientId, acceptInviteCommand);
}

function stopAssetto(clientId) {
    const stopCommand = {
        script_name: "send-keystroke.ahk",
        args: ["acs.exe", "!{f4}"]
    };
    sendCommand(clientId, stopCommand);
}