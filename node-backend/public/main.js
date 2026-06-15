// API Base URLs
const NODE_API = 'http://localhost:3000/api/v1';
const FLASK_API = 'http://localhost:5000/api/v1';

// State variables
let activeBackend = 'node'; // 'node' or 'flask'
let isAuthorized = false;

// DOM Elements
const statusIndicatorNode = document.querySelector('#status-node .status-indicator');
const statusIndicatorFlask = document.querySelector('#status-flask .status-indicator');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const consoleStream = document.getElementById('console-stream');
const btnClearConsole = document.getElementById('btn-clear-console');

// ==========================================
// AUDIT LOG CONSOLE FUNCTIONS
// ==========================================
function logToConsole(type, message) {
  const line = document.createElement('div');
  line.className = `console-line ${type}-line`;
  
  const timestamp = new Date().toLocaleTimeString();
  line.textContent = `[${timestamp}] ${message}`;
  
  consoleStream.appendChild(line);
  consoleStream.scrollTop = consoleStream.scrollHeight;
}

btnClearConsole.addEventListener('click', () => {
  consoleStream.innerHTML = '<div class="console-line system-line">[SYSTEM] Console log cleared. Ready for operations.</div>';
});

// ==========================================
// SERVER STATUS CHECKS
// ==========================================
async function checkServerStatuses() {
  // Check Node.js Server
  try {
    const res = await fetch(`${NODE_API}/tasks`, { method: 'GET' });
    if (res.ok) {
      statusIndicatorNode.className = 'status-indicator online';
    } else {
      statusIndicatorNode.className = 'status-indicator offline';
    }
  } catch (err) {
    statusIndicatorNode.className = 'status-indicator offline';
  }

  // Check Flask Server
  try {
    const res = await fetch(`${FLASK_API}/tasks`, { method: 'GET' });
    if (res.ok) {
      statusIndicatorFlask.className = 'status-indicator online';
    } else {
      statusIndicatorFlask.className = 'status-indicator offline';
    }
  } catch (err) {
    statusIndicatorFlask.className = 'status-indicator offline';
  }
}

// Initial status check and periodic polling every 5 seconds
checkServerStatuses();
setInterval(checkServerStatuses, 5000);

// ==========================================
// TAB NAVIGATION
// ==========================================
tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const tabName = button.getAttribute('data-tab');
    
    // Deactivate active tabs
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Activate clicked tab
    button.classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    logToConsole('system', `Switched view to: ${button.textContent.trim()}`);

    // If switching to MVC tab, fetch tasks automatically
    if (tabName === 'mvc') {
      fetchTasks();
    }
  });
});

// ==========================================
// MVC TASKS SECTION
// ==========================================
const radioNode = document.querySelector('input[name="mvc-backend"][value="node"]');
const radioFlask = document.querySelector('input[name="mvc-backend"][value="flask"]');
const btnRefreshTasks = document.getElementById('btn-refresh-tasks');
const formCreateTask = document.getElementById('form-create-task');
const taskContainer = document.getElementById('task-container');
const mvcListDesc = document.getElementById('mvc-list-desc');

function getBaseUrl() {
  return activeBackend === 'node' ? NODE_API : FLASK_API;
}

function updateBackendSelection() {
  activeBackend = radioNode.checked ? 'node' : 'flask';
  const backendLabel = activeBackend === 'node' ? 'Node.js Express' : 'Python Flask';
  mvcListDesc.textContent = `In-memory tasks fetched from ${backendLabel}.`;
  logToConsole('system', `Task management target changed to: ${backendLabel}`);
  fetchTasks();
}

radioNode.addEventListener('change', updateBackendSelection);
radioFlask.addEventListener('change', updateBackendSelection);
btnRefreshTasks.addEventListener('click', fetchTasks);

// Fetch Tasks
async function fetchTasks() {
  taskContainer.innerHTML = '<div class="loading-state">Loading tasks...</div>';
  const url = `${getBaseUrl()}/tasks`;
  
  logToConsole('request', `GET ${url}`);
  
  try {
    const response = await fetch(url);
    const result = await response.json();
    
    logToConsole('success', `GET ${url} - Status ${response.status} - Done`);
    
    if (result.status === 'success' && result.data && result.data.tasks) {
      renderTasks(result.data.tasks);
    } else {
      taskContainer.innerHTML = `<div class="empty-state">Failed to fetch tasks correctly.</div>`;
    }
  } catch (err) {
    logToConsole('error', `GET ${url} failed - Error: ${err.message}`);
    taskContainer.innerHTML = `<div class="empty-state error-line">Server unreachable. Check if backend is running.</div>`;
  }
}

