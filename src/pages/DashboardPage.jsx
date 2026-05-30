import { useState, useEffect } from 'react'
import { useFetch } from '../hooks/useFetch'
import { StatCard, Card, Spinner } from '../components/ui'

const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default function DashboardPage() {
  const { data, loading } = useFetch('/dashboard')

  // Estado del tema (Sage & Cream)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('vetcore-theme')
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  // Aplicar tema dinámicamente y guardarlo
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('vetcore-theme', theme)
  }, [theme])

  if (loading) return <Spinner />

  return (
    <div style={{ background: 'var(--background)', position: 'relative', minHeight: '100%' }} className="fade-in">
      {/* Selector de Tema Flotante Premium */}
      <div style={{ position: 'absolute', top: 0, right: 0, zIndex: 10 }}>
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '99px',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            width: 78,
            height: 36,
            overflow: 'hidden',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = 'var(--shadow-md)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
          }}
          title={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
        >
          {/* Fondo indicador de tema activo */}
          <div style={{
            position: 'absolute',
            top: 2,
            left: theme === 'light' ? 2 : 42,
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: 'var(--primary)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: 'var(--shadow-sm)',
            zIndex: 1,
          }} />
          
          {/* Icono Sol (☀️) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 30,
            height: 30,
            zIndex: 2,
            color: theme === 'light' ? 'var(--primary-foreground)' : 'var(--ink-faint)',
            transition: 'color 0.3s ease',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          </div>
          
          {/* Icono Luna (🌙) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 30,
            height: 30,
            zIndex: 2,
            color: theme === 'dark' ? 'var(--primary-foreground)' : 'var(--ink-faint)',
            transition: 'color 0.3s ease',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </div>
        </button>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)' }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 3 }}>Resumen general de la clínica</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard icon="📅" label="Citas hoy" value={data?.citas?.hoy ?? 0} variant="teal" />
        <StatCard icon="⏳" label="Pendientes" value={data?.citas?.pendientes ?? 0} variant="yellow" />
        <StatCard icon="✅" label="Atendidas" value={data?.citas?.atendidas ?? 0} variant="green" />
        <StatCard icon="🐾" label="Mascotas activas" value={data?.mascotas?.total ?? 0} variant="blue" />
        <StatCard icon="💰" label="Ingresos del mes" value={fmt(data?.ingresos?.total_mes ?? 0)} variant="purple" />
        <StatCard icon="⚠️" label="Bajo stock" value={data?.stock?.bajo_stock ?? 0} variant="red" />
      </div>

      {(data?.ingresos?.total_mes ?? 0) > (data?.ingresos?.cobrado_mes ?? 0) && (
        <Card style={{ padding: '16px 20px', borderLeft: '3px solid var(--yellow)', background: 'var(--yellow-bg)' }}>
          <p style={{ fontSize: 13, color: 'var(--yellow)', fontWeight: 600 }}>
            💳 Por cobrar este mes: {fmt((data?.ingresos?.total_mes ?? 0) - (data?.ingresos?.cobrado_mes ?? 0))}
          </p>
        </Card>
      )}
    </div>
  )
}
