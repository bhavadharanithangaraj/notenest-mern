// Error middleware. Every error ends up here and leaves in one shape:
//   { "error": { "status": 404, "code": "NOT_FOUND", "message": "...", "details": [...] } }
// It also translates common Mongoose/MongoDB errors into friendly 4xx responses.
const AppError = require('../utils/AppError');

// Runs when no route matched the request.
function notFound(req, res, next) {
  next(AppError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

function translate(err) {
  if (err instanceof AppError) return err;

  // Body is not valid JSON.
  if (err.type === 'entity.parse.failed') {
    return new AppError(400, 'INVALID_JSON', 'Request body is not valid JSON');
  }
  // A malformed id such as /api/notes/123 (MongoDB ids are 24 hex characters).
  if (err.name === 'CastError') {
    return AppError.badRequest(`Invalid ${err.path}: ${err.value}`);
  }
  // Mongoose schema rules failed (required, maxlength, ...).
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return AppError.badRequest('Validation failed', details);
  }
  // Unique index violated, e.g. an email that is already registered.
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return AppError.conflict(`That ${field} is already in use`);
  }
  return null;
}

// Express knows this is an error handler because it has 4 arguments.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const known = translate(err);
  const status = known?.status || 500;

  // Never leak stack traces or database messages to the client.
  if (!known) console.error(err);

  const body = {
    status,
    code: known?.code || 'INTERNAL_ERROR',
    message: known?.message || 'Something went wrong on the server',
  };
  if (known?.details) body.details = known.details;

  res.status(status).json({ error: body });
}

module.exports = { notFound, errorHandler };
