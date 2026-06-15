import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

const JWT_SECRET = process.env.JWT_SECRET || 'presidio-super-secret-jwt-key-for-week-2';

// Middleware to authenticate user via JWT token
export const authenticateUser = (req, res, next) => {
  let token;

  // Check if authorization header exists and starts with Bearer
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new UnauthorizedError('Access denied. No authentication token provided.'));
  }

  try {
    // Verify token statelessly
    const decodedPayload = jwt.verify(token, JWT_SECRET);
    
    // Attach decoded user information to the request
    req.user = {
      id: decodedPayload.id,
      username: decodedPayload.username,
      role: decodedPayload.role
    };

    next();
  } catch (err) {
    return next(new UnauthorizedError('Authentication failed. Invalid or expired token.'));
  }
};

// Middleware to restrict access based on user roles (RBAC)
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required to perform RBAC checks.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError(`Access denied. Role "${req.user.role}" does not have permissions to execute this action.`));
    }

    next();
  };
};
