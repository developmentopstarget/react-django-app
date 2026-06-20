const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:8000`
).replace(/\/$/, '');

function getCookie(name) {
  const match = document.cookie.match(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`);
  return match ? decodeURIComponent(match.pop()) : '';
}

async function api(path, { method = 'GET', body, csrf = false } = {}) {
  const headers = { Accept: 'application/json' };

  if (body) headers['Content-Type'] = 'application/json';
  if (csrf) headers['X-CSRFToken'] = getCookie('csrftoken');

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw Object.assign(new Error(data.detail || 'Request failed'), {
      status: response.status,
      data,
    });
  }

  return data;
}

export default api;