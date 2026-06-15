// Endpoint Configuration
const AUTH_SERVICE = 'http://localhost:3001/api/v1';
const TASK_SERVICE = 'http://localhost:3002/api/v1';

// Application State
let currentPage = 1;
let totalPages = 1;

// DOM Elements
const statusIndicatorAuth = document.querySelector('#status-auth .status-indicator');
const statusIndicatorTasks = document.querySelector('#status-tasks .status-indicator');
const consoleStream = document.getElementById('console-stream');
const btnClearConsole = document.getElementById('btn-clear-console');

// Auth Form Elements
const cardAuthSignedOut = document.getElementById('card-auth-signed-out');
const cardAuthSignedIn = document.getElementById('card-auth-signed-in');
const tabLoginBtn = document.getElementById('tab-login-btn');
const tabRegisterBtn = document.getElementById('tab-register-btn');
const formLogin = document.getElementById('form-login');
const formRegister = document.getElementById('form-register');

// Session Data Elements
const sessionUsername = document.getElementById('session-username');
const sessionRole = document.getElementById('session-role');
const sessionJwtString = document.getElementById('session-jwt-string');
const btnLogout = document.getElementById('btn-logout');

// REST Task Elements
const formCreateTask = document.getElementById('form-create-task');
const taskTitleInput = document.getElementById('task-title');
const taskDescInput = document.getElementById('task-desc');
const filterCompleted = document.getElementById('filter-completed');
const searchTasks = document.getElementById('search-tasks');
const sortTasks = document.getElementById('sort-tasks');
const limitTasks = document.getElementById('limit-tasks');
const taskListContainer = document.getElementById('task-list-container');
const btnClearTasks = document.getElementById('btn-clear-tasks');

// Pagination Elements
const btnPrevPage = document.getElementById('btn-prev-page');
const btnNextPage = document.getElementById('btn-next-page');
const currentPageIndicator = document.getElementById('current-page');
const totalPagesIndicator = document.getElementById('total-pages');

// GraphQL Elements
const graphqlQueryInput = document.getElementById('graphql-query-input');
const btnQueryTitles = document.getElementById('btn-query-titles');
const btnQueryFull = document.getElementById('btn-query-full');
const btnRunGraphql = document.getElementById('btn-run-graphql');
const graphqlJsonDisplay = document.getElementById('graphql-json-display');

// ==========================================
// CONSOLE AUDIT LOG
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
  consoleStream.innerHTML = '<div class="console-line system-line">[SYSTEM] Console log cleared. Ready.</div>';
});

// ==========================================
// MICROSERVICES HEALTH MONITOR
// ==========================================
async function checkServiceHealth() {
  // Check Auth Service
  try {
    const res = await fetch('http://localhost:3001/health');
    if (res.ok) {
      statusIndicatorAuth.className = 'status-indicator online';
    } else {
      statusIndicatorAuth.className = 'status-indicator offline';
    }
  } catch (err) {
    statusIndicatorAuth.className = 'status-indicator offline';
  }

  // Check Task Service
  try {
    const res = await fetch('http://localhost:3002/health');
    if (res.ok) {
      statusIndicatorTasks.className = 'status-indicator online';
    } else {
      statusIndicatorTasks.className = 'status-indicator offline';
    }
  } catch (err) {
    statusIndicatorTasks.className = 'status-indicator offline';
  }
}

// Check on startup and poll every 5s
checkServiceHealth();
setInterval(checkServiceHealth, 5000);

// ==========================================
// SESSION MANAGMENT (JWT STORAGE)
// ==========================================
function getToken() {
  return localStorage.getItem('jwt_token');
}

function getHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

