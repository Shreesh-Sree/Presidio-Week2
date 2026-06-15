import { TaskModel } from '../models/taskModel.js';
import { ValidationError, NotFoundError, catchAsync } from '../utils/errors.js';

export const TaskController = {
  // Get all tasks
  getAllTasks: catchAsync(async (req, res) => {
    const tasks = TaskModel.getAll();
    res.status(200).json({
      status: 'success',
      results: tasks.length,
      data: { tasks }
    });
  }),

  // Get single task by ID
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

  // Create new task
  createTask: catchAsync(async (req, res) => {
    const { title, description } = req.body;

    if (!title || title.trim() === '') {
      throw new ValidationError('Task title is required and cannot be empty.');
    }

    const newTask = TaskModel.create({ title, description });

    res.status(201).json({
      status: 'success',
      message: 'Task created successfully',
      data: { task: newTask }
    });
  }),

  // Toggle task completion
  toggleTask: catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const task = TaskModel.toggleComplete(id);

    if (!task) {
      return next(new NotFoundError(`Task with ID ${id} not found.`));
    }

    res.status(200).json({
      status: 'success',
      message: `Task completion status changed to ${task.completed}`,
      data: { task }
    });
  }),

  // Delete task
  deleteTask: catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const deleted = TaskModel.delete(id);

    if (!deleted) {
      return next(new NotFoundError(`Task with ID ${id} not found.`));
    }

    res.status(200).json({
      status: 'success',
      message: `Task ${id} deleted successfully.`
    });
  })
};
