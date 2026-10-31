// Note model (MongoDB "notes" collection). Every note belongs to one user;
// `timestamps` adds createdAt/updatedAt automatically.
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, default: '', maxlength: 20000 },
    tags: { type: [String], default: [] },
    pinned: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    // Shape of a note in API responses: `id` instead of `_id`, no internal fields.
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.user;
        return ret;
      },
    },
  },
);

// Speeds up the most common query: "my notes, pinned first, newest first".
noteSchema.index({ user: 1, pinned: -1, updatedAt: -1 });
noteSchema.index({ user: 1, tags: 1 });

module.exports = mongoose.model('Note', noteSchema);