function checkSession() {
  const token = getToken();
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');

  if (token && username && role) {
    // Show signed-in panel
    cardAuthSignedOut.classList.add('hidden');
    cardAuthSignedIn.classList.remove('hidden');
    
    sessionUsername.textContent = username;
    sessionRole.textContent = role;
    sessionRole.className = `profile-value badge-role ${role === 'admin' ? 'role-admin' : 'role-intern'}`;
    sessionJwtString.textContent = token;
    
    // Enable REST forms and buttons
    taskTitleInput.disabled = false;
    taskDescInput.disabled = false;
    
    // Fetch initial task list
    fetchTasks();
  } else {
    // Show signed-out panel
    cardAuthSignedOut.classList.remove('hidden');
    cardAuthSignedIn.classList.add('hidden');
    
    // Disable REST task controls
    taskTitleInput.disabled = true;
    taskDescInput.disabled = true;
    
    taskListContainer.innerHTML = '<div class="loading-state">Sign in to load task resources.</div>';
  }
}

btnLogout.addEventListener('click', () => {
  localStorage.clear();
  logToConsole('system', 'Session destroyed. User logged out.');
  checkSession();
});

// Initial Session Check
checkSession();

// ==========================================
// AUTHENTICATION FORMS & SUBMITS
// ==========================================

// Tab Switching
tabLoginBtn.addEventListener('click', () => {
  tabLoginBtn.classList.add('active');
  tabRegisterBtn.classList.remove('active');
  formLogin.classList.add('active-form');
  formRegister.classList.remove('active-form');
});

tabRegisterBtn.addEventListener('click', () => {
  tabRegisterBtn.classList.add('active');
  tabLoginBtn.classList.remove('active');
  formRegister.classList.add('active-form');
  formLogin.classList.remove('active-form');
});

// Login Submit
formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  const url = `${AUTH_SERVICE}/auth/login`;
  const body = { username, password };
  
  logToConsole('request', `POST ${url} - Body: ${JSON.stringify(body)}`);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const result = await res.json();

    if (res.ok) {
      logToConsole('success', `Login Success (Status 200) - JWT Token Issued`);
      
      // Store credentials statelessly in browser
      localStorage.setItem('jwt_token', result.data.token);
      localStorage.setItem('username', result.data.user.username);
      localStorage.setItem('role', result.data.user.role);
      
      checkSession();
    } else {
      logToConsole('error', `Login Failed (Status ${res.status}): ${result.message}`);
    }
  } catch (err) {
    logToConsole('error', `Login Network Error: ${err.message}`);
  }
});

// Register Submit
formRegister.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('reg-username').value;
  const password = document.getElementById('reg-password').value;
  const role = document.getElementById('reg-role').value;

  const url = `${AUTH_SERVICE}/auth/signup`;
  const body = { username, password, role };

  logToConsole('request', `POST ${url} - Body: ${JSON.stringify(body)}`);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const result = await res.json();

    if (res.ok) {
      logToConsole('success', `Registration Success (Status 201) - User registered and JWT Issued`);
      
      localStorage.setItem('jwt_token', result.data.token);
      localStorage.setItem('username', result.data.user.username);
      localStorage.setItem('role', result.data.user.role);
      
      checkSession();
    } else {
      logToConsole('error', `Registration Failed (Status ${res.status}): ${result.message}`);
    }
  } catch (err) {
    logToConsole('error', `Registration Network Error: ${err.message}`);
  }
});

