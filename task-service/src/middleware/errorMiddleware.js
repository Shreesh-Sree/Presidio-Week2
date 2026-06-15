import { logger } from '../utils/logger.js';

export const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  const responsePayload = {
    status: err.status,
    message: err.message,
    statusCode: err.statusCode,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  if (process.env.NODE_ENV !== 'production') {
    responsePayload.stack = err.stack;
  }

  // Log error using Winston
  logger.error(`${req.method} ${req.originalUrl} - Status: ${err.statusCode} - Error: ${err.message}`, {
    stack: err.stack,
    path: req.originalUrl,
    method: req.method
  });

  res.status(err.statusCode).json(responsePayload);
};
