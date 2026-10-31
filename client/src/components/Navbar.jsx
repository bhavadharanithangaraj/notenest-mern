// Top bar: logo on the left; the user's name and a logout button on the right
// when someone is logged in.
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-logo" aria-hidden="true">✎</span>
          NoteNest
        </Link>
        {user && (
          <div className="navbar-user">
            <span className="muted hide-sm">Hi, {user.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>Log out</Button>
          </div>
        )}
      </div>
    </header>
  );
}
