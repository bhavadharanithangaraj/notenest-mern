// The only file that talks to the server. It adds the JWT header, parses JSON
// and turns error responses { error: { message, details } } into ApiError,
// so pages can show messages next to the right input.
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000')
  .replace(/\/+$/, '')
  .replace(/(?<!\/api)$/, '/api'); // works with or without "/api" at the end

const TOKEN_KEY = 'notenest_token';

export class ApiError extends Error {
  constructor(status, message, details = []) {
    super(message);
    this.status = status;
    this.details = details;
  }

  // { title: 'Title is required', ... } for showing errors under inputs.
  fieldErrors() {
    return Object.fromEntries(this.details.map((d) => [d.field.split('.')[0], d.message]));
  }
}

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request(path, { method = 'GET', body, signal } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      signal,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.');
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // An expired/invalid token while logged in: tell the app to log out.
    if (res.status === 401 && token) window.dispatchEvent(new Event('auth:expired'));
    const err = data?.error ?? {};
    throw new ApiError(res.status, err.message || `Request failed (${res.status})`, err.details);
  }
  return data;
}

export const authApi = {
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  me: () => request('/auth/me'),
};

export const notesApi = {
  list: ({ search, tag, signal } = {}) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (tag) params.set('tag', tag);
    const qs = params.toString();
    return request(`/notes${qs ? `?${qs}` : ''}`, { signal });
  },
  tags: () => request('/notes/tags'),
  create: (body) => request('/notes', { method: 'POST', body }),
  update: (id, body) => request(`/notes/${id}`, { method: 'PATCH', body }),
  remove: (id) => request(`/notes/${id}`, { method: 'DELETE' }),
};
