import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routers
import taskRoutes from './routes/taskRoutes.js';
import asyncRoutes from './routes/asyncRoutes.js';

// Import middlewares
import { authMiddleware } from './middleware/authMiddleware.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';

// Import custom errors
import { NotFoundError, ValidationError, AppError } from './utils/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// GLOBAL APPLICATION-LEVEL MIDDLEWARE
// ==========================================

// 1. Enable Cross-Origin Resource Sharing (CORS) so our dashboard can call it
app.use(cors());

// 2. Parse incoming JSON request bodies
app.use(express.json());

// 3. Third-party logging middleware (Morgan)
app.use(morgan('dev'));

// 4. Custom global middleware: Measure request execution time
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  const startHrTime = process.hrtime();

  res.on('finish', () => {
    const elapsedHrTime = process.hrtime(startHrTime);
    const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;
    console.log(`[PERF LOG] [${req.method}] ${req.originalUrl} completed in ${elapsedTimeInMs.toFixed(2)}ms`);
  });

  next();
});

// ==========================================
// ROUTES & SERVICE MOUNTING
// ==========================================

// Serve static frontend dashboard
app.use(express.static(path.join(__dirname, '../public')));

// Task API (MVC) - Router level middleware is applied inside taskRoutes
app.use('/api/v1/tasks', taskRoutes);

// Async API Comparison (Callbacks, Promises, Async/Await)
app.use('/api/v1/async', asyncRoutes);

// Secure Endpoint (Demonstrating Route-Specific Middleware)
app.get('/api/v1/secure/data', authMiddleware, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Authorized access successful. You unlocked the secret data!',
    user: req.user,
    data: {
      internshipTopic: 'Backend Integration & Cloud',
      secretCode: 'PRESIDIO_WEEK_2_COMPLETED',
      serverTime: req.requestTime
    }
  });
});

// Demo Error Triggering Endpoints (To test Error Handling Middleware)
app.get('/api/v1/errors/validation', (req, res, next) => {
  return next(new ValidationError('Username must be at least 6 characters long.'));
});

app.get('/api/v1/errors/unauthorized', (req, res, next) => {
  return next(new AppError('You do not have permission to modify this settings resource.', 403));
});

app.get('/api/v1/errors/server-crash', (req, res, next) => {
  // Simulating a runtime programming bug (unhandled reference error)
  try {
    const undefinedObject = undefined;
    undefinedObject.nonExistentMethod();
  } catch (err) {
    next(err); // Pass the raw programming error directly to the error handling middleware
  }
});

// ==========================================
// FALLBACK & CENTRAL ERROR HANDLING
// ==========================================

// Handle unmapped routes (404)
app.all('*', (req, res, next) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server!`));
});

// Centralized error handling middleware (must be registered last!)
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` Node.js Express server is running on port ${PORT}`);
  console.log(` Dashboard served at: http://localhost:${PORT}`);
  console.log(`===================================================`);
});

export default app;
