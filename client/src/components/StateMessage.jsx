// Friendly full-width message for empty and error states, with an optional
// action button (e.g. "Create your first note" or "Try again").
export default function StateMessage({ icon, title, text, action, role }) {
  return (
    <div className="state" role={role}>
      <p className="state-icon" aria-hidden="true">{icon}</p>
      <h2>{title}</h2>
      {text && <p className="muted">{text}</p>}
      {action}
    </div>
  );
}
