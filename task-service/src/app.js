import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// Routers
import taskRoutes from './routes/taskRoutes.js';
import graphqlRoutes from './graphql/graphqlRoutes.js';

// Middlewares
import { requestLogger } from './middleware/requestLogger.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { NotFoundError } from './utils/errors.js';
import { logger } from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 3002;

// 1. Swagger OpenAPI Config
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management Microservice API Documentation',
      version: '1.0.0',
      description: 'API documentation demonstrating best practices in REST API Design (Pagination, Filtering, Sorting, JWT, RBAC) for Presidio Week 2.'
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development Task Service Server'
      }
    ]
  },
  // Paths to files containing OpenAPI JSDoc comments
  apis: ['./src/routes/*.js']
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);

// 2. Apply Global Middlewares
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'task-service', timestamp: new Date() });
});

// 3. Mount Swagger UI (Served publicly without authorization)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// 4. Mount Service Routers
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/tasks/graphql', graphqlRoutes);

// Handle unmapped routes (404)
app.all('*', (req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found on Task Service.`));
});

// 5. Global Error Handling Middleware
app.use(errorMiddleware);

app.listen(PORT, () => {
  logger.info(`=======================================================`);
  logger.info(` Task Service is running on port ${PORT}`);
  logger.info(` Swagger Documentation served at: http://localhost:${PORT}/api-docs`);
  logger.info(`=======================================================`);
});

export default app;
