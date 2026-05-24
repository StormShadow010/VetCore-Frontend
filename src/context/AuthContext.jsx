import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

const ROL_LEVEL = { CONSULTA: 1, USUARIO: 2, ADMIN: 3, SUPERADMIN: 4 }
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('vetcore_token'))
  const [loading, setLoading] = useState(!!localStorage.getItem('vetcore_token'))

  useEffect(() => {
    if (!token) { setLoading(false); return }
    api.get('/auth/me')
      .then(setUser)
      .catch(() => { localStorage.removeItem('vetcore_token'); setToken(null) })
      .finally(() => setLoading(false))
  }, [token])

  const login = async (username, password) => {
    const data = await api.post('/auth/login', { username, password })
    localStorage.setItem('vetcore_token', data.token)
    setToken(data.token)
    setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem('vetcore_token')
    setToken(null)
    setUser(null)
  }

  const can = useCallback(
    (minRol) => !!user && ROL_LEVEL[user.rol] >= ROL_LEVEL[minRol],
    [user]
  )

  const is = useCallback((rol) => user?.rol === rol, [user])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, can, is }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
