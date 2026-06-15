import { AppError } from '../utils/errors.js';

// Stateful rate limiter
const ipRequests = new Map();
const LIMIT = 15; // Max 15 requests
const WINDOW_MS = 30000; // per 30 seconds

export const rateLimiterMiddleware = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();

  if (!ipRequests.has(ip)) {
    ipRequests.set(ip, {
      count: 1,
      resetTime: now + WINDOW_MS
    });
    return next();
  }

  const record = ipRequests.get(ip);

  // If window has expired, reset count
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + WINDOW_MS;
    return next();
  }

  record.count += 1;

  // Set standard rate limiting headers
  res.setHeader('X-RateLimit-Limit', LIMIT);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, LIMIT - record.count));
  res.setHeader('X-RateLimit-Reset', Math.ceil((record.resetTime - now) / 1000));

  if (record.count > LIMIT) {
    console.warn(`[RATE LIMIT] IP ${ip} has exceeded rate limit. Current count: ${record.count}`);
    return next(new AppError('Too many requests. Please try again after 30 seconds.', 429));
  }

  next();
};
