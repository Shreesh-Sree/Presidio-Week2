import express from 'express';
import { TaskController } from '../controllers/taskController.js';
import { authenticateUser, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         completed:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /api/v1/tasks:
 *   get:
 *     summary: Retrieve list of tasks with pagination, filtering, and sorting
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 5
 *       - name: completed
 *         in: query
 *         schema:
 *           type: string
 *           enum: [true, false]
 *       - name: sortBy
 *         in: query
 *         schema:
 *           type: string
 *           example: "createdAt:desc"
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A paginated list of tasks
 *       401:
 *         description: Unauthorized token
 */
router.route('/')
  .get(authenticateUser, TaskController.getAllTasks)

  /**
   * @openapi
   * /api/v1/tasks:
   *   post:
   *     summary: Create a new task (Authenticated users)
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *             properties:
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *     responses:
   *       201:
   *         description: Task created
   */
  .post(authenticateUser, TaskController.createTask);

/**
 * @openapi
 * /api/v1/tasks/clear:
 *   delete:
 *     summary: Clear all tasks from database (ADMIN only)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All tasks cleared
 *       403:
 *         description: Forbidden - admin role required
 */
router.route('/clear')
  .delete(authenticateUser, restrictTo('admin'), TaskController.clearAllTasks);

/**
 * @openapi
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: Retrieve a single task by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task data
 *       404:
 *         description: Task not found
 */
router.route('/:id')
  .get(authenticateUser, TaskController.getTaskById)

  /**
   * @openapi
   * /api/v1/tasks/{id}:
   *   patch:
   *     summary: Toggle task completion status
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Task completion status toggled
   */
  .patch(authenticateUser, TaskController.toggleTask)

  /**
   * @openapi
   * /api/v1/tasks/{id}:
   *   delete:
   *     summary: Delete a task (ADMIN only)
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Task deleted
   *       403:
   *         description: Forbidden - admin role required
   */
  .delete(authenticateUser, restrictTo('admin'), TaskController.deleteTask);

export default router;
