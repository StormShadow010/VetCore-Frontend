import { ReactNode, useState } from 'react'
import type { Rol, EstadoCita } from '../types'

/* ── BADGE ───────────────────────────────────────────────────── */
type BadgeVariant = 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'purple' | 'teal'

const BADGE_STYLES: Record<BadgeVariant, { bg: string; color: string }> = {
  green:  { bg: 'var(--green-bg)',  color: 'var(--green)'  },
  yellow: { bg: 'var(--yellow-bg)', color: 'var(--yellow)' },
  red:    { bg: 'var(--red-bg)',    color: 'var(--red)'    },
  blue:   { bg: 'var(--blue-bg)',   color: 'var(--blue)'   },
  gray:   { bg: 'var(--gray-bg)',   color: 'var(--gray)'   },
  purple: { bg: 'var(--purple-bg)', color: 'var(--purple)' },
  teal:   { bg: 'var(--accent-light)', color: 'var(--accent-dark)' },
}

export const ESTADO_BADGE: Record<EstadoCita, BadgeVariant> = {
  ATENDIDA:   'green',
  PENDIENTE:  'blue',
  CANCELADA:  'red',
  NO_ASISTIO: 'gray',
}

export const ROL_BADGE: Record<Rol, BadgeVariant> = {
  SUPERADMIN: 'purple',
  ADMIN:      'teal',
  USUARIO:    'green',
  CONSULTA:   'yellow',
}

export function Badge({ label, variant }: { label: string; variant: BadgeVariant }) {
  const s = BADGE_STYLES[variant]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 9px', borderRadius: 99,
      fontSize: 11, fontWeight: 600,
      letterSpacing: '.3px', textTransform: 'uppercase',
      background: s.bg, color: s.color,
      whiteSpace: 'nowrap',
    }}>{label}</span>
  )
}

/* ── BUTTON ─────────────────────────────────────────────────── */
type BtnVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

export function Btn({
  children, onClick, variant = 'primary', size = 'md', disabled, type = 'button', fullWidth,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: BtnVariant
  size?: 'sm' | 'md'
  disabled?: boolean
  type?: 'button' | 'submit'
  fullWidth?: boolean
}) {
  const styles: Record<BtnVariant, object> = {
    primary:   { background: 'var(--accent)',       color: '#fff',              border: 'none' },
    secondary: { background: 'var(--surface-inset)', color: 'var(--ink-soft)',  border: '1px solid var(--border)' },
    danger:    { background: 'var(--red)',           color: '#fff',              border: 'none' },
    ghost:     { background: 'transparent',          color: 'var(--ink-muted)', border: '1px solid var(--border)' },
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant],
        padding: size === 'sm' ? '5px 11px' : '8px 16px',
        fontSize: size === 'sm' ? 12 : 13,
        fontWeight: 600,
        borderRadius: 'var(--radius-sm)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? .5 : 1,
        transition: 'opacity .15s, filter .15s',
        width: fullWidth ? '100%' : undefined,
        display: 'inline-flex', alignItems: 'center', gap: 6,
      }}
      onMouseEnter={e => !disabled && ((e.target as HTMLElement).style.filter = 'brightness(.93)')}
      onMouseLeave={e => ((e.target as HTMLElement).style.filter = '')}
    >{children}</button>
  )
}

/* ── CARD ───────────────────────────────────────────────────── */
export function Card({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 'var(--radius)',
      border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
      ...style,
    }}>{children}</div>
  )
}

/* ── STAT CARD ──────────────────────────────────────────────── */
export function StatCard({ label, value, icon, variant = 'teal' }: {
  label: string; value: string | number; icon: string; variant?: BadgeVariant
}) {
  const s = BADGE_STYLES[variant]
  return (
    <Card style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: s.bg, color: s.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.2 }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 3 }}>{label}</div>
      </div>
    </Card>
  )
}

