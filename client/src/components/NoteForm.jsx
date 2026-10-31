// Create/edit form shown inside the Modal. Tags are typed as a comma-separated
// list ("react, interview") and sent to the API as an array.
import { useState } from 'react';
import Button from './Button';
import TextField from './TextField';

export default function NoteForm({ note, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: note?.title ?? '',
    content: note?.content ?? '',
    tags: note?.tags.join(', ') ?? '',
    pinned: note?.pinned ?? false,
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (field) => (e) =>
    setForm({ ...form, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setMessage('');
    try {
      await onSubmit({
        title: form.title,
        content: form.content,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        pinned: form.pinned,
      });
    } catch (err) {
      setErrors(err.fieldErrors?.() ?? {});
      setMessage(err.details?.length ? '' : err.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="stack">
      {message && <p className="alert" role="alert">{message}</p>}
      <TextField label="Title" value={form.title} onChange={update('title')} error={errors.title} maxLength={200} />
      <TextField
        label="Content"
        multiline
        value={form.content}
        onChange={update('content')}
        error={errors.content}
        placeholder="Write anything…"
      />
      <TextField
        label="Tags"
        value={form.tags}
        onChange={update('tags')}
        error={errors.tags}
        hint="Separate with commas, e.g. react, interview"
      />
      <label className="checkbox">
        <input type="checkbox" checked={form.pinned} onChange={update('pinned')} />
        Pin this note to the top
      </label>
      <div className="modal-foot">
        <Button variant="ghost" onClick={onCancel} disabled={busy}>Cancel</Button>
        <Button type="submit" loading={busy}>{note ? 'Save changes' : 'Create note'}</Button>
      </div>
    </form>
  );
}
