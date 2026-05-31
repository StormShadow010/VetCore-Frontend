import { useAuth } from '../context/AuthContext'
import { Badge, ROL_BADGE } from './ui'
import { useState } from 'react'

/*
  ─── DEFINICIÓN DE ROLES ──────────────────────────────────────
  SUPERADMIN  Dueño del sistema: acceso total, puede eliminar permanentemente
  ADMIN       Auxiliar/secretario: gestión operativa, puede desactivar registros
  USUARIO     Cliente registrado: solo sus mascotas, sus citas, ver veterinarios/esp/especies
  CONSULTA    Solo lectura: ve todo el sidebar pero sin ningún botón de acción
  ─────────────────────────────────────────────────────────────

  Sidebar por rol:
  SUPERADMIN  → todo
  ADMIN       → Dashboard, Citas, Mascotas, Propietarios, Veterinarios, Especialidades,
                Especies, Medicamentos, Facturas, Consultas SQL
  USUARIO     → Dashboard, Mis Citas, Mis Mascotas, Veterinarios, Especialidades, Especies
  CONSULTA    → Todo el sidebar (igual que ADMIN) pero sin botones de acción en las páginas
*/
const NAV = [
  { key: 'dashboard',      label: 'Dashboard',      icon: '◈', section: 'General',
    roles: ['SUPERADMIN','ADMIN','USUARIO','CONSULTA'] },

  { key: 'citas',          label: 'Citas',           icon: '◷', section: 'Clínica',
    roles: ['SUPERADMIN','ADMIN','USUARIO','CONSULTA'] },
  { key: 'mascotas',       label: 'Mascotas',        icon: '◎',
    roles: ['SUPERADMIN','ADMIN','USUARIO','CONSULTA'] },
  { key: 'propietarios',   label: 'Propietarios',    icon: '◉',
    roles: ['SUPERADMIN','ADMIN','CONSULTA'] },
  { key: 'veterinarios',   label: 'Veterinarios',    icon: '✦',
    roles: ['SUPERADMIN','ADMIN','USUARIO','CONSULTA'] },
  { key: 'especialidades', label: 'Especialidades',  icon: '❖',
    roles: ['SUPERADMIN','ADMIN','USUARIO','CONSULTA'] },
  { key: 'especies',       label: 'Especies',        icon: '⬡',
    roles: ['SUPERADMIN','ADMIN','USUARIO','CONSULTA'] },

  { key: 'medicamentos',   label: 'Medicamentos',    icon: '⊕', section: 'Administración',
    roles: ['SUPERADMIN','ADMIN','CONSULTA'] },
  { key: 'facturas',       label: 'Facturas',        icon: '◫',
    roles: ['SUPERADMIN','ADMIN','CONSULTA'] },

  { key: 'consultas_sql',  label: 'Consultas SQL',   icon: '⌨', section: 'Reportes',
    roles: ['SUPERADMIN','ADMIN','CONSULTA'] },

  { key: 'usuarios',       label: 'Usuarios',        icon: '◧', section: 'Sistema',
    roles: ['SUPERADMIN'] },
]

export default function Sidebar({ active, setPage }) {
  const { user, logout } = useAuth()
  const userRol = user?.rol ?? 'CONSULTA'
  const visible = NAV.filter(n => n.roles.includes(userRol))

  // Tema manejado globalmente por ThemeToggle en App.jsx

  // Agrupar por sección
  const sections = []
  let cur = []; let curTitle = ''
  for (const item of visible) {
    if (item.section && item.section !== curTitle) {
      if (cur.length) sections.push({ title: curTitle, items: cur })
      curTitle = item.section; cur = [item]
    } else { cur.push(item) }
  }
  if (cur.length) sections.push({ title: curTitle, items: cur })

  return (
    <aside style={{
      width: 'var(--sidebar-w)', background: 'var(--sidebar-bg)',
      display: 'flex', flexDirection: 'column', minHeight: '100vh', flexShrink: 0,
      borderRight: '1px solid var(--sidebar-border, #e5e7eb)',
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid var(--sidebar-border, #e5e7eb)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: 'var(--sidebar-active)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🐾</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--sidebar-text)' }}>VetCore</div>
            <div style={{ fontSize: 10, color: 'var(--sidebar-muted)', letterSpacing: '.3px', textTransform: 'uppercase' }}>Clínica</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
        {sections.map(sec => (
          <div key={sec.title}>
            {sec.title && (
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.7px', textTransform: 'uppercase', color: 'var(--sidebar-muted)', padding: '14px 10px 5px' }}>
                {sec.title}
              </div>
            )}
            {sec.items.map(item => {
              const isActive = active === item.key
              return (
                <button key={item.key} onClick={() => setPage(item.key)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '8px 10px', borderRadius: 8, marginBottom: 1,
                  background: isActive ? 'var(--sidebar-active)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--sidebar-text)',
                  border: 'none', fontSize: 13, fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer', textAlign: 'left', transition: 'background .15s',
                }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--sidebar-hover)' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{ fontSize: 15, width: 18, textAlign: 'center' }}>{item.icon}</span>
                  {item.label}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Dark mode + User */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid var(--sidebar-border, #e5e7eb)' }}>


        {/* Info usuario */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--sidebar-active)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--sidebar-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.username}</div>
            <Badge label={userRol} variant={ROL_BADGE[userRol] ?? 'gray'} />
          </div>
        </div>
        <button onClick={logout} style={{ width: '100%', background: 'var(--sidebar-hover)', border: 'none', color: 'var(--sidebar-muted)', borderRadius: 8, padding: '7px', fontSize: 12, cursor: 'pointer', transition: 'background .15s' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#c45c4a30')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--sidebar-hover)')}
        >Cerrar sesión</button>
      </div>
    </aside>
  )
}