// ==========================================
// PAGINATED REST API IMPLEMENTATION
// ==========================================
async function fetchTasks() {
  if (!getToken()) return;

  const completed = filterCompleted.value;
  const search = searchTasks.value;
  const sortBy = sortTasks.value;
  const limit = limitTasks.value;

  // Build query string
  let queryParams = `page=${currentPage}&limit=${limit}`;
  if (completed !== 'all') queryParams += `&completed=${completed}`;
  if (search.trim() !== '') queryParams += `&search=${encodeURIComponent(search)}`;
  if (sortBy) queryParams += `&sortBy=${sortBy}`;

  const url = `${TASK_SERVICE}/tasks?${queryParams}`;
  const headers = getHeaders();

  logToConsole('request', `GET ${url} - Auth Header: ${headers.Authorization.substring(0, 25)}...`);

  try {
    const res = await fetch(url, { headers });
    const result = await res.json();

    if (res.ok) {
      logToConsole('success', `GET tasks successful (Status 200) - Received ${result.data.tasks.length} items`);
      
      // Update pagination states
      currentPage = result.pagination.page;
      totalPages = result.pagination.totalPages;
      
      currentPageIndicator.textContent = currentPage;
      totalPagesIndicator.textContent = totalPages === 0 ? 1 : totalPages;

      // Handle pagination buttons state
      btnPrevPage.disabled = currentPage <= 1;
      btnNextPage.disabled = currentPage >= totalPages;

      renderTasks(result.data.tasks);
    } else {
      logToConsole('error', `GET tasks failed (Status ${res.status}): ${result.message}`);
      taskListContainer.innerHTML = `<div class="empty-state error-line">${result.message}</div>`;
    }
  } catch (err) {
    logToConsole('error', `Fetch Tasks Network Error: ${err.message}`);
    taskListContainer.innerHTML = '<div class="empty-state error-line">Server unreachable. Check if Task Service is running.</div>';
  }
}

// Render REST Tasks
function renderTasks(tasks) {
  if (tasks.length === 0) {
    taskListContainer.innerHTML = '<div class="empty-state">No matching tasks found.</div>';
    return;
  }

  taskListContainer.innerHTML = '';
  tasks.forEach(task => {
    const item = document.createElement('div');
    item.className = 'task-item';

    const formattedDate = new Date(task.createdAt).toLocaleString();

    item.innerHTML = `
      <div class="task-left">
        <div class="task-checkbox-wrapper">
          <div class="task-checkbox ${task.completed ? 'completed' : ''}" data-id="${task.id}"></div>
        </div>
        <div class="task-details">
          <h4 class="${task.completed ? 'completed' : ''}">${escapeHtml(task.title)}</h4>
          <p>${escapeHtml(task.description || 'No description')} - <span style="font-family: monospace; font-size: 0.72rem;">${formattedDate}</span></p>
        </div>
      </div>
      <button class="task-delete-btn" data-id="${task.id}">Delete</button>
    `;

    // Click checkbox to toggle status
    item.querySelector('.task-checkbox-wrapper').addEventListener('click', () => toggleTask(task.id));

    // Click delete button (restricted to admin)
    item.querySelector('.task-delete-btn').addEventListener('click', () => deleteTask(task.id));

    taskListContainer.appendChild(item);
  });
}

// Event Listeners for Filters/Sorts
filterCompleted.addEventListener('change', () => { currentPage = 1; fetchTasks(); });
searchTasks.addEventListener('input', debounce(() => { currentPage = 1; fetchTasks(); }, 400));
sortTasks.addEventListener('change', () => { currentPage = 1; fetchTasks(); });
limitTasks.addEventListener('change', () => { currentPage = 1; fetchTasks(); });

// Pagination button click listeners
btnPrevPage.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    fetchTasks();
  }
});

btnNextPage.addEventListener('click', () => {
  if (currentPage < totalPages) {
    currentPage++;
    fetchTasks();
  }
});

// Create Task
formCreateTask.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = taskTitleInput.value;
  const description = taskDescInput.value;

  const url = `${TASK_SERVICE}/tasks`;
  const body = { title, description };
  const headers = getHeaders();

  logToConsole('request', `POST ${url} - Body: ${JSON.stringify(body)}`);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const result = await res.json();

    if (res.ok) {
      logToConsole('success', `Task Created (Status 201)`);
      taskTitleInput.value = '';
      taskDescInput.value = '';
      fetchTasks();
    } else {
      logToConsole('error', `Create Task Failed (Status ${res.status}): ${result.message}`);
    }
  } catch (err) {
    logToConsole('error', `Create Task Network Error: ${err.message}`);
  }
});

