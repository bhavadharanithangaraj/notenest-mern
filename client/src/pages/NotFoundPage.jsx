// Shown for any URL that doesn't match a route.
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="container state">
      <p className="state-icon" aria-hidden="true">🗺️</p>
      <h1>Page not found</h1>
      <p className="muted">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary btn-md">Back to my notes</Link>
    </main>
  );
}
