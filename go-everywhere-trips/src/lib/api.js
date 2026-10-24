// Thin client for the PHP endpoints in public/api (served by Hostinger in production,
// by `npm run php` through the Vite proxy in development).

const json = async (res) => {
  let body = {}
  try { body = await res.json() } catch { /* non-JSON error page */ }
  return { status: res.status, ...body, ok: res.ok && body.ok !== false }
}

export const fetchContent = () =>
  fetch('/api/content.php', { cache: 'no-cache' })
    .then(async (r) => (r.status === 404 ? { state: 'empty' } : r.ok ? { state: 'ok', data: await r.json() } : { state: 'error' }))
    .catch(() => ({ state: 'error' }))

const admin = (action, { method = 'GET', body, csrf } = {}) =>
  fetch(`/api/admin.php?action=${action}`, {
    method,
    credentials: 'same-origin',
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(csrf ? { 'X-CSRF': csrf } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
    .then(json)
    .catch(() => ({ ok: false, status: 0, error: 'Cannot reach the server' }))

export const adminApi = {
  me: () => admin('me'),
  login: (email, password) => admin('login', { method: 'POST', body: { email, password } }),
  logout: () => admin('logout', { method: 'POST' }),
  save: (content, csrf) => admin('save', { method: 'POST', body: content, csrf }),
  leads: () => admin('leads'),
  setLeadStatus: (id, status, csrf) => admin('lead-status', { method: 'POST', body: { id, status }, csrf }),
  backups: () => admin('backups'),
  restore: (id, csrf) => admin('restore', { method: 'POST', body: { id }, csrf }),
}

/** Fire-and-forget analytics ping (WhatsApp button clicks). */
export const track = (button) => {
  const payload = JSON.stringify({ source: 'whatsapp', enquiry: button, page: window.location.href })
  try {
    if (navigator.sendBeacon?.('/api/lead.php', new Blob([payload], { type: 'application/json' }))) return
  } catch { /* fall through */ }
  fetch('/api/lead.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {})
}
