// User model (MongoDB "users" collection). The password is stored only as a
// bcrypt hash and is hidden from query results unless explicitly requested.
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
  },
  { timestamps: true },
);

// Hash the password automatically whenever it is set or changed.
userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.password);
};

// What the API sends back: no password, `id` instead of `_id`.
userSchema.methods.toPublic = function toPublic() {
  return { id: this._id.toString(), name: this.name, email: this.email, createdAt: this.createdAt };
};

module.exports = mongoose.model('User', userSchema);
