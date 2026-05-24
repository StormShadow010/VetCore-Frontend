const BASE = import.meta.env.VITE_API_URL ?? '/api/v1'

const getToken = () => localStorage.getItem('vetcore_token')

async function request(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message ?? 'Error desconocido')
  return json.data
}

export const api = {
  get:   (path)         => request(path),
  post:  (path, body)   => request(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:   (path, body)   => request(path, { method: 'PUT',    body: JSON.stringify(body) }),
  patch: (path, body)   => request(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  del:   (path)         => request(path, { method: 'DELETE' }),
}
