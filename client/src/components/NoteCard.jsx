// One note in the grid: title, a preview of the content, tags (click one to
// filter by it), when it was last edited, and pin / edit / delete buttons.
import { EditIcon, PinIcon, TrashIcon } from './icons';

const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

// "just now", "5 minutes ago", "yesterday", or a date for older notes.
function timeAgo(iso) {
  const seconds = Math.round((new Date(iso) - Date.now()) / 1000);
  if (Math.abs(seconds) < 45) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 7) return rtf.format(days, 'day');
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function NoteCard({ note, onEdit, onDelete, onTogglePin, onTagClick }) {
  return (
    <article className={`card note-card ${note.pinned ? 'pinned' : ''}`} aria-label={note.title}>
      <div className="note-card-head">
        <h3>{note.title}</h3>
        <button
          type="button"
          className={`icon-btn ${note.pinned ? 'active' : ''}`}
          onClick={() => onTogglePin(note)}
          aria-pressed={note.pinned}
          aria-label={note.pinned ? `Unpin "${note.title}"` : `Pin "${note.title}"`}
          title={note.pinned ? 'Unpin' : 'Pin'}
        >
          <PinIcon filled={note.pinned} />
        </button>
      </div>

      {note.content && <p className="note-content">{note.content}</p>}

      {note.tags.length > 0 && (
        <div className="note-tags">
          {note.tags.map((tag) => (
            <button key={tag} type="button" className="tag" onClick={() => onTagClick(tag)} title={`Show notes tagged "${tag}"`}>
              #{tag}
            </button>
          ))}
        </div>
      )}

      <div className="note-card-foot">
        <time className="note-date" dateTime={note.updatedAt}>Edited {timeAgo(note.updatedAt)}</time>
        <div className="note-actions">
          <button type="button" className="icon-btn" onClick={() => onEdit(note)} aria-label={`Edit "${note.title}"`} title="Edit">
            <EditIcon />
          </button>
          <button type="button" className="icon-btn danger" onClick={() => onDelete(note)} aria-label={`Delete "${note.title}"`} title="Delete">
            <TrashIcon />
          </button>
        </div>
      </div>
    </article>
  );
}
