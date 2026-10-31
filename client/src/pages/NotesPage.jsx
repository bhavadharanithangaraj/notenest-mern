// The main screen: search bar, tag filter, pinned and other notes in a
// responsive grid, plus the create/edit modal and the delete confirmation.
// It shows a spinner while loading, a message when empty, and a retry on errors.
import { useState } from 'react';
import { notesApi } from '../api/client';
import useDebounce from '../hooks/useDebounce';
import useNotes from '../hooks/useNotes';
import Button from '../components/Button';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import NoteCard from '../components/NoteCard';
import NoteForm from '../components/NoteForm';
import SearchBar from '../components/SearchBar';
import Spinner from '../components/Spinner';
import StateMessage from '../components/StateMessage';
import { PlusIcon } from '../components/icons';

export default function NotesPage() {
  const [searchText, setSearchText] = useState('');
  const [tag, setTag] = useState('');
  const search = useDebounce(searchText.trim(), 300);
  const { notes, tags, status, error, reload } = useNotes({ search, tag });

  // editor: null (closed), { note: null } (create) or { note } (edit)
  const [editor, setEditor] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [actionError, setActionError] = useState('');

  const filtering = Boolean(search || tag);
  const pinned = notes.filter((n) => n.pinned);
  const others = notes.filter((n) => !n.pinned);

  async function saveNote(values) {
    if (editor.note) await notesApi.update(editor.note.id, values);
    else await notesApi.create(values);
    setEditor(null);
    await reload({ silent: true });
  }

  async function deleteNote() {
    try {
      await notesApi.remove(toDelete.id);
      setToDelete(null);
      await reload({ silent: true });
    } catch (err) {
      setToDelete(null);
      setActionError(err.message);
    }
  }

  async function togglePin(note) {
    setActionError('');
    try {
      await notesApi.update(note.id, { pinned: !note.pinned });
      await reload({ silent: true });
    } catch (err) {
      setActionError(err.message);
    }
  }

  function clearFilters() {
    setSearchText('');
    setTag('');
  }

  const cardProps = {
    onEdit: (note) => setEditor({ note }),
    onDelete: setToDelete,
    onTogglePin: togglePin,
    onTagClick: setTag,
  };

  let content;
  if (status === 'loading') {
    content = <Spinner label="Loading your notes…" />;
  } else if (status === 'error') {
    content = (
      <StateMessage
        role="alert"
        icon="⚠️"
        title="Couldn't load your notes"
        text={error}
        action={<Button onClick={() => reload()}>Try again</Button>}
      />
    );
  } else if (notes.length === 0 && filtering) {
    content = (
      <StateMessage
        icon="🔍"
        title="No matching notes"
        text={`Nothing found${search ? ` for "${search}"` : ''}${tag ? ` tagged #${tag}` : ''}.`}
        action={<Button variant="secondary" onClick={clearFilters}>Clear filters</Button>}
      />
    );
  } else if (notes.length === 0) {
    content = (
      <StateMessage
        icon="📝"
        title="No notes yet"
        text="Capture ideas, interview prep, to-dos — anything. Add tags to group them and pin the important ones."
        action={<Button onClick={() => setEditor({ note: null })}>Create your first note</Button>}
      />
    );
  } else {
    content = (
      <>
        {pinned.length > 0 && (
          <section aria-label="Pinned notes">
            <h2 className="section-title">Pinned</h2>
            <div className="notes-grid">
              {pinned.map((note) => <NoteCard key={note.id} note={note} {...cardProps} />)}
            </div>
          </section>
        )}
        {others.length > 0 && (
          <section aria-label="Other notes">
            {pinned.length > 0 && <h2 className="section-title">Others</h2>}
            <div className="notes-grid">
              {others.map((note) => <NoteCard key={note.id} note={note} {...cardProps} />)}
            </div>
          </section>
        )}
      </>
    );
  }

  return (
    <main className="container notes-page">
      <div className="notes-header">
        <h1>
          My notes {status === 'ready' && <span className="muted">({notes.length})</span>}
        </h1>
        <Button onClick={() => setEditor({ note: null })}>
          <PlusIcon /> New note
        </Button>
      </div>

      <div className="toolbar">
        <SearchBar value={searchText} onChange={setSearchText} placeholder="Search by title or tag" />
        {tags.length > 0 && (
          <div className="tag-filter" role="group" aria-label="Filter by tag">
            <button type="button" className="chip" aria-pressed={!tag} onClick={() => setTag('')}>All</button>
            {tags.map((t) => (
              <button key={t} type="button" className="chip" aria-pressed={tag === t} onClick={() => setTag(tag === t ? '' : t)}>
                #{t}
              </button>
            ))}
          </div>
        )}
      </div>

      {actionError && <p className="alert" role="alert" style={{ marginBottom: 16 }}>{actionError}</p>}
      {content}

      <Modal open={Boolean(editor)} title={editor?.note ? 'Edit note' : 'New note'} onClose={() => setEditor(null)}>
        {editor && <NoteForm note={editor.note} onSubmit={saveNote} onCancel={() => setEditor(null)} />}
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete note?"
        message={toDelete ? `"${toDelete.title}" will be permanently deleted.` : ''}
        onConfirm={deleteNote}
        onClose={() => setToDelete(null)}
      />
    </main>
  );
}
