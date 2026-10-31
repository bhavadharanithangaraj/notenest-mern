// Route guards. <ProtectedRoute> only lets logged-in users through (others go
// to /login, remembering where they wanted to go). <GuestRoute> does the
// opposite for the login/register pages.
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

export function ProtectedRoute() {
  const { user, checking } = useAuth();
  const location = useLocation();

  if (checking) return <Spinner label="Checking your session…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

export function GuestRoute() {
  const { user, checking } = useAuth();

  if (checking) return <Spinner label="Checking your session…" />;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}