/* ── INPUT ──────────────────────────────────────────────────── */
export function Input({
  label, error, ...props
}: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)' }}>{label}</span>
      <input
        {...props}
        style={{
          border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-sm)',
          padding: '8px 11px', fontSize: 13,
          outline: 'none', background: 'var(--surface)',
          color: 'var(--ink)', transition: 'border .15s',
          width: '100%',
          ...props.style,
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
        onBlur={e => (e.target.style.borderColor = error ? 'var(--red)' : 'var(--border)')}
      />
      {error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{error}</span>}
    </label>
  )
}

/* ── SELECT ─────────────────────────────────────────────────── */
export function Select({
  label, children, ...props
}: { label: string; children: ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)' }}>{label}</span>
      <select
        {...props}
        style={{
          border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
          padding: '8px 11px', fontSize: 13,
          outline: 'none', background: 'var(--surface)',
          color: 'var(--ink)', transition: 'border .15s', width: '100%',
          ...props.style,
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
        onBlur={e => (e.target.style.borderColor = 'var(--border)')}
      >{children}</select>
    </label>
  )
}

/* ── MODAL ──────────────────────────────────────────────────── */
export function Modal({ title, children, onClose, width = 480 }: {
  title: string; children: ReactNode; onClose: () => void; width?: number
}) {
  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
        width, maxWidth: '100%', maxHeight: '90vh',
        overflowY: 'auto', animation: 'modalIn .2s ease both',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 24px 0',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{title}</h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 18,
            color: 'var(--ink-faint)', cursor: 'pointer', lineHeight: 1,
            padding: 4,
          }}>✕</button>
        </div>
        <div style={{ padding: '16px 24px 24px' }}>{children}</div>
      </div>
    </div>
  )
}

/* ── TABLE ──────────────────────────────────────────────────── */
export function Table({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{
                padding: '10px 14px', textAlign: 'left',
                fontSize: 11, fontWeight: 700, letterSpacing: '.4px',
                textTransform: 'uppercase', color: 'var(--ink-muted)',
                borderBottom: '1px solid var(--border)',
                background: 'var(--surface-raised)', whiteSpace: 'nowrap',
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
                <td key={j} style={{ padding: '11px 14px', color: 'var(--ink-soft)', verticalAlign: 'middle' }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--ink-faint)', fontSize: 13 }}>
          Sin resultados
        </div>
      )}
    </div>
  )
}

/* ── PAGE HEADER ────────────────────────────────────────────── */
export function PageHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)' }}>{title}</h1>
      {action}
    </div>
  )
}

/* ── SPINNER ────────────────────────────────────────────────── */
export function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        border: '3px solid var(--border)',
        borderTopColor: 'var(--accent)',
        animation: 'spin .7s linear infinite',
      }} />
    </div>
  )
}

/* ── FORM ROW ───────────────────────────────────────────────── */
export function FormRow({ children }: { children: ReactNode }) {
  return <div style={{ display: 'flex', gap: 12, '> *': { flex: 1 } as object }}>{children}</div>
}

/* ── SEARCH INPUT ───────────────────────────────────────────── */
export function SearchInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <span style={{ position: 'absolute', left: 10, color: 'var(--ink-faint)', fontSize: 14, pointerEvents: 'none' }}>🔍</span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? 'Buscar…'}
        style={{
          border: `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-sm)',
          padding: '8px 12px 8px 32px',
          fontSize: 13, outline: 'none',
          background: 'var(--surface)', color: 'var(--ink)',
          width: 260, transition: 'border .15s',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  )
}

/* ── EMPTY STATE ────────────────────────────────────────────── */
export function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--ink-faint)' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 13 }}>{message}</p>
    </div>
  )
}

/* ── ALERT ──────────────────────────────────────────────────── */
export function Alert({ message, variant = 'red' }: { message: string; variant?: BadgeVariant }) {
  const s = BADGE_STYLES[variant]
  return (
    <div style={{
      background: s.bg, color: s.color,
      border: `1px solid ${s.color}30`,
      borderRadius: 'var(--radius-sm)',
      padding: '9px 14px', fontSize: 13,
    }}>{message}</div>
  )
}
