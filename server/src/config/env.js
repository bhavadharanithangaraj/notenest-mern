// Reads all settings from .env (or real environment variables) in one place,
// so other files use `config.mongoUri` instead of `process.env.MONGO_URI`.
require('dotenv').config({ quiet: true });

const nodeEnv = process.env.NODE_ENV || 'development';

if (nodeEnv === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production');
}

const config = {
  nodeEnv,
  port: Number(process.env.PORT) || 5000,
  // Tests use their own database so they can wipe it freely.
  mongoUri:
    nodeEnv === 'test'
      ? process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/notenest_test'
      : process.env.MONGO_URI || 'mongodb://localhost:27017/notenest',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  // Websites allowed to call the API from a browser ("*" = any). Comma-separated.
  clientOrigin: process.env.CLIENT_ORIGIN || '*',
};

module.exports = config;
