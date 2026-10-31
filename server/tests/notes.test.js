// API tests for notes: CRUD, validation, search, tag filter, pin ordering
// and that users can't see each other's notes.
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app, useTestDatabase, registerUser } = require('./setup');

useTestDatabase();

let token;
const auth = () => ({ Authorization: `Bearer ${token}` });
const createNote = (body) => request(app).post('/api/notes').set(auth()).send(body);
const titles = (res) => res.body.data.map((n) => n.title);

beforeEach(async () => {
  ({ token } = await registerUser());
});

test('requires a token', async () => {
  assert.equal((await request(app).get('/api/notes')).status, 401);
});

test('creates a note with cleaned-up tags', async () => {
  const res = await createNote({ title: 'React hooks', content: 'useEffect cleanup', tags: [' React', 'react', 'Frontend'] });

  assert.equal(res.status, 201);
  assert.equal(res.body.title, 'React hooks');
  assert.equal(res.body.content, 'useEffect cleanup');
  assert.deepEqual(res.body.tags, ['react', 'frontend']);
  assert.equal(res.body.pinned, false);
  assert.match(res.body.id, /^[a-f\d]{24}$/);
  assert.ok(!('user' in res.body));
});

test('validates the note body (400)', async () => {
  const res = await createNote({ title: '', tags: 'not-an-array', pinned: 'yes' });

  assert.equal(res.status, 400);
  const fields = res.body.error.details.map((d) => d.field);
  for (const f of ['title', 'tags', 'pinned']) assert.ok(fields.includes(f), `missing error for ${f}`);
});

test('lists pinned notes first and searches by title or tag', async () => {
  await createNote({ title: 'Grocery list', tags: ['personal'] });
  await createNote({ title: 'Express middleware', tags: ['backend', 'node'] });
  await createNote({ title: 'Interview prep', tags: ['career'], pinned: true });

  const all = await request(app).get('/api/notes').set(auth());
  assert.equal(all.body.total, 3);
  assert.equal(all.body.data[0].title, 'Interview prep'); // pinned first

  assert.deepEqual(titles(await request(app).get('/api/notes?search=EXPRESS').set(auth())), ['Express middleware']);
  assert.deepEqual(titles(await request(app).get('/api/notes?search=node').set(auth())), ['Express middleware']);
  assert.deepEqual(titles(await request(app).get('/api/notes?tag=personal').set(auth())), ['Grocery list']);

  const tags = await request(app).get('/api/notes/tags').set(auth());
  assert.deepEqual(tags.body.data, ['backend', 'career', 'node', 'personal']);
});

test('treats search text literally (no regex injection)', async () => {
  await createNote({ title: 'C++ basics' });
  const res = await request(app).get('/api/notes?search=c%2B%2B').set(auth());
  assert.equal(res.status, 200);
  assert.deepEqual(titles(res), ['C++ basics']);
});

test('updates only the fields sent and can pin a note', async () => {
  const { body: note } = await createNote({ title: 'Draft', content: 'keep me' });

  const res = await request(app).patch(`/api/notes/${note.id}`).set(auth()).send({ pinned: true });
  assert.equal(res.status, 200);
  assert.equal(res.body.title, 'Draft');
  assert.equal(res.body.content, 'keep me');
  assert.equal(res.body.pinned, true);
});

test('deletes a note, then returns 404 for it', async () => {
  const { body: note } = await createNote({ title: 'Temporary' });

  assert.equal((await request(app).delete(`/api/notes/${note.id}`).set(auth())).status, 204);
  assert.equal((await request(app).get(`/api/notes/${note.id}`).set(auth())).status, 404);
});

test("hides other users' notes (404) and rejects bad ids (400)", async () => {
  const { body: note } = await createNote({ title: 'Private' });
  const other = await registerUser('other@test.com');

  const res = await request(app).get(`/api/notes/${note.id}`).set('Authorization', `Bearer ${other.token}`);
  assert.equal(res.status, 404);

  assert.equal((await request(app).get('/api/notes/123').set(auth())).status, 400);
});
