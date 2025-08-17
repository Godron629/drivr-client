// Store client configurations
let clients = [];
let raceServers = [];
let buttonsConfig = null;

// Health monitoring
let healthCheckInterval = null;
const HEALTH_CHECK_INTERVAL = 5000; // 5 seconds

// Load clients from localStorage on page load
document.addEventListener('DOMContentLoaded', async function() {
    await loadButtonsConfig();
    loadClients();
    loadRaceServers();
    renderClients();
    renderRaceServers();
    startHealthMonitoring();
});

async function loadButtonsConfig() {
    try {
        const response = await fetch('/static/buttons-config.json');
        buttonsConfig = await response.json();
        console.log('Loaded buttons config:', buttonsConfig);
    } catch (error) {
        console.error('Failed to load buttons config:', error);
        // Fallback to empty config
        buttonsConfig = { buttons: [] };
    }
}

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
        nickname: '',
        status: 'unknown' // 'online', 'offline', 'unknown'
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
        
        // Update status indicator
        updateClientStatus(client.id, client.status || 'unknown');
    });
}

function createClientBox(client) {
    if (!buttonsConfig) {
        console.error('Buttons config not loaded yet');
        return document.createElement('div');
    }
    
    const box = document.createElement('div');
    box.className = 'client-box';
    box.id = `client-${client.id}`;
    
    // Generate buttons HTML dynamically (order by array position)
    const buttons = buttonsConfig.buttons;
    
    let buttonsHTML = '';
    
    // Add server select for buttons that require it
    const hasServerRequiredButtons = buttons.some(btn => btn.requires_server);
    if (hasServerRequiredButtons) {
        buttonsHTML += `
            <select id="server-select-${client.id}" class="server-select">
                <option value="">Select Race Server</option>
            </select>
        `;
    }
    
    // Generate buttons
    buttons.forEach(button => {
        const btnClass = `btn btn-${button.type}${button.full_width ? ' btn-full' : ''}`;
        buttonsHTML += `
            <button class="${btnClass}" onclick="executeButtonCommand('${client.id}', '${button.id}')">
                ${button.label}
            </button>
        `;
    });
    
    box.innerHTML = `
        <div class="client-header">
            <div>
                <div class="client-name">
                    ${client.name}
                    <span class="status-indicator" id="status-indicator-${client.id}" title="Client status"></span>
                </div>
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
            ${buttonsHTML}
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
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        const response = await fetch(`http://${client.ip}:5000/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(command),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
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
        
        // Update client status to offline on connection failure
        updateClientStatus(clientId, 'offline');
    }
    
    // Remove loading state
    clientBox.classList.remove('loading');
    
    // Hide status message after 3 seconds
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
    
    saveClients();
}

// Generic command handler for dynamic buttons
async function executeButtonCommand(clientId, buttonId) {
    if (!buttonsConfig) {
        console.error('Buttons config not loaded');
        return;
    }
    
    const button = buttonsConfig.buttons.find(b => b.id === buttonId);
    if (!button) {
        console.error('Button not found:', buttonId);
        return;
    }
    
    // Handle special commands
    if (button.special === 'remove_client') {
        removeClient(clientId);
        return;
    }
    
    // Check if server selection is required
    if (button.requires_server) {
        const serverSelect = document.getElementById(`server-select-${clientId}`);
        const selectedServerIp = serverSelect ? serverSelect.value : '';
        
        if (!selectedServerIp) {
            alert('Please select a race server first');
            return;
        }
        
        // Replace {server_ip} placeholder in args
        const processedArgs = button.args.map(arg => 
            arg.replace('{server_ip}', selectedServerIp)
        );
        
        const command = {
            script_name: button.script,
            args: processedArgs
        };
        
        sendCommand(clientId, command);
    } else {
        // Regular command without server dependency
        const command = {
            script_name: button.script,
            args: button.args
        };
        
        sendCommand(clientId, command);
    }
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
    console.log('removeRaceServer called with ID:', serverId);
    console.log('Current servers:', raceServers);
    if (confirm('Are you sure you want to remove this race server?')) {
        raceServers = raceServers.filter(s => s.id != serverId); // Use != instead of !== for type coercion
        console.log('Servers after removal:', raceServers);
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

// Health monitoring functions
function startHealthMonitoring() {
    if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
    }
    
    // Initial health check
    checkAllClientsHealth();
    
    // Set up periodic health checks
    healthCheckInterval = setInterval(checkAllClientsHealth, HEALTH_CHECK_INTERVAL);
}

function stopHealthMonitoring() {
    if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
        healthCheckInterval = null;
    }
}

async function checkAllClientsHealth() {
    for (const client of clients) {
        await checkClientHealth(client.id);
    }
}

async function checkClientHealth(clientId) {
    const client = clients.find(c => c.id == clientId);
    if (!client) return;
    
    const statusIndicator = document.getElementById(`status-indicator-${clientId}`);
    if (!statusIndicator) return;
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        const response = await fetch(`http://${client.ip}:5000/health`, {
            method: 'GET',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            updateClientStatus(clientId, 'online');
        } else {
            updateClientStatus(clientId, 'offline');
        }
    } catch (error) {
        updateClientStatus(clientId, 'offline');
    }
}

function updateClientStatus(clientId, status) {
    const client = clients.find(c => c.id == clientId);
    if (!client) return;
    
    client.status = status;
    saveClients();
    
    const statusIndicator = document.getElementById(`status-indicator-${clientId}`);
    if (!statusIndicator) return;
    
    // Remove existing status classes
    statusIndicator.classList.remove('status-online', 'status-offline', 'status-unknown');
    
    // Add appropriate status class
    statusIndicator.classList.add(`status-${status}`);
    
    // Update title attribute for tooltip
    const statusText = status === 'online' ? 'Online' : status === 'offline' ? 'Offline' : 'Unknown';
    statusIndicator.title = `Client status: ${statusText}`;
    
    // Update button states based on client status
    updateClientButtonStates(clientId, status);
}

function updateClientButtonStates(clientId, status) {
    const clientBox = document.getElementById(`client-${clientId}`);
    if (!clientBox) return;
    
    const buttons = clientBox.querySelectorAll('.btn:not(.remove-btn)'); // Exclude remove button
    const serverSelect = document.getElementById(`server-select-${clientId}`);
    const nicknameInput = document.getElementById(`nickname-${clientId}`);
    
    const isOffline = status === 'offline';
    
    buttons.forEach(button => {
        button.disabled = isOffline;
        if (isOffline) {
            button.classList.add('btn-disabled');
        } else {
            button.classList.remove('btn-disabled');
        }
    });
    
    // Disable/enable server select and nickname input too
    if (serverSelect) {
        serverSelect.disabled = isOffline;
    }
    if (nicknameInput) {
        nicknameInput.disabled = isOffline;
    }
}

