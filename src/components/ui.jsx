import { useState } from 'react'

/* ── BADGE ───────────────────────────────────────────────────── */
const BADGE_STYLES = {
  green:  { bg: 'var(--green-bg)',     color: 'var(--green)'      },
  yellow: { bg: 'var(--yellow-bg)',    color: 'var(--yellow)'     },
  red:    { bg: 'var(--red-bg)',       color: 'var(--red)'        },
  blue:   { bg: 'var(--blue-bg)',      color: 'var(--blue)'       },
  gray:   { bg: 'var(--gray-bg)',      color: 'var(--gray)'       },
  purple: { bg: 'var(--purple-bg)',    color: 'var(--purple)'     },
  teal:   { bg: 'var(--accent-light)', color: 'var(--accent-dark)'},
}

export const ESTADO_BADGE = {
  ATENDIDA: 'green', PENDIENTE: 'blue', CANCELADA: 'red', NO_ASISTIO: 'gray',
}
export const ROL_BADGE = {
  SUPERADMIN: 'purple', ADMIN: 'teal', USUARIO: 'green', CONSULTA: 'yellow',
}

export function Badge({ label, variant = 'gray' }) {
  const s = BADGE_STYLES[variant] ?? BADGE_STYLES.gray
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 9px', borderRadius: 99,
      fontSize: 11, fontWeight: 600, letterSpacing: '.3px',
      textTransform: 'uppercase', background: s.bg, color: s.color,
      whiteSpace: 'nowrap',
    }}>{label}</span>
  )
}

/* ── BUTTON ──────────────────────────────────────────────────── */
export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, type = 'button', fullWidth }) {
  const styles = {
    primary:   { background: 'var(--accent)',        color: '#fff',             border: 'none' },
    secondary: { background: 'var(--surface-inset)', color: 'var(--ink-soft)',  border: '1px solid var(--border)' },
    danger:    { background: 'var(--red)',            color: '#fff',             border: 'none' },
    ghost:     { background: 'transparent',           color: 'var(--ink-muted)', border: '1px solid var(--border)' },
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      ...styles[variant],
      padding: size === 'sm' ? '5px 11px' : '8px 16px',
      fontSize: size === 'sm' ? 12 : 13, fontWeight: 600,
      borderRadius: 'var(--radius-sm)', cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? .5 : 1, transition: 'filter .15s',
      width: fullWidth ? '100%' : undefined,
      display: 'inline-flex', alignItems: 'center', gap: 6,
    }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.filter = 'brightness(.9)')}
      onMouseLeave={e => (e.currentTarget.style.filter = '')}
    >{children}</button>
  )
}

/* ── CARD ────────────────────────────────────────────────────── */
export function Card({ children, style }) {
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 'var(--radius)',
      border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', ...style,
    }}>{children}</div>
  )
}

/* ── STAT CARD ───────────────────────────────────────────────── */
export function StatCard({ label, value, icon, variant = 'teal' }) {
  const s = BADGE_STYLES[variant] ?? BADGE_STYLES.teal
  return (
    <Card style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.2 }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 3 }}>{label}</div>
      </div>
    </Card>
  )
}

/* ─────────────────────────────────────────────────────────────
   INPUT CON BLOQUEO REAL EN KEYDOWN
   
   El prop `allowPattern` es una RegExp que define qué caracteres
   están PERMITIDOS. Si el carácter presionado no coincide,
   se llama e.preventDefault() y nunca llega al input.
   
   Teclas de control (Backspace, Delete, Tab, flechas, Ctrl+C,
   Ctrl+V, Ctrl+A, etc.) siempre se permiten.
────────────────────────────────────────────────────────────── */
const CONTROL_KEYS = new Set([
  'Backspace','Delete','Tab','Enter','Escape',
  'ArrowLeft','ArrowRight','ArrowUp','ArrowDown',
  'Home','End','PageUp','PageDown',
  'F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12',
  'Shift','Control','Alt','Meta','CapsLock',
])

