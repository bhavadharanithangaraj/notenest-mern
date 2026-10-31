// Register, login and "who am I". Successful register/login return
// { user, token }; the client sends that token on every later request.
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');
const AppError = require('../utils/AppError');

function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

async function register(req, res) {
  const { name, email, password } = req.valid.body;
  if (await User.exists({ email })) throw AppError.conflict('Email is already registered');

  const user = await User.create({ name, email, password });
  res.status(201).json({ user: user.toPublic(), token: signToken(user) });
}

async function login(req, res) {
  const { email, password } = req.valid.body;
  const user = await User.findOne({ email }).select('+password');

  // Same message for "unknown email" and "wrong password" so nobody can
  // find out which emails have accounts.
  if (!user || !(await user.comparePassword(password))) {
    throw AppError.unauthorized('Invalid email or password');
  }
  res.json({ user: user.toPublic(), token: signToken(user) });
}

async function me(req, res) {
  const user = await User.findById(req.userId);
  if (!user) throw AppError.unauthorized('Account no longer exists');
  res.json(user.toPublic());
}

module.exports = { register, login, me };
