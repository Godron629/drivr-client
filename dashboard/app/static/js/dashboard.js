// Store client configurations
let clients = [];
let raceServers = [];
let buttonsConfig = null;
let clientsConfig = null;

// Health monitoring
let healthCheckInterval = null;
const HEALTH_CHECK_INTERVAL = 5000; // 5 seconds

// Load clients from config file on page load
document.addEventListener('DOMContentLoaded', async function() {
    await loadButtonsConfig();
    await loadClientsConfig();
    await loadServersConfig();
    renderClients();
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

async function loadClientsConfig() {
    try {
        const response = await fetch('/static/clients-config.json');
        clientsConfig = await response.json();
        console.log('Loaded clients config:', clientsConfig);
        
        // Check localStorage for saved assignments and nicknames
        const savedAssignments = localStorage.getItem('clientAssignments');
        const assignments = savedAssignments ? JSON.parse(savedAssignments) : {};
        const savedNicknames = localStorage.getItem('clientNicknames');
        const nicknames = savedNicknames ? JSON.parse(savedNicknames) : {};
        
        // Convert config clients to runtime clients with generated IDs and empty nicknames
        clients = clientsConfig.clients.map((configClient, index) => ({
            id: `client_${index}`,
            name: configClient.name,
            ip: configClient.ip,
            nickname: nicknames[`client_${index}`] || '',
            status: 'unknown',
            selectedServer: assignments[`client_${index}`] || configClient.selectedServer
        }));
    } catch (error) {
        console.error('Failed to load clients config:', error);
        // Fallback to empty clients
        clients = [];
    }
}

async function loadServersConfig() {
    try {
        const response = await fetch('/static/servers-config.json');
        const serversConfig = await response.json();
        console.log('Loaded servers config:', serversConfig);
        
        // Convert config servers to runtime servers with generated IDs
        raceServers = serversConfig.servers.map((configServer, index) => ({
            id: `server_${index}`,
            name: configServer.name,
            ip: configServer.ip,
            port: configServer.port || '9600',
            password: configServer.password || ''
        }));
    } catch (error) {
        console.error('Failed to load servers config:', error);
        // Fallback to empty servers
        raceServers = [];
    }
}

async function updateNickname(clientId, nickname) {
    const client = clients.find(c => c.id == clientId);
    if (client) {
        client.nickname = nickname;
        
        // Save nicknames to localStorage
        await saveClientNicknames();
    }
}

async function updateClientServer(clientId, serverValue) {
    const client = clients.find(c => c.id == clientId);
    if (client) {
        client.selectedServer = serverValue || null;
        
        // Save assignments to localStorage
        await saveClientsConfig();
        
        // Re-render to update grouping
        renderClients();
    }
}

async function saveClientsConfig() {
    try {
        // Save just the assignments to localStorage
        const assignments = {};
        clients.forEach(client => {
            if (client.selectedServer) {
                assignments[client.id] = client.selectedServer;
            }
        });
        localStorage.setItem('clientAssignments', JSON.stringify(assignments));
        console.log('Saved client assignments to localStorage');
    } catch (error) {
        console.error('Error saving client assignments:', error);
    }
}

async function saveClientNicknames() {
    try {
        // Save nicknames to localStorage
        const nicknames = {};
        clients.forEach(client => {
            if (client.nickname) {
                nicknames[client.id] = client.nickname;
            }
        });
        localStorage.setItem('clientNicknames', JSON.stringify(nicknames));
        console.log('Saved client nicknames to localStorage');
    } catch (error) {
        console.error('Error saving client nicknames:', error);
    }
}

function clearLocalStorage() {
    if (confirm('Are you sure you want to clear all saved assignments and nicknames? This cannot be undone.')) {
        localStorage.removeItem('clientAssignments');
        localStorage.removeItem('clientNicknames');
        console.log('Cleared localStorage data');
        
        // Reload the page to reset everything
        location.reload();
    }
}





function renderClients() {
    const container = document.getElementById('clients-container');
    container.innerHTML = '';
    
    // Group clients by selected server
    const clientsByServer = new Map();
    
    // Add unassigned clients
    const unassignedClients = clients.filter(client => !client.selectedServer);
    if (unassignedClients.length > 0) {
        clientsByServer.set('unassigned', {
            name: 'Unassigned',
            clients: unassignedClients
        });
    }
    
    // Group clients by their selected server
    clients.forEach(client => {
        if (client.selectedServer) {
            const server = raceServers.find(s => s.id == client.selectedServer);
            if (server) {
                const serverKey = client.selectedServer;
                if (!clientsByServer.has(serverKey)) {
                    clientsByServer.set(serverKey, {
                        name: server.name,
                        clients: []
                    });
                }
                clientsByServer.get(serverKey).clients.push(client);
            }
        }
    });
    
    // Render each server group
    clientsByServer.forEach((serverGroup, serverKey) => {
        const serverContainer = document.createElement('div');
        serverContainer.className = 'server-group';
        serverContainer.id = `server-group-${serverKey}`;
        
        const serverHeader = document.createElement('div');
        serverHeader.className = 'server-group-header';
        
        // Get server IP and port for display
        let serverTitle = serverGroup.name;
        if (serverKey !== 'unassigned') {
            const server = raceServers.find(s => s.id == serverKey);
            if (server) {
                serverTitle = `${serverGroup.name} (${server.ip}:${server.port})`;
            }
        }
        
        serverHeader.innerHTML = `<h3>${serverTitle}</h3>`;
        serverContainer.appendChild(serverHeader);
        
        const clientsGrid = document.createElement('div');
        clientsGrid.className = 'clients-grid';
        
        serverGroup.clients.forEach(client => {
            const clientBox = createClientBox(client);
            clientsGrid.appendChild(clientBox);
        });
        
        serverContainer.appendChild(clientsGrid);
        container.appendChild(serverContainer);
    });
    
    // Update server selects and status indicators after rendering
    clients.forEach(client => {
        const select = document.getElementById(`server-select-${client.id}`);
        if (select) {
            updateServerSelect(select);
            // Set the current selection
            if (client.selectedServer) {
                select.value = client.selectedServer;
            }
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
            <select id="server-select-${client.id}" class="server-select" onchange="updateClientServer('${client.id}', this.value)">
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
    
    // Hide status message after longer duration for errors, shorter for success
    const hideTimeout = statusDiv.className.includes('status-error') ? 8000 : 3000;
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, hideTimeout);
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
    
    
    // Check if server selection is required
    if (button.requires_server) {
        const serverSelect = document.getElementById(`server-select-${clientId}`);
        const selectedServerValue = serverSelect ? serverSelect.value : '';
        
        if (!selectedServerValue) {
            alert('Please select a race server first');
            return;
        }
        
        // Find the selected server by ID
        const selectedServer = raceServers.find(s => s.id == selectedServerValue);
        
        if (!selectedServer) {
            alert('Selected server not found');
            return;
        }
        
        const selectedServerPassword = selectedServer.password || '';
        
        // Replace {server_ip}, {server_port}, and {server_password} placeholders in args
        const processedArgs = button.args.map(arg => 
            arg.replace('{server_ip}', selectedServer.ip)
              .replace('{server_port}', selectedServer.port || '9600')
              .replace('{server_password}', selectedServerPassword)
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


function renderRaceServers() {
    const container = document.getElementById('servers-container');
    container.innerHTML = '';
    
    raceServers.forEach(server => {
        const serverItem = document.createElement('div');
        serverItem.className = 'server-item';
        serverItem.innerHTML = `
            <span>${server.name} (${server.ip}:${server.port || '9600'})</span>
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
        option.value = server.id;
        option.textContent = `${server.name} (${server.ip}:${server.port || '9600'})`;
        selectElement.appendChild(option);
    });
    
    // Restore selection if it still exists
    if (currentValue && raceServers.find(s => s.id == currentValue)) {
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
    
    // Keep server select and nickname input always enabled
    if (serverSelect) {
        serverSelect.disabled = false;
    }
    if (nicknameInput) {
        nicknameInput.disabled = false;
    }
}

