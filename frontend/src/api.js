// frontend/src/api.js
const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[2]) : null;
}

async function request(path, { method = 'GET', body, headers = {}, signal } = {}) {
  const opts = {
    method,
    headers: {
      'Accept': 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    credentials: 'include',
    signal,
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrftoken = getCookie('csrftoken');
    if (csrftoken) opts.headers['X-CSRFToken'] = csrftoken;
  }

  const res = await fetch(`${API_BASE}${path}`, opts);
  if (!res.ok) {
    let detail;
    try { detail = await res.json(); } catch { detail = { detail: res.statusText }; }
    const err = new Error(detail?.detail || `HTTP ${res.status}`);
    err.status = res.status;
    err.payload = detail;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

// add helper for querystring
function qs(params = {}) {
  const p = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null && v !== '')
  );
  const s = p.toString();
  return s ? `?${s}` : '';
}

export const api = {
  listItems: ({ search, signal } = {}) =>
    request(`/api/items/${qs({ search })}`, { signal }),
  createItem: (data) => request('/api/items/', { method: 'POST', body: data }),
  patchItem: (id, data) => request(`/api/items/${id}/`, { method: 'PATCH', body: data }),
  deleteItem: (id) => request(`/api/items/${id}/`, { method: 'DELETE' }),
};


