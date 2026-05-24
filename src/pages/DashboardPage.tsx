import { useFetch } from '../hooks/useFetch'
import type { DashboardData } from '../types'
import { StatCard, Card, Spinner } from '../components/ui'

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default function DashboardPage() {
  const { data, loading } = useFetch<DashboardData>('/dashboard')

  if (loading) return <Spinner />

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 3 }}>
          Resumen general de la clínica
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard icon="📅" label="Citas hoy"        value={data?.citas.hoy ?? 0}        variant="teal"   />
        <StatCard icon="⏳" label="Pendientes"        value={data?.citas.pendientes ?? 0}  variant="yellow" />
        <StatCard icon="✅" label="Atendidas"         value={data?.citas.atendidas ?? 0}   variant="green"  />
        <StatCard icon="🐾" label="Mascotas activas"  value={data?.mascotas.total ?? 0}    variant="blue"   />
        <StatCard icon="💰" label="Ingresos del mes"  value={fmt(data?.ingresos.total_mes ?? 0)}  variant="purple" />
        <StatCard icon="⚠️" label="Bajo stock"        value={data?.stock.bajo_stock ?? 0}  variant="red"    />
      </div>

      {/* Cobro pendiente */}
      {(data?.ingresos.total_mes ?? 0) > (data?.ingresos.cobrado_mes ?? 0) && (
        <Card style={{ padding: '16px 20px', borderLeft: '3px solid var(--yellow)', background: 'var(--yellow-bg)' }}>
          <p style={{ fontSize: 13, color: 'var(--yellow)', fontWeight: 600 }}>
            💳 Por cobrar este mes:{' '}
            {fmt((data?.ingresos.total_mes ?? 0) - (data?.ingresos.cobrado_mes ?? 0))}
          </p>
        </Card>
      )}
    </div>
  )
}
