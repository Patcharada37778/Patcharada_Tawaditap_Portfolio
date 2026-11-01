const TOKEN_KEY = 'portfolio_admin_token';

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch { /* storage unavailable */ }
}

export async function api(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {};
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  let payload = body;
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(`/api${path}`, { method, headers, body: payload });
  if (res.status === 401 && auth) {
    setToken(null);
    window.location.assign('/admin/login');
    throw new Error('Sign in to continue.');
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status}). Retry in a moment.`);
  return data;
}

export async function uploadFile(file) {
  const form = new FormData();
  form.append('file', file);
  return api('/upload', { method: 'POST', body: form, auth: true });
}

// Description fields store one bullet per line.
export const lines = (text) => String(text || '').split('\n').map((l) => l.trim()).filter(Boolean);
export const csv = (text) => String(text || '').split(',').map((t) => t.trim()).filter(Boolean);
export const range = (a, b) => [a, b].filter(Boolean).join(' — ');
