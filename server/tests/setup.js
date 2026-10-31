// Shared test helpers: connect to the test database, empty it before each
// test, and create a logged-in user. Tests run with Node's built-in runner
// (node --test); NODE_ENV=test makes config pick the notenest_test database.
process.env.NODE_ENV = 'test';

const { before, beforeEach, after } = require('node:test');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app');
const config = require('../src/config/env');
const User = require('../src/models/User');
const Note = require('../src/models/Note');

function useTestDatabase() {
  before(async () => {
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
    await User.init(); // make sure the unique email index exists
  });
  beforeEach(async () => {
    await Promise.all([User.deleteMany({}), Note.deleteMany({})]);
  });
  after(async () => {
    await mongoose.disconnect();
  });
}

async function registerUser(email = 'user@test.com', password = 'secret123') {
  const res = await request(app).post('/api/auth/register').send({ name: 'Test User', email, password });
  return { token: res.body.token, user: res.body.user };
}

module.exports = { app, useTestDatabase, registerUser };
