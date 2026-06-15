import express from 'express';
import { TaskController } from '../controllers/taskController.js';
import { rateLimiterMiddleware } from '../middleware/rateLimiterMiddleware.js';

const router = express.Router();

// ROUTER-LEVEL MIDDLEWARE 1: Stateful Rate Limiter
// This runs on all endpoints loaded through this specific router
router.use(rateLimiterMiddleware);

// ROUTER-LEVEL MIDDLEWARE 2: Log accessing tasks API
router.use((req, res, next) => {
  console.log(`[ROUTER MIDDLEWARE] Accessing Task Management Service - Path: ${req.path}`);
  next();
});

// Define routes mapped to controller handlers
router.route('/')
  .get(TaskController.getAllTasks)
  .post(TaskController.createTask);

router.route('/:id')
  .get(TaskController.getTaskById)
  .patch(TaskController.toggleTask)
  .delete(TaskController.deleteTask);

export default router;
