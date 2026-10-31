// Connects Mongoose to MongoDB once at startup. Mongoose keeps the connection
// open and reuses it for every query, so models can be used anywhere afterwards.
const mongoose = require('mongoose');
const config = require('./env');

async function connectDB() {
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
}

module.exports = connectDB;