// Render Tasks in DOM
function renderTasks(tasks) {
  if (tasks.length === 0) {
    taskContainer.innerHTML = '<div class="empty-state">No tasks available. Add one!</div>';
    return;
  }
  
  taskContainer.innerHTML = '';
  tasks.forEach(task => {
    const item = document.createElement('div');
    item.className = 'task-item';
    
    const formattedDate = new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    item.innerHTML = `
      <div class="task-left">
        <div class="task-checkbox-wrapper">
          <div class="task-checkbox ${task.completed ? 'completed' : ''}" data-id="${task.id}"></div>
        </div>
        <div class="task-details">
          <h4 class="${task.completed ? 'completed' : ''}">${escapeHtml(task.title)}</h4>
          <p>${escapeHtml(task.description || 'No description')} • <span style="font-family: monospace;">${formattedDate}</span></p>
        </div>
      </div>
      <button class="task-delete-btn" data-id="${task.id}">Delete</button>
    `;
    
    // Toggle Event
    item.querySelector('.task-checkbox-wrapper').addEventListener('click', () => toggleTask(task.id));
    
    // Delete Event
    item.querySelector('.task-delete-btn').addEventListener('click', () => deleteTask(task.id));
    
    taskContainer.appendChild(item);
  });
}

// Create Task
formCreateTask.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const titleInput = document.getElementById('task-title');
  const descInput = document.getElementById('task-desc');
  
  const payload = {
    title: titleInput.value,
    description: descInput.value
  };
  
  const url = `${getBaseUrl()}/tasks`;
  logToConsole('request', `POST ${url} - Body: ${JSON.stringify(payload)}`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      logToConsole('success', `POST ${url} - Status ${response.status} - Task created!`);
      titleInput.value = '';
      descInput.value = '';
      fetchTasks();
    } else {
      logToConsole('error', `POST ${url} - Status ${response.status} - Fail: ${result.message}`);
    }
  } catch (err) {
    logToConsole('error', `POST ${url} failed - Error: ${err.message}`);
  }
});

// Toggle Task Complete
async function toggleTask(id) {
  const url = `${getBaseUrl()}/tasks/${id}`;
  logToConsole('request', `PATCH ${url}`);
  
  try {
    const response = await fetch(url, { method: 'PATCH' });
    const result = await response.json();
    
    if (response.ok) {
      logToConsole('success', `PATCH ${url} - Status ${response.status} - Toggled!`);
      fetchTasks();
    } else {
      logToConsole('error', `PATCH ${url} - Status ${response.status} - Fail: ${result.message}`);
    }
  } catch (err) {
    logToConsole('error', `PATCH ${url} failed - Error: ${err.message}`);
  }
}

