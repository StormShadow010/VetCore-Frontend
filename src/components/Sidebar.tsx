import { useAuth } from '../context/AuthContext'
import type { Rol } from '../types'
import { Badge, ROL_BADGE } from './ui'

export type PageKey =
  | 'dashboard' | 'citas' | 'mascotas' | 'propietarios'
  | 'veterinarios' | 'medicamentos' | 'facturas' | 'usuarios'
  | 'consultas_sql' | 'especialidades' | 'especies'

interface NavItem {
  key: PageKey
  label: string
  icon: string
  minRol: Rol
  section?: string
}

const NAV: NavItem[] = [
  { key: 'dashboard',      label: 'Dashboard',      icon: '◈', minRol: 'CONSULTA',   section: 'General' },
  { key: 'citas',          label: 'Citas',           icon: '◷', minRol: 'CONSULTA',   section: 'Clínica' },
  { key: 'mascotas',       label: 'Mascotas',        icon: '◎', minRol: 'CONSULTA' },
  { key: 'propietarios',   label: 'Propietarios',    icon: '◉', minRol: 'CONSULTA' },
  { key: 'veterinarios',   label: 'Veterinarios',    icon: '✦', minRol: 'CONSULTA' },
  { key: 'especialidades', label: 'Especialidades',  icon: '❖', minRol: 'CONSULTA' },
  { key: 'especies',       label: 'Especies',        icon: '⬡', minRol: 'CONSULTA' },
  { key: 'medicamentos',   label: 'Medicamentos',    icon: '⊕', minRol: 'CONSULTA',   section: 'Administración' },
  { key: 'facturas',       label: 'Facturas',        icon: '◫', minRol: 'ADMIN' },
  { key: 'consultas_sql',  label: 'Consultas SQL',   icon: '⌨', minRol: 'CONSULTA',   section: 'Reportes' },
  { key: 'usuarios',       label: 'Usuarios',        icon: '◧', minRol: 'SUPERADMIN', section: 'Sistema' },
]

export default function Sidebar({
  active, setPage,
}: { active: PageKey; setPage: (p: PageKey) => void }) {
  const { user, logout, can } = useAuth()
  const visible = NAV.filter(n => can(n.minRol))

  const sections: { title: string; items: NavItem[] }[] = []
  let currentSection: NavItem[] = []
  let currentTitle = ''

  for (const item of visible) {
    if (item.section && item.section !== currentTitle) {
      if (currentSection.length) sections.push({ title: currentTitle, items: currentSection })
      currentTitle = item.section
      currentSection = [item]
    } else {
      currentSection.push(item)
    }
  }
  if (currentSection.length) sections.push({ title: currentTitle, items: currentSection })

  return (
    <aside style={{
      width: 'var(--sidebar-w)', background: 'var(--sidebar-bg)',
      display: 'flex', flexDirection: 'column',
      minHeight: '100vh', flexShrink: 0,
      borderRight: '1px solid #1F2937',
    }}>
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid #1F2937' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, background: 'var(--accent)',
            borderRadius: 10, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 16,
          }}>🐾</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#F9FAFB', letterSpacing: '-.2px' }}>VetCore</div>
            <div style={{ fontSize: 10, color: 'var(--sidebar-muted)', letterSpacing: '.3px', textTransform: 'uppercase' }}>Clínica</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}>
        {sections.map(sec => (
          <div key={sec.title}>
            {sec.title && (
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '.7px',
                textTransform: 'uppercase', color: 'var(--sidebar-muted)',
                padding: '14px 10px 5px',
              }}>{sec.title}</div>
            )}
            {sec.items.map(item => {
              const isActive = active === item.key
              return (
                <button key={item.key} onClick={() => setPage(item.key)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '8px 10px', borderRadius: 8,
                  background: isActive ? 'var(--sidebar-active)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--sidebar-text)',
                  border: 'none', fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'background .15s, color .15s',
                  marginBottom: 1,
                }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'var(--sidebar-hover)' }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                >
                  <span style={{ fontSize: 15, width: 18, textAlign: 'center' }}>{item.icon}</span>
                  {item.label}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      <div style={{ padding: '14px 16px', borderTop: '1px solid #1F2937' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--accent)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13,
            flexShrink: 0,
          }}>{user?.username?.[0]?.toUpperCase()}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#F9FAFB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.username}</div>
            <Badge label={user?.rol ?? ''} variant={ROL_BADGE[user?.rol ?? 'CONSULTA']} />
          </div>
        </div>
        <button onClick={logout} style={{
          width: '100%', background: '#1F2937', border: 'none',
          color: 'var(--sidebar-muted)', borderRadius: 8,
          padding: '7px', fontSize: 12, cursor: 'pointer',
          transition: 'background .15s',
        }}
          onMouseEnter={e => ((e.target as HTMLElement).style.background = '#374151')}
          onMouseLeave={e => ((e.target as HTMLElement).style.background = '#1F2937')}
        >Cerrar sesión</button>
      </div>
    </aside>
  )
}
