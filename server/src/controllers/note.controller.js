// Notes CRUD and search. Every query filters by `user: req.userId`, so users
// only ever see their own notes; someone else's note simply returns 404.
const Note = require('../models/Note');
const AppError = require('../utils/AppError');

// Treat the user's search text literally inside a regular expression
// ("c++" should match "c++", not crash or match "ccc").
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/notes?search=&tag=&pinned=
async function list(req, res) {
  const { search, tag, pinned } = req.valid.query;
  const filter = { user: req.userId };

  if (tag) filter.tags = tag;
  if (pinned !== undefined) filter.pinned = pinned;
  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ title: pattern }, { tags: pattern }];
  }

  const notes = await Note.find(filter).sort({ pinned: -1, updatedAt: -1 });
  res.json({ data: notes, total: notes.length });
}

// GET /api/notes/tags -> every tag the user has used, for the filter chips.
async function listTags(req, res) {
  const tags = await Note.distinct('tags', { user: req.userId });
  res.json({ data: tags.sort() });
}

async function getById(req, res) {
  const note = await Note.findOne({ _id: req.valid.params.id, user: req.userId });
  if (!note) throw AppError.notFound('Note not found');
  res.json(note);
}

async function create(req, res) {
  const note = await Note.create({ ...req.valid.body, user: req.userId });
  res.status(201).json(note);
}

// PATCH: only the fields that were sent change, e.g. { pinned: true }.
async function update(req, res) {
  const note = await Note.findOneAndUpdate(
    { _id: req.valid.params.id, user: req.userId },
    { $set: req.valid.body },
    { returnDocument: 'after', runValidators: true },
  );
  if (!note) throw AppError.notFound('Note not found');
  res.json(note);
}

async function remove(req, res) {
  const result = await Note.deleteOne({ _id: req.valid.params.id, user: req.userId });
  if (result.deletedCount === 0) throw AppError.notFound('Note not found');
  res.status(204).end();
}

module.exports = { list, listTags, getById, create, update, remove };
