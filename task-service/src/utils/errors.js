export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message || 'Validation failed.', 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message) {
    super(message || 'Unauthorized access. Authentication token is required.', 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message) {
    super(message || 'Forbidden access. Permission denied.', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message) {
    super(message || 'Resource not found.', 404);
  }
}

export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
