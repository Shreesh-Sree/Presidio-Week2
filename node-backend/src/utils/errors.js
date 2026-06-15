// Custom base application error extending the built-in Error class
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Indicates it is a known/operational error, not a programming crash

    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 Bad Request
export class ValidationError extends AppError {
  constructor(message) {
    super(message || 'Validation failed. Please check your inputs.', 400);
  }
}

// 401 Unauthorized
export class UnauthorizedError extends AppError {
  constructor(message) {
    super(message || 'Unauthorized access. Authentication is required.', 401);
  }
}

// 404 Not Found
export class NotFoundError extends AppError {
  constructor(message) {
    super(message || 'The requested resource was not found.', 404);
  }
}

// Helper utility to wrap async controller functions and catch errors automatically
// This avoids writing try-catch blocks in every single async controller
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
