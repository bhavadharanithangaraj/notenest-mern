// Protects routes with JWT. Expects "Authorization: Bearer <token>", checks the
// signature and expiry, and stores the user's id on `req.userId`.
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const AppError = require('../utils/AppError');

function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(AppError.unauthorized('Missing or malformed Authorization header'));
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.userId = payload.sub;
    next();
  } catch {
    next(AppError.unauthorized('Invalid or expired token'));
  }
}

module.exports = requireAuth;
