# Presidio SDE Internship: Week 2 - Advanced Node.js Microservices Sandbox

Welcome to the restructured Week 2 Backend Architecture Sandbox. This repository contains a fully decoupled Node.js microservices stack designed to demonstrate advanced backend engineering, API design, security, and cloud deployment topics from the curriculum.

---

## Port Configuration Layout

For local testing, the services run on separate ports:
- **Port 3000**: Frontend Service (serves the web dashboard)
- **Port 3001**: Auth Service (handles sign-up, sign-in, and JWT token issuance)
- **Port 3002**: Task Service (manages tasks, JWT stateless authentication, RBAC, GraphQL, and Swagger UI)

---

## Project Structure

```
Presidio-Week2/
├── auth-service/                # Port 3001
│   ├── src/
│   │   ├── controllers/         # Handles signup, login, JWT token issuance
│   │   ├── middleware/          # Winston logging middleware & error handlers
│   │   ├── utils/               # JWT helper, Winston logger instance, custom error classes
│   │   └── app.js               # Express entrypoint
│   ├── Dockerfile               # Node alpine container setup
│   └── package.json
│
├── task-service/                # Port 3002
│   ├── src/
│   │   ├── controllers/         # Tasks controllers with pagination, filter, sort
│   │   ├── graphql/             # Custom GraphQL resolver to compare payloads
│   │   ├── middleware/          # JWT authorization & restrictTo RBAC middleware
│   │   ├── models/              # Pre-seeded task list model
│   │   ├── routes/              # REST routes annotated with Swagger OpenAPI JSDocs
│   │   ├── utils/               # Winston logger & custom exceptions
│   │   └── app.js               # Express entrypoint + Swagger docs mount
│   ├── Dockerfile               # Node alpine container setup
│   └── package.json
│
├── frontend/                    # Port 3000
│   ├── src/
│   │   └── server.js            # Node Express static server
│   ├── public/                  # Dashboard assets
│   │   ├── index.html           # Main dashboard structure
│   │   ├── styles.css           # Glassmorphism styling theme
│   │   └── main.js              # REST queries, GraphQL parser, log stream
│   └── package.json
│
├── .github/
│   └── workflows/
│       ├── deploy-ecs.yml       # CI/CD: Deploy to AWS ECS Fargate
│       └── deploy-cloudrun.yml  # CI/CD: Deploy to Google Cloud Run
│
├── docker-compose.yml           # Local multi-container orchestration
├── .gitignore
└── README.md                    # Project documentation (this file)
```

---

## Getting Started

You can run this project locally using Node.js or orchestrate the entire stack using Docker Compose.

### Running with Docker Compose (Recommended)
Make sure you have Docker installed and running on your system, then execute from the root directory:
```bash
docker compose up --build
```
This builds and launches all three containers.
- Access the Frontend Dashboard at: http://localhost:3000
- Access the Task Service API at: http://localhost:3002
- View the Interactive Swagger Docs at: http://localhost:3002/api-docs

### Running Locally without Docker
Ensure you have Node.js v18+ installed on your system.

#### 1. Start the Auth Service
1. Open a terminal and navigate to the `auth-service` directory:
   ```bash
   cd auth-service
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the service:
   ```bash
   npm start
   ```

#### 2. Start the Task Service
1. Open a second terminal and navigate to the `task-service` directory:
   ```bash
   cd task-service
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the service:
   ```bash
   npm start
   ```

#### 3. Start the Frontend Service
1. Open a third terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```

---

## Implemented Concept Details

### 1. JWT & Role-Based Access Control (RBAC)
- **Stateless Authentication**: Users sign in at the Auth Service and receive a JWT. When querying tasks, this token is sent in the `Authorization: Bearer <token>` header. The Task Service validates it statelessly using the shared secret.
- **RBAC**: Enforces role access policies. Seeded user `admin_user` has `admin` privileges and can execute task deletions. Seeded user `intern_user` has `intern` privileges and is blocked from deletions, returning a 403 Forbidden payload.

### 2. Advanced API Design
- **REST Pagination, Filtering, and Sorting**: The tasks API supports query parameters:
  - Pagination: `/api/v1/tasks?page=1&limit=5`
  - Filtering: `/api/v1/tasks?completed=true`
  - Sorting: `/api/v1/tasks?sortBy=createdAt:desc`
- **GraphQL vs REST**: To demonstrate over-fetching issues, the Task Service mounts a custom GraphQL resolver endpoint at `/api/v1/tasks/graphql`. The dashboard lets you query custom properties (such as fetching just titles) to compare GraphQL vs REST payloads.
- **Swagger Documentation**: Native JSDoc tags within the routes generate OpenAPI schemas, exposing Swagger interactive API testing at `/api-docs`.

### 3. Log Audits
- Integrated **Winston** in both backends to record transaction logs. Logs are written to stdout and stored in `logs/combined.log` and `logs/error.log` for audits.
