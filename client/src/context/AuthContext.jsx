// Holds "who is logged in" for the whole app. Any component can call
// useAuth() to get { user, login, register, logout }. On page load it checks
// the saved token with GET /auth/me, so a refresh keeps you logged in.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, tokenStore } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(() => Boolean(tokenStore.get()));

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    if (!tokenStore.get()) return;
    authApi
      .me()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setChecking(false));
  }, []);

  // The API client fires this when a request comes back 401 (token expired).
  useEffect(() => {
    window.addEventListener('auth:expired', logout);
    return () => window.removeEventListener('auth:expired', logout);
  }, [logout]);

  const value = useMemo(() => {
    const start = ({ user: u, token }) => {
      tokenStore.set(token);
      setUser(u);
    };
    return {
      user,
      checking,
      login: async (credentials) => start(await authApi.login(credentials)),
      register: async (details) => start(await authApi.register(details)),
      logout,
    };
  }, [user, checking, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
