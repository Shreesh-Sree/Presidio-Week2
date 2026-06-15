# Presidio SDE Internship: Week 2 - Backend Engineering & Cloud Integration

Welcome to the **Week 2 Backend Architecture Sandbox**. This project is a hands-on, side-by-side study environment comparing **Node.js (Express)** and **Python (Flask)** implementations of essential backend engineering patterns:
1. **MVC Design Pattern** (Model-View-Controller isolation)
2. **Middleware Chains** (Global, Router-level, and Route-specific interceptors)
3. **Asynchronous Execution Models** (Callbacks vs Promises vs Async/Await, and Python `asyncio.gather` concurrency)
4. **Centralized Error Handling** (Operational exceptions mapping to standardized JSON payloads)

To make learning interactive, the Node.js server hosts a **gorgeous dark-mode glassmorphic dashboard** that interfaces with both backends in real time, displaying execution benchmarks, rate limiters, and a live API request audit stream.

---

## Project Architecture

```
Presidio-Week2/
├── node-backend/                # Node.js + Express Backend
│   ├── src/
│   │   ├── config/              # App constants
│   │   ├── controllers/         # Controller Layer (MVC)
│   │   ├── middleware/          # Auth, Limiter & Error Middleware
│   │   ├── models/              # Model Layer (MVC - In-memory CRUD)
│   │   ├── routes/              # Express Routers
│   │   │   ├── taskRoutes.js    # Task CRUD Router (MVC)
│   │   │   └── asyncRoutes.js   # Callback, Promise, Async/Await Demo
│   │   ├── utils/
│   │   │   └── errors.js        # Custom Exception Classes & catchAsync Wrapper
│   │   └── app.js               # Entry Point & Global Middleware Setup
│   ├── public/                  # Frontend Static Dashboard
│   │   ├── index.html           # Dashboard Structure
│   │   ├── styles.css           # Custom Glassmorphic CSS Theme
│   │   └── main.js              # Fetch Calls, Charts, Live Console Log Stream
│   └── package.json             # Express, Cors & Morgan Dependencies
│
├── flask-backend/               # Python + Flask Backend
│   ├── app/
│   │   ├── blueprints/          # Blueprint Routers (MVC)
│   │   │   ├── task_routes.py   # Task CRUD Blueprint (MVC)
│   │   │   └── async_routes.py  # Synchronous vs asyncio.gather Blueprint
│   │   ├── middleware/
│   │   │   └── decorators.py    # Custom functional decorators (Local Middleware)
│   │   ├── models/
│   │   │   └── task.py          # Model Layer (MVC - In-memory CRUD)
│   │   ├── utils/
│   │   │   └── errors.py        # Custom APIException mapper
│   │   └── __init__.py          # Flask Application Factory & Global hooks
│   ├── run.py                   # Flask Server Bootstrapper
│   └── requirements.txt         # Flask, Flask-Cors, asgiref, httpx Dependencies
│
└── README.md                    # Project Documentation (This file)
```

---

## Getting Started

Both backends are configured to run locally. Ensure you have **Node.js (v18+)** and **Python (3.9+)** installed.

### 1. Running the Node.js Express Server (Port 3000)
1. Open a terminal and navigate to the `node-backend` directory:
   ```bash
   cd node-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
   *The Express server will start on port `3000` and serve the dashboard at [http://localhost:3000](http://localhost:3000).*

### 2. Running the Python Flask Server (Port 5000)
1. Open a second terminal and navigate to the `flask-backend` directory:
   ```bash
   cd flask-backend
   ```
2. Initialize and activate a virtual environment:
   * **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   * **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the server:
   ```bash
   python run.py
   ```
   *The Flask server will start on port `5000`.*

---

## Interactive Features to Explore

Open **[http://localhost:3000](http://localhost:3000)** in your browser and use the interactive tabs to explore:

### 1. MVC Task Management
- **Topic**: MVC Design Pattern.
- **Hands-on**: Add, view, complete, and delete tasks. You can switch target backends to compare how the Express Controller/Model flow matches Flask Blueprint routing.

### 2. Middleware Sandbox
- **Topic**: Global, Router-level, and Route-specific request chains.
- **Hands-on**:
  - Toggle the **Authorization Switch** (this injects an `x-api-key` header) and query the secure Node or Flask routes to see how route-specific middlewares authenticate requests.
  - Click the **Rate Limit Bomb** to send rapid queries to the Node task endpoint. You will exhaust the stateful rate limiter and witness a `429 Too Many Requests` error.

### 3. Async Performance Benchmarks
- **Topic**: Async operations, event loops, and non-blocking threads.
- **Hands-on**:
  - Run Node Callback, Promise, and Async/Await endpoints to check response logs and notice execution steps.
  - Run the Flask Sync vs Async routes. The Async route uses `asyncio.gather` to trigger multiple actions concurrently, resulting in a **~3x reduction in response latency** compared to sequential blocking calls.

### 4. Centralized Error Debugger
- **Topic**: Exception handling, custom classes, and standard payloads.
- **Hands-on**: Click various error triggers (Validation, Forbidden, Server Crash, Route 404) and inspect how both backends capture exceptions globally and return identical structured error payloads (timestamp, path, HTTP status, sanitized messages).
