// Validation rules (zod) for notes: create/update bodies, the search query
// string and the :id URL parameter.
const { z } = require('zod');

// Tags are trimmed, lowercased and de-duplicated: [" Work", "work"] -> ["work"].
const tags = z
  .array(z.string().trim().toLowerCase().min(1, 'Tags cannot be empty').max(30, 'Each tag must be at most 30 characters'))
  .max(10, 'A note can have at most 10 tags')
  .transform((list) => [...new Set(list)]);

const title = z.string({ error: 'Title is required' }).trim().min(1, 'Title is required').max(200);
const content = z.string().max(20000, 'Content must be at most 20,000 characters');

const createNoteSchema = z.object({
  title,
  content: content.default(''),
  tags: tags.default([]),
  pinned: z.boolean().default(false),
});

// PATCH: any field may be sent, but at least one.
const updateNoteSchema = z
  .object({
    title: title.optional(),
    content: content.optional(),
    tags: tags.optional(),
    pinned: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'Provide at least one field to update' });

// GET /api/notes?search=react&tag=work&pinned=true
const listNotesQuery = z.object({
  search: z.string().trim().max(100).optional(),
  tag: z.string().trim().toLowerCase().max(30).optional(),
  pinned: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
});

const noteIdParams = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid note id'),
});

module.exports = { createNoteSchema, updateNoteSchema, listNotesQuery, noteIdParams };
