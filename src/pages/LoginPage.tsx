import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Alert, Btn, Input } from '../components/ui'

export default function LoginPage() {
  const { login } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.username || !form.password) {
      setError('Completa todos los campos')
      return
    }
    setLoading(true)
    setError('')
    try {
      await login(form.username, form.password)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--surface-raised)',
    }}>
      {/* Left panel */}
      <div style={{
        flex: 1, background: 'var(--sidebar-bg)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '60px 64px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(13,148,136,.12)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(13,148,136,.08)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 400 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{ width: 42, height: 42, background: 'var(--accent)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🐾</div>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#F9FAFB' }}>VetCore</span>
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#F9FAFB', lineHeight: 1.2, marginBottom: 14 }}>
            Gestión veterinaria<br />
            <span style={{ color: 'var(--accent)' }}>centralizada.</span>
          </h1>
          <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.6 }}>
            Mascotas, citas, consultas, medicamentos y facturación en un solo sistema.
          </p>

          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: '🐾', text: 'Registro completo de pacientes y propietarios' },
              { icon: '📅', text: 'Agenda y control de citas médicas' },
              { icon: '💊', text: 'Inventario de medicamentos en tiempo real' },
            ].map(item => (
              <div key={item.icon} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#9CA3AF', fontSize: 13 }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        width: 440, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 40,
      }}>
        <div style={{ width: '100%', maxWidth: 360, animation: 'fadeIn .3s ease' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Iniciar sesión</h2>
          <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 28 }}>
            Accede con tus credenciales
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input
              label="Usuario o Email"
              placeholder="admin"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              autoComplete="username"
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              autoComplete="current-password"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />

            {error && <Alert message={error} />}

            <Btn onClick={handleSubmit} disabled={loading} fullWidth>
              {loading ? 'Entrando…' : 'Ingresar →'}
            </Btn>
          </div>

          <div style={{ marginTop: 28, padding: 16, background: 'var(--surface-inset)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.4px' }}>Cuentas de demo</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { u: 'superadmin', r: 'SUPERADMIN' },
                { u: 'admin',      r: 'ADMIN' },
                { u: 'usuario',    r: 'USUARIO' },
                { u: 'consulta',   r: 'CONSULTA' },
              ].map(({ u, r }) => (
                <button key={u} onClick={() => setForm({ username: u, password: 'Vetcore2024!' })}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '3px 0', fontSize: 12, color: 'var(--ink-soft)',
                  }}
                  onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--accent)')}
                  onMouseLeave={e => ((e.target as HTMLElement).style.color = 'var(--ink-soft)')}
                >
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{u}</span>
                  <span style={{ color: 'var(--ink-faint)', fontSize: 11 }}>{r}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