// Delete Task
async function deleteTask(id) {
  const url = `${getBaseUrl()}/tasks/${id}`;
  logToConsole('request', `DELETE ${url}`);
  
  try {
    const response = await fetch(url, { method: 'DELETE' });
    const result = await response.json();
    
    if (response.ok) {
      logToConsole('success', `DELETE ${url} - Status ${response.status} - Deleted!`);
      fetchTasks();
    } else {
      logToConsole('error', `DELETE ${url} - Status ${response.status} - Fail: ${result.message}`);
    }
  } catch (err) {
    logToConsole('error', `DELETE ${url} failed - Error: ${err.message}`);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}

// ==========================================
// MIDDLEWARE SANDBOX
// ==========================================
const authToggle = document.getElementById('auth-toggle');
const authStatusLabel = document.getElementById('auth-status-label');
const btnSecureNode = document.getElementById('btn-secure-node');
const btnSecureFlask = document.getElementById('btn-secure-flask');
const btnRateLimitBomb = document.getElementById('btn-rate-limit-bomb');
const rateRemainingEl = document.getElementById('rate-remaining');
const rateGaugeFill = document.getElementById('rate-gauge-fill');

// Visual pipeline nodes
const nodeGlobalLog = document.getElementById('visual-global-logger');
const nodeRouteAuth = document.getElementById('visual-route-auth');

authToggle.addEventListener('change', () => {
  isAuthorized = authToggle.checked;
  if (isAuthorized) {
    authStatusLabel.textContent = 'Sending API Key: "presidio-secret-key" (Access Allowed)';
    authStatusLabel.className = 'toggle-status-text authenticated';
    logToConsole('system', 'Header Auth Mock configured to: AUTHORIZED (Valid x-api-key header)');
  } else {
    authStatusLabel.textContent = 'Sending invalid key (Access Denied)';
    authStatusLabel.className = 'toggle-status-text unauthenticated';
    logToConsole('system', 'Header Auth Mock configured to: DENIED (Invalid x-api-key header)');
  }
});

// Middleware Visual Animation Helper
function animateMiddlewarePipeline(success) {
  // Step 2: Global Logger
  setTimeout(() => {
    nodeGlobalLog.classList.add('active-step');
  }, 100);
  
  // Step 3: Auth Validator
  setTimeout(() => {
    nodeRouteAuth.classList.add('active-step');
  }, 400);
  
  // Step 4: Endpoint Controller
  setTimeout(() => {
    const controllerNode = document.querySelector('.success-node');
    if (success) {
      controllerNode.classList.add('active-step');
    } else {
      controllerNode.style.borderColor = 'var(--color-rose)';
      controllerNode.style.boxShadow = '0 0 10px rgba(244, 63, 94, 0.3)';
      controllerNode.style.backgroundColor = 'rgba(244, 63, 94, 0.08)';
      controllerNode.querySelector('p').textContent = 'Blocked by middleware';
    }
  }, 800);

  // Reset visual pipeline after 3 seconds
  setTimeout(() => {
    nodeGlobalLog.classList.remove('active-step');
    nodeRouteAuth.classList.remove('active-step');
    const controllerNode = document.querySelector('.success-node');
    controllerNode.classList.remove('active-step');
    controllerNode.style.borderColor = '';
    controllerNode.style.boxShadow = '';
    controllerNode.style.backgroundColor = '';
    controllerNode.querySelector('p').textContent = 'Executes handler code';
  }, 3000);
}

// Secure Endpoint Trigger Function
async function querySecureRoute(apiType) {
  const url = `${apiType === 'node' ? NODE_API : FLASK_API}/secure/data`;
  const headers = {};
  if (isAuthorized) {
    headers['x-api-key'] = 'presidio-secret-key';
  } else {
    headers['x-api-key'] = 'fake-incorrect-key';
  }
  
  logToConsole('request', `GET ${url} - Headers: ${JSON.stringify(headers)}`);
  
  try {
    const response = await fetch(url, { headers });
    const result = await response.json();
    
    if (response.ok) {
      logToConsole('success', `GET ${url} - Status ${response.status} - SUCCESS. Response: ${JSON.stringify(result.data)}`);
      animateMiddlewarePipeline(true);
    } else {
      logToConsole('error', `GET ${url} - Status ${response.status} - BLOCKED. Error: ${result.message}`);
      animateMiddlewarePipeline(false);
    }
  } catch (err) {
    logToConsole('error', `GET ${url} failed - Error: ${err.message}`);
    animateMiddlewarePipeline(false);
  }
}

btnSecureNode.addEventListener('click', () => querySecureRoute('node'));
btnSecureFlask.addEventListener('click', () => querySecureRoute('flask'));

// Stateful Rate Limit Test
btnRateLimitBomb.addEventListener('click', async () => {
  logToConsole('system', 'Starting stateful rate limiter bomb test (Sending multiple requests)...');
  
  let remaining = 15;
  
  // Trigger 18 requests sequentially
  for (let i = 1; i <= 18; i++) {
    try {
      const response = await fetch(`${NODE_API}/tasks`, { method: 'GET' });
      const rateLimitHeader = response.headers.get('X-RateLimit-Remaining');
      
      if (rateLimitHeader !== null) {
        remaining = parseInt(rateLimitHeader);
        rateRemainingEl.textContent = remaining;
        rateGaugeFill.style.width = `${(remaining / 15) * 100}%`;
      }
      
      const result = await response.json();
      
      if (response.ok) {
        logToConsole('success', `[Rate Limit Test #${i}] GET tasks successful. Remaining: ${remaining}`);
      } else {
        logToConsole('error', `[Rate Limit Test #${i}] Status ${response.status} - Limit Exceeded! Response: ${result.message}`);
        rateRemainingEl.textContent = '0';
        rateGaugeFill.style.width = '0%';
        rateGaugeFill.style.backgroundColor = 'var(--color-rose)';
      }
    } catch (err) {
      logToConsole('error', `Rate Limit Test #${i} failed: ${err.message}`);
    }
    
    // Tiny delay between calls
    await new Promise(r => setTimeout(r, 60));
  }
  
  // Reset gauge background color after 4 seconds
  setTimeout(() => {
    rateGaugeFill.style.backgroundColor = '';
  }, 4000);
});

// ==========================================
// ASYNC PERFORMANCE SECTION
// ==========================================
// Node.js buttons
const btnAsyncCallbacks = document.getElementById('btn-async-callbacks');
const btnAsyncPromises = document.getElementById('btn-async-promises');
const btnAsyncAwait = document.getElementById('btn-async-await');

// Flask buttons & chart
const btnFlaskSync = document.getElementById('btn-flask-sync');
const btnFlaskAsync = document.getElementById('btn-flask-async');
const barSyncFill = document.getElementById('bar-sync-fill');
const barAsyncFill = document.getElementById('bar-async-fill');
const valSyncTime = document.getElementById('val-sync-time');
const valAsyncTime = document.getElementById('val-async-time');

// Handle Node Async Buttons
async function triggerNodeAsync(patternName, endpoint) {
  const url = `${NODE_API}/async/${endpoint}`;
  logToConsole('request', `GET ${url}`);
  
  try {
    const response = await fetch(url);
    const result = await response.json();
    
    if (response.ok) {
      logToConsole('success', `[Async Node - ${patternName}] Done in ${result.durationMs}ms - Pattern: ${result.pattern}`);
      logToConsole('system', `Payload Result: ${JSON.stringify(result.data)}`);
    } else {
      logToConsole('error', `[Async Node - ${patternName}] Failed. Status: ${response.status}`);
    }
  } catch (err) {
    logToConsole('error', `GET ${url} failed - Error: ${err.message}`);
  }
}

btnAsyncCallbacks.addEventListener('click', () => triggerNodeAsync('Callbacks', 'callbacks'));
btnAsyncPromises.addEventListener('click', () => triggerNodeAsync('Promises', 'promises'));
btnAsyncAwait.addEventListener('click', () => triggerNodeAsync('Async/Await', 'async-await'));

// Handle Flask Async Buttons & Speed Benchmarks
async function triggerFlaskBenchmark(isAsync) {
  const endpoint = isAsync ? 'concurrent' : 'sequential';
  const url = `${FLASK_API}/async/${endpoint}`;
  
  logToConsole('request', `GET ${url}`);
  
  try {
    const response = await fetch(url);
    const result = await response.json();
    
    if (response.ok) {
      logToConsole('success', `[Async Flask - ${result.pattern}] Processed in ${result.durationMs}ms`);
      
      const durationMs = result.durationMs;
      
      if (!isAsync) {
        // Sync response
        valSyncTime.textContent = `${durationMs}ms`;
        // Sync is usually around 600ms. Set visual width.
        barSyncFill.style.width = '100%';
      } else {
        // Async concurrent response
        valAsyncTime.textContent = `${durationMs}ms`;
        
        // Calculate ratio
        const syncVal = parseFloat(valSyncTime.textContent);
        let pct = 33;
        if (!isNaN(syncVal) && syncVal > 0) {
          pct = (durationMs / syncVal) * 100;
        }
        barAsyncFill.style.width = `${pct}%`;
      }
    } else {
      logToConsole('error', `[Async Flask - ${endpoint}] Failed. Status: ${response.status}`);
    }
  } catch (err) {
    logToConsole('error', `GET ${url} failed - Error: ${err.message}`);
  }
}

btnFlaskSync.addEventListener('click', () => triggerFlaskBenchmark(false));
btnFlaskAsync.addEventListener('click', () => triggerFlaskBenchmark(true));

// ==========================================
// ERROR INSPECTOR SECTION
// ==========================================
const errorButtons = [
  { id: 'btn-err-node-val', api: NODE_API, route: '/errors/validation', label: 'Node Validation' },
  { id: 'btn-err-node-auth', api: NODE_API, route: '/errors/unauthorized', label: 'Node Forbidden' },
  { id: 'btn-err-node-crash', api: NODE_API, route: '/errors/server-crash', label: 'Node Internal Crash' },
  { id: 'btn-err-node-404', api: NODE_API, route: '/errors/unmapped-endpoint-random', label: 'Node 404 Not Found' },
  { id: 'btn-err-flask-val', api: FLASK_API, route: '/errors/validation', label: 'Flask Validation' },
  { id: 'btn-err-flask-crash', api: FLASK_API, route: '/errors/server-crash', label: 'Flask Internal Crash' },
  { id: 'btn-err-flask-404', api: FLASK_API, route: '/errors/unmapped-endpoint-random', label: 'Flask 404 Not Found' }
];

errorButtons.forEach(btnConfig => {
  const btn = document.getElementById(btnConfig.id);
  if (btn) {
    btn.addEventListener('click', async () => {
      const url = `${btnConfig.api}${btnConfig.route}`;
      logToConsole('request', `GET ${url}`);
      
      try {
        const response = await fetch(url);
        const result = await response.json();
        
        logToConsole('error', `[ERROR DETECTED] GET ${url} returned Status ${response.status}`);
        // Display full structured error JSON in console
        logToConsole('system', `Structured Response Payload:\n${JSON.stringify(result, null, 2)}`);
      } catch (err) {
        logToConsole('error', `Network error querying error route ${url}: ${err.message}`);
      }
    });
  }
});
