const protocol = import.meta.env.VITE_API_PROTOCOL || window.location.protocol.replace(':','');
const host     = import.meta.env.VITE_API_HOST     || window.location.hostname;
const port     = import.meta.env.VITE_API_PORT     || '8000';
const API_BASE = import.meta.env.VITE_API_URL || `${protocol}://${host}:${port}`;
console.log('API_BASE =', API_BASE);

function getCookie(name) {
  const m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return m ? decodeURIComponent(m.pop()) : '';
}

async function api(path, { method = 'GET', body, csrf = false } = {}) {
  const headers = { Accept: 'application/json' };
  if (body) headers['Content-Type'] = 'application/json';
  if (csrf) headers['X-CSRFToken'] = getCookie('csrftoken');

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.detail || 'Request failed'), { status: res.status, data });
  return data;
}

export const auth = {
  csrf: () => api('/api/auth/csrf/'),
  login: (username, password) => api('/api/auth/login/', { method: 'POST', body: { username, password }, csrf: true }),
  logout: () => api('/api/auth/logout/', { method: 'POST', csrf: true }),
  me: () => api('/api/auth/user/'),
};
