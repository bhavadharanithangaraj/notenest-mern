// API tests for register, login and the protected /me route.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app, useTestDatabase, registerUser } = require('./setup');

useTestDatabase();

test('registers a user and never returns the password', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Bhava', email: 'Bhava@Example.com', password: 'secret123' });

  assert.equal(res.status, 201);
  assert.equal(typeof res.body.token, 'string');
  assert.equal(res.body.user.name, 'Bhava');
  assert.equal(res.body.user.email, 'bhava@example.com');
  assert.ok(!('password' in res.body.user));
});

test('rejects a duplicate email (409) and invalid input (400)', async () => {
  await registerUser('dup@test.com');

  const dup = await request(app).post('/api/auth/register').send({ name: 'X', email: 'dup@test.com', password: 'secret123' });
  assert.equal(dup.status, 409);

  const bad = await request(app).post('/api/auth/register').send({ email: 'nope', password: '1' });
  assert.equal(bad.status, 400);
  const fields = bad.body.error.details.map((d) => d.field);
  for (const f of ['name', 'email', 'password']) assert.ok(fields.includes(f), `missing error for ${f}`);
});

test('logs in with the right password and refuses a wrong one', async () => {
  await registerUser('login@test.com', 'secret123');

  const ok = await request(app).post('/api/auth/login').send({ email: 'login@test.com', password: 'secret123' });
  assert.equal(ok.status, 200);
  assert.equal(typeof ok.body.token, 'string');

  const wrong = await request(app).post('/api/auth/login').send({ email: 'login@test.com', password: 'wrong-pass' });
  assert.equal(wrong.status, 401);
  assert.equal(wrong.body.error.message, 'Invalid email or password');
});

test('protects /me with the JWT', async () => {
  const { token } = await registerUser('me@test.com');

  const ok = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
  assert.equal(ok.status, 200);
  assert.equal(ok.body.email, 'me@test.com');

  assert.equal((await request(app).get('/api/auth/me')).status, 401);
});