export function Input({ label, error, allowPattern, maxLength, ...props }) {
  const [touched, setTouched] = useState(false)
  const showErr = touched && error

  const handleKeyDown = (e) => {
    // Permitir repetición solo para Backspace y Delete, bloquear el resto
    if (e.repeat && e.key !== 'Backspace' && e.key !== 'Delete') { e.preventDefault(); return }
    // Siempre permitir teclas de control y combinaciones con Ctrl/Cmd
    if (CONTROL_KEYS.has(e.key) || e.ctrlKey || e.metaKey) {
      props.onKeyDown?.(e)
      return
    }
    // Si hay un patrón definido y el carácter NO lo cumple → bloquear
    if (allowPattern && !allowPattern.test(e.key)) {
      e.preventDefault()
      return
    }
    // Respetar maxLength antes de que el carácter entre
    if (maxLength && e.target.value.length >= maxLength) {
      // Solo bloquear si no hay texto seleccionado
      const { selectionStart, selectionEnd } = e.target
      if (selectionStart === selectionEnd) {
        e.preventDefault()
        return
      }
    }
    props.onKeyDown?.(e)
  }

  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: showErr ? 'var(--red)' : 'var(--ink-soft)' }}>{label}</span>
      <input
        {...props}
        maxLength={maxLength}
        onKeyDown={handleKeyDown}
        onBlur={e => { setTouched(true); props.onBlur?.(e) }}
        style={{
          border: `1px solid ${showErr ? 'var(--red)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-sm)', padding: '8px 11px', fontSize: 13,
          outline: 'none', background: props.disabled ? 'var(--surface-inset)' : 'var(--surface)',
          color: 'var(--ink)', transition: 'border .15s', width: '100%', ...props.style,
        }}
        onFocus={e => { e.target.style.borderColor = showErr ? 'var(--red)' : 'var(--accent)' }}
      />
      {showErr && <span style={{ fontSize: 11, color: 'var(--red)', marginTop: -2 }}>⚠ {error}</span>}
    </label>
  )
}

/* ── SELECT ──────────────────────────────────────────────────── */
export function Select({ label, error, children, ...props }) {
  const [touched, setTouched] = useState(false)
  const showErr = touched && error
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: showErr ? 'var(--red)' : 'var(--ink-soft)' }}>{label}</span>
      <select
        {...props}
        onBlur={e => { setTouched(true); props.onBlur?.(e) }}
        style={{
          border: `1px solid ${showErr ? 'var(--red)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-sm)', padding: '8px 11px', fontSize: 13,
          outline: 'none', background: 'var(--surface)', color: 'var(--ink)',
          transition: 'border .15s', width: '100%', ...props.style,
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
      >{children}</select>
      {showErr && <span style={{ fontSize: 11, color: 'var(--red)', marginTop: -2 }}>⚠ {error}</span>}
    </label>
  )
}

/* ── MODAL ───────────────────────────────────────────────────── */
export function Modal({ title, children, onClose, width = 500 }) {
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
        width, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto',
        animation: 'modalIn .2s ease both', boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 0' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, color: 'var(--ink-faint)', cursor: 'pointer', padding: 4 }}>✕</button>
        </div>
        <div style={{ padding: '16px 24px 24px' }}>{children}</div>
      </div>
    </div>
  )
}

/* ── TABLE ───────────────────────────────────────────────────── */
export function Table({ headers, rows }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{
                padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700,
                letterSpacing: '.4px', textTransform: 'uppercase', color: 'var(--ink-muted)',
                borderBottom: '1px solid var(--border)', background: 'var(--surface-raised)', whiteSpace: 'nowrap',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--border-soft)', transition: 'background .1s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-raised)')}
              onMouseLeave={e => (e.currentTarget.style.background = '')}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '11px 14px', color: 'var(--ink-soft)', verticalAlign: 'middle' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--ink-faint)', fontSize: 13 }}>Sin resultados</div>
      )}
    </div>
  )
}

/* ── PAGE HEADER ─────────────────────────────────────────────── */
export function PageHeader({ title, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)' }}>{title}</h1>
      {action}
    </div>
  )
}

/* ── SPINNER ─────────────────────────────────────────────────── */
export function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin .7s linear infinite' }} />
    </div>
  )
}

/* ── SEARCH INPUT ─────────────────────────────────────────────── */
export function SearchInput({ value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <span style={{ position: 'absolute', left: 10, color: 'var(--ink-faint)', fontSize: 14, pointerEvents: 'none' }}>🔍</span>
      <input
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? 'Buscar…'}
        style={{
          border: `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-sm)', padding: '8px 12px 8px 32px',
          fontSize: 13, outline: 'none', background: 'var(--surface)',
          color: 'var(--ink)', width: 240, transition: 'border .15s',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  )
}

/* ── ALERT ───────────────────────────────────────────────────── */
export function Alert({ message, variant = 'red' }) {
  const s = BADGE_STYLES[variant] ?? BADGE_STYLES.red
  return (
    <div style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}30`, borderRadius: 'var(--radius-sm)', padding: '9px 14px', fontSize: 13 }}>
      ⚠ {message}
    </div>
  )
}

/* ── FORM ROW / COL ──────────────────────────────────────────── */
export function FormRow({ children }) {
  return <div style={{ display: 'flex', gap: 12 }}>{children}</div>
}
export function FormCol({ children }) {
  return <div style={{ flex: 1 }}>{children}</div>
}

/* ─────────────────────────────────────────────────────────────
   PATRONES EXPORTADOS para usar en allowPattern de cada Input
────────────────────────────────────────────────────────────── */
export const PATTERNS = {
  // Solo letras (mayúsculas, minúsculas, tildes, ñ) y espacio
  soloLetras:  /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]$/,
  // Solo dígitos
  soloNumeros: /^\d$/,
  // Letras, números, espacio
  alfanumerico:/^[a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s]$/,
  // Número decimal: dígitos y UN punto
  decimal:     /^[\d.]$/,
  // Email: letras, números y caracteres especiales válidos
  email:       /^[a-zA-Z0-9._%+\-@]$/,
  // Dirección: letras, números, espacios y # / - .
  direccion:   /^[a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s#/\-.]$/,
}
