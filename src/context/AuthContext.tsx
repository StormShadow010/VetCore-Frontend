import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { api } from '../services/api'
import type { User, Rol } from '../types'

const ROL_LEVEL: Record<Rol, number> = {
  CONSULTA: 1, USUARIO: 2, ADMIN: 3, SUPERADMIN: 4,
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  can: (minRol: Rol) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('vetcore_token'),
  )
  const [loading, setLoading] = useState(!!localStorage.getItem('vetcore_token'))

  useEffect(() => {
    if (!token) { setLoading(false); return }
    api.get<User>('/auth/me')
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('vetcore_token')
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [token])

  const login = async (username: string, password: string) => {
    const data = await api.post<{ token: string; user: User }>('/auth/login', {
      username, password,
    })
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
    (minRol: Rol) => !!user && ROL_LEVEL[user.rol] >= ROL_LEVEL[minRol],
    [user],
  )

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, can }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
