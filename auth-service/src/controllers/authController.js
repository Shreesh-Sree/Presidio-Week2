import bcrypt from 'bcryptjs';
import { signToken } from '../utils/jwt.js';
import { ValidationError, UnauthorizedError, catchAsync } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

// In-memory User storage
const users = [];

// Pre-populate with seed users (password hashed)
const seedUsers = async () => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);
  
  users.push({
    id: 1,
    username: 'admin_user',
    password: hashedPassword,
    role: 'admin',
    createdAt: new Date().toISOString()
  });

  users.push({
    id: 2,
    username: 'intern_user',
    password: hashedPassword,
    role: 'intern',
    createdAt: new Date().toISOString()
  });
  
  logger.info('Auth Service: Pre-populated memory with admin_user and intern_user.');
};

seedUsers();

let nextUserId = 3;

export const AuthController = {
  // Signup
  signup: catchAsync(async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      throw new ValidationError('Username, password, and role are required.');
    }

    if (role !== 'admin' && role !== 'intern') {
      throw new ValidationError('Role must be either "admin" or "intern".');
    }

    // Check if user exists
    const userExists = users.find(u => u.username === username.trim().toLowerCase());
    if (userExists) {
      throw new ValidationError(`Username "${username}" is already taken.`);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: nextUserId++,
      username: username.trim().toLowerCase(),
      password: hashedPassword,
      role,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    logger.info(`User signed up: ${newUser.username} with role ${newUser.role}`);

    // Issue JWT token
    const token = signToken({
      id: newUser.id,
      username: newUser.username,
      role: newUser.role
    });

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role
        }
      }
    });
  }),

  // Login
  login: catchAsync(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new ValidationError('Username and password are required.');
    }

    const user = users.find(u => u.username === username.trim().toLowerCase());
    if (!user) {
      throw new UnauthorizedError('Invalid credentials. User not found.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials. Password incorrect.');
    }

    // Issue JWT token
    const token = signToken({
      id: user.id,
      username: user.username,
      role: user.role
    });

    logger.info(`User logged in: ${user.username} with role ${user.role}`);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      }
    });
  }),

  // Get current user details from validated token
  getCurrentUser: catchAsync(async (req, res) => {
    // If the token is verified in middleware, user metadata is attached to request
    res.status(200).json({
      status: 'success',
      data: {
        user: req.user
      }
    });
  })
};
