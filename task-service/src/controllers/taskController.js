import { TaskModel } from '../models/taskModel.js';
import { ValidationError, NotFoundError, catchAsync } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export const TaskController = {
  // Query tasks (with Pagination, Filtering, Sorting)
  getAllTasks: catchAsync(async (req, res) => {
    const { page, limit, completed, sortBy, search } = req.query;
    
    // Call the model query which encapsulates paginating, sorting, and filtering logic
    const result = TaskModel.query({
      page,
      limit,
      completed,
      sortBy,
      search
    });

    logger.info(`Fetched tasks page ${result.page}/${result.totalPages} (Total items: ${result.totalCount})`);

    res.status(200).json({
      status: 'success',
      pagination: {
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        totalCount: result.totalCount
      },
      data: {
        tasks: result.items
      }
    });
  }),

  // Get task by ID
  getTaskById: catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const task = TaskModel.getById(id);

    if (!task) {
      return next(new NotFoundError(`Task with ID ${id} not found.`));
    }

    res.status(200).json({
      status: 'success',
      data: { task }
    });
  }),

  // Create Task (Allowed for authenticated roles)
  createTask: catchAsync(async (req, res) => {
    const { title, description } = req.body;

    if (!title || title.trim() === '') {
      throw new ValidationError('Task title is required and cannot be empty.');
    }

    const newTask = TaskModel.create({ title, description });
    logger.info(`Task created by user ${req.user.username} (Role: ${req.user.role}) - ID: ${newTask.id}`);

    res.status(201).json({
      status: 'success',
      message: 'Task created successfully',
      data: { task: newTask }
    });
  }),

  // Toggle Task Completion Status (Allowed for authenticated roles)
  toggleTask: catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const task = TaskModel.toggleComplete(id);

    if (!task) {
      return next(new NotFoundError(`Task with ID ${id} not found.`));
    }

    logger.info(`Task ${id} completed status toggled to ${task.completed} by ${req.user.username}`);

    res.status(200).json({
      status: 'success',
      message: `Task completion status changed to ${task.completed}`,
      data: { task }
    });
  }),

  // Delete Task (Admin only - restriction enforced at router level)
  deleteTask: catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const deleted = TaskModel.delete(id);

    if (!deleted) {
      return next(new NotFoundError(`Task with ID ${id} not found.`));
    }

    logger.warn(`Task ${id} deleted by ADMIN: ${req.user.username}`);

    res.status(200).json({
      status: 'success',
      message: `Task ${id} deleted successfully by admin.`
    });
  }),

  // Clear All Tasks (Admin only - restriction enforced at router level)
  clearAllTasks: catchAsync(async (req, res) => {
    TaskModel.clearAll();
    logger.warn(`All tasks cleared from database by ADMIN: ${req.user.username}`);

    res.status(200).json({
      status: 'success',
      message: 'All tasks cleared successfully by admin.'
    });
  })
};
