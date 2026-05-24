const BASE = import.meta.env.VITE_API_URL ?? '/api/v1'

const getToken = () => localStorage.getItem('vetcore_token')

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  const json = await res.json()
  if (!res.ok) throw new ApiError(res.status, json.message ?? 'Error desconocido')
  return json.data as T
}

const get  = <T>(path: string) => request<T>(path)
const post = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body) })
const put  = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'PUT', body: JSON.stringify(body) })
const patch = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'PATCH', body: JSON.stringify(body) })
const del  = <T>(path: string) => request<T>(path, { method: 'DELETE' })

export const api = { get, post, put, patch, del }
export { ApiError }