// Toggle Complete
async function toggleTask(id) {
  const url = `${TASK_SERVICE}/tasks/${id}`;
  const headers = getHeaders();

  logToConsole('request', `PATCH ${url}`);

  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers
    });
    
    const result = await res.json();

    if (res.ok) {
      logToConsole('success', `Task ${id} Toggled (Status 200)`);
      fetchTasks();
    } else {
      logToConsole('error', `Toggle Failed (Status ${res.status}): ${result.message}`);
    }
  } catch (err) {
    logToConsole('error', `Toggle Network Error: ${err.message}`);
  }
}

// Delete Task (RBAC Check)
async function deleteTask(id) {
  const url = `${TASK_SERVICE}/tasks/${id}`;
  const headers = getHeaders();

  logToConsole('request', `DELETE ${url} - Requester Role: ${localStorage.getItem('role')}`);

  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers
    });

    const result = await res.json();

    if (res.ok) {
      logToConsole('success', `Task ${id} Deleted (Status 200) - Admin action allowed`);
      fetchTasks();
    } else {
      // Highlight role authorization errors (403)
      if (res.status === 403) {
        logToConsole('error', `RBAC DENIAL (Status 403) - Action rejected: Interns cannot delete tasks.`);
      } else {
        logToConsole('error', `Delete Failed (Status ${res.status}): ${result.message}`);
      }
    }
  } catch (err) {
    logToConsole('error', `Delete Network Error: ${err.message}`);
  }
}

// Clear All Tasks (RBAC Check)
btnClearTasks.addEventListener('click', async () => {
  const url = `${TASK_SERVICE}/tasks/clear`;
  const headers = getHeaders();

  logToConsole('request', `DELETE ${url} - Requester Role: ${localStorage.getItem('role')}`);

  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers
    });

    const result = await res.json();

    if (res.ok) {
      logToConsole('success', `All Tasks Cleared (Status 200) - Admin action allowed`);
      fetchTasks();
    } else {
      if (res.status === 403) {
        logToConsole('error', `RBAC DENIAL (Status 403) - Action rejected: Interns cannot clear tasks.`);
      } else {
        logToConsole('error', `Clear Tasks Failed (Status ${res.status}): ${result.message}`);
      }
    }
  } catch (err) {
    logToConsole('error', `Clear Tasks Network Error: ${err.message}`);
  }
});

// ==========================================
// GRAPHQL COMPARATOR ENGINE
// ==========================================

// Pre-seeded query buttons
btnQueryTitles.addEventListener('click', () => {
  graphqlQueryInput.value = `query {
  tasks {
    title
  }
}`;
});

btnQueryFull.addEventListener('click', () => {
  graphqlQueryInput.value = `query {
  tasks {
    id
    title
    description
    completed
    createdAt
  }
}`;
});

// Execute GraphQL
btnRunGraphql.addEventListener('click', async () => {
  const query = graphqlQueryInput.value;
  const url = `${TASK_SERVICE}/tasks/graphql`;
  const headers = getHeaders();

  logToConsole('request', `POST ${url} - GraphQL Payload: ${query.replace(/\s+/g, ' ').trim()}`);
  graphqlJsonDisplay.textContent = 'Executing query...';

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query })
    });

    const result = await res.json();

    if (res.ok) {
      logToConsole('success', `GraphQL Execution Success (Status 200)`);
      graphqlJsonDisplay.textContent = JSON.stringify(result, null, 2);
    } else {
      logToConsole('error', `GraphQL Error (Status ${res.status}): ${JSON.stringify(result)}`);
      graphqlJsonDisplay.textContent = JSON.stringify(result, null, 2);
    }
  } catch (err) {
    logToConsole('error', `GraphQL Network Error: ${err.message}`);
    graphqlJsonDisplay.textContent = `Network Error: ${err.message}`;
  }
});

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function escapeHtml(text) {
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
