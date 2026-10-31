// Checks parts of the request against zod schemas before the controller runs.
// Valid data is stored in `req.valid`; otherwise a 400 lists every bad field.
//   router.post('/', validate({ body: noteSchema }), controller.create)
const AppError = require('../utils/AppError');

function validate(schemas) {
  return (req, res, next) => {
    req.valid = {};
    const details = [];

    for (const part of ['params', 'query', 'body']) {
      if (!schemas[part]) continue;
      const result = schemas[part].safeParse(req[part] ?? {});
      if (result.success) req.valid[part] = result.data;
      else {
        for (const issue of result.error.issues) {
          details.push({ field: issue.path.join('.') || part, message: issue.message });
        }
      }
    }

    if (details.length) return next(AppError.badRequest('Validation failed', details));
    next();
  };
}

module.exports = validate;
