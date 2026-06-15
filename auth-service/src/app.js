import express from 'express';
import cors from 'cors';
import { AuthController } from './controllers/authController.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { NotFoundError } from './utils/errors.js';
import { logger } from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Global middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'auth-service', timestamp: new Date() });
});

// Authentication routes
app.post('/api/v1/auth/signup', AuthController.signup);
app.post('/api/v1/auth/login', AuthController.login);

// Handle 404
app.all('*', (req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found on Auth Service.`));
});

// Centralized error handling
app.use(errorMiddleware);

app.listen(PORT, () => {
  logger.info(`Auth Service is running on port ${PORT}`);
});

export default app;
