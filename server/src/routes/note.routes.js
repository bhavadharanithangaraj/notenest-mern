// Notes URLs, mounted at /api/notes. `router.use(requireAuth)` means every
// route below needs a valid JWT.
const { Router } = require('express');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/auth');
const { createNoteSchema, updateNoteSchema, listNotesQuery, noteIdParams } = require('../validators/note.schema');
const controller = require('../controllers/note.controller');

const router = Router();

router.use(requireAuth);

router.get('/', validate({ query: listNotesQuery }), controller.list);
router.get('/tags', controller.listTags); // before "/:id" so "tags" isn't read as an id
router.post('/', validate({ body: createNoteSchema }), controller.create);
router.get('/:id', validate({ params: noteIdParams }), controller.getById);
router.patch('/:id', validate({ params: noteIdParams, body: updateNoteSchema }), controller.update);
router.delete('/:id', validate({ params: noteIdParams }), controller.remove);

module.exports = router;
