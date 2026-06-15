import { logger } from '../utils/logger.js';

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  logger.info(`Incoming Request: ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  });

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`Request Completed: ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Duration: ${duration}ms`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration
    });
  });

  next();
};
