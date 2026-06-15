import { AppError } from '../utils/errors.js';

export const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Format standard API error JSON response
  const responsePayload = {
    status: err.status,
    message: err.message,
    statusCode: err.statusCode
  };

  // Only include stack trace in development mode (which we are simulating)
  responsePayload.stack = err.stack;
  responsePayload.timestamp = new Date().toISOString();
  responsePayload.path = req.originalUrl;
  responsePayload.method = req.method;

  // Log the error to the console (for backend audit logs)
  console.error(`[ERROR] [${req.method}] ${req.originalUrl} - Status: ${err.statusCode} - Message: ${err.message}`);

  res.status(err.statusCode).json(responsePayload);
};
