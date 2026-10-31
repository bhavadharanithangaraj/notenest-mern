// The login/register form used by LoginPage and RegisterPage: holds the form
// values, submits through useAuth(), and shows API errors under the right
// inputs. After login it returns you to the page you originally wanted.
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import TextField from './TextField';

export default function AuthForm({ mode }) {
  const isRegister = mode === 'register';
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setMessage('');
    try {
      if (isRegister) await auth.register(form);
      else await auth.login({ email: form.email, password: form.password });
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setErrors(err.fieldErrors?.() ?? {});
      setMessage(err.details?.length ? '' : err.message);
      setBusy(false);
    }
  }

  return (
    <main className="container auth-page">
      <section className="card auth-card">
        <h1>{isRegister ? 'Create your account' : 'Welcome back'}</h1>
        <p className="muted">{isRegister ? 'Start keeping your notes in one place.' : 'Log in to see your notes.'}</p>

        <form onSubmit={handleSubmit} noValidate className="stack">
          {message && <p className="alert" role="alert">{message}</p>}
          {isRegister && (
            <TextField label="Name" value={form.name} onChange={update('name')} error={errors.name} autoComplete="name" />
          )}
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={update('email')}
            error={errors.email}
            autoComplete="email"
          />
          <TextField
            label="Password"
            type="password"
            value={form.password}
            onChange={update('password')}
            error={errors.password}
            hint={isRegister ? 'At least 8 characters' : undefined}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
          />
          <Button type="submit" loading={busy} className="btn-block">
            {isRegister ? 'Create account' : 'Log in'}
          </Button>
        </form>

        <p className="auth-switch muted">
          {isRegister ? 'Already have an account? ' : 'New to NoteNest? '}
          <Link to={isRegister ? '/login' : '/register'} state={location.state}>
            {isRegister ? 'Log in' : 'Create an account'}
          </Link>
        </p>
      </section>
    </main>
  );
}
