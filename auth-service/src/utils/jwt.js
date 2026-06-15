import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'presidio-super-secret-jwt-key-for-week-2';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

export const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};
