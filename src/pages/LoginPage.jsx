import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Btn, Alert, PATTERNS } from '../components/ui'

const CONTROL_KEYS = new Set([
  'Backspace','Delete','Tab','Enter','Escape',
  'ArrowLeft','ArrowRight','ArrowUp','ArrowDown',
  'Home','End','Shift','Control','Alt','Meta','CapsLock',
])

// Input simple para login (sin el componente genérico para tener más control visual)
function LoginInput({ label, type = 'text', value, onChange, error, allowPattern, placeholder, maxLength, autoComplete }) {
  const [focused, setFocused] = useState(false)

  const handleKeyDown = (e) => {
    // Permitir repetición solo para Backspace y Delete, bloquear el resto
    if (e.repeat && e.key !== 'Backspace' && e.key !== 'Delete') { e.preventDefault(); return }
    if (CONTROL_KEYS.has(e.key) || e.ctrlKey || e.metaKey) return
    if (allowPattern && !allowPattern.test(e.key)) { e.preventDefault(); return }
    if (maxLength && e.target.value.length >= maxLength) {
      const { selectionStart, selectionEnd } = e.target
      if (selectionStart === selectionEnd) { e.preventDefault(); return }
    }
  }

  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: error ? 'var(--red)' : 'var(--ink-soft)' }}>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          border: `1px solid ${error ? 'var(--red)' : focused ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-sm)', padding: '9px 12px', fontSize: 13,
          outline: 'none', width: '100%', fontFamily: 'inherit', transition: 'border .15s',
        }}
      />
      {error && <span style={{ fontSize: 11, color: 'var(--red)' }}>⚠ {error}</span>}
    </label>
  )
}

export default function LoginPage() {
  const { login } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  const handleSubmit = async () => {
    const newErrors = {}
    if (!form.username.trim()) newErrors.username = 'El usuario o email es obligatorio'
    if (!form.password) newErrors.password = 'La contraseña es obligatoria'
    if (Object.keys(newErrors).length) { setErrors(newErrors); return }
    setLoading(true); setApiError('')
    try { await login(form.username, form.password) }
    catch (e) { setApiError('Credenciales incorrectas. Verifica tu usuario y contraseña.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--surface-raised)' }}>
      {/* Panel izquierdo */}
      <div style={{ flex: 1, background: 'var(--sidebar-bg)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 64px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(13,148,136,.12)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(13,148,136,.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 400 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{ width: 42, height: 42, background: 'var(--accent)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🐾</div>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#F9FAFB' }}>VetCore</span>
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#F9FAFB', lineHeight: 1.2, marginBottom: 14 }}>
            Gestión veterinaria<br /><span style={{ color: 'var(--accent)' }}>centralizada.</span>
          </h1>
          <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.6 }}>Mascotas, citas, consultas, medicamentos y facturación en un solo sistema.</p>
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[['🐾','Registro completo de pacientes y propietarios'],['📅','Agenda y control de citas médicas'],['💊','Inventario de medicamentos en tiempo real']].map(([icon, text]) => (
              <div key={icon} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#9CA3AF', fontSize: 13 }}>
                <span style={{ fontSize: 16 }}>{icon}</span>{text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho */}
      <div style={{ width: 440, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 360, animation: 'fadeIn .3s ease' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Iniciar sesión</h2>
          <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 28 }}>Accede con tus credenciales</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <LoginInput
              label="Usuario o Email"
              value={form.username}
              error={errors.username}
              placeholder="admin"
              autoComplete="username"
              maxLength={150}
              onChange={e => set('username', e.target.value)}
            />
            <LoginInput
              label="Contraseña"
              type="password"
              value={form.password}
              error={errors.password}
              placeholder="••••••••"
              autoComplete="current-password"
              maxLength={128}
              onChange={e => set('password', e.target.value)}
              // onKeyDown heredado del LoginInput maneja Enter
            />
            {apiError && <Alert message={apiError} />}
            <Btn onClick={handleSubmit} disabled={loading} fullWidth>
              {loading ? 'Entrando…' : 'Ingresar →'}
            </Btn>
          </div>

          {/* Demo */}
          <div style={{ marginTop: 28, padding: 16, background: 'var(--surface-inset)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.4px' }}>Cuentas de demo</p>
            {[['superadmin','SUPERADMIN'],['admin','ADMIN'],['usuario','USUARIO'],['consulta','CONSULTA']].map(([u, r]) => (
              <button key={u} onClick={() => setForm({ username: u, password: 'password' })} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%',
                background: 'none', border: 'none', cursor: 'pointer', padding: '3px 0', fontSize: 12, color: 'var(--ink-soft)',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-soft)')}
              >
                <span style={{ fontFamily: 'var(--font-mono)' }}>{u}</span>
                <span style={{ color: 'var(--ink-faint)', fontSize: 11 }}>{r}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
