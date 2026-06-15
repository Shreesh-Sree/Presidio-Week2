import { UnauthorizedError } from '../utils/errors.js';

// Route-specific mock authentication middleware
export const authMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  // Check if API key exists and is correct
  if (!apiKey) {
    return next(new UnauthorizedError('API key missing. Please provide the "x-api-key" header.'));
  }

  if (apiKey !== 'presidio-secret-key') {
    return next(new UnauthorizedError('Invalid API key. Access denied.'));
  }

  // Attach mock user metadata to request object for use down the pipeline
  req.user = {
    role: 'intern',
    name: 'Presidio Developer',
    permissions: ['read', 'write']
  };

  console.log(`[AUTH] Authenticated request from ${req.user.name} (${req.user.role})`);
  next();
};
