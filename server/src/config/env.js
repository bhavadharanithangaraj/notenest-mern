// Reads all settings from .env (or real environment variables) in one place,
// so other files use `config.mongoUri` instead of `process.env.MONGO_URI`.
require('dotenv').config({ quiet: true });

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/notenest',
  // Websites allowed to call the API from a browser ("*" = any). Comma-separated.
  clientOrigin: process.env.CLIENT_ORIGIN || '*',
};

module.exports = config;
