import { useAuth } from '../context/AuthContext'
import { useFetch } from '../hooks/useFetch'
import { StatCard, Card, Spinner } from '../components/ui'

const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default function DashboardPage() {
  const { user } = useAuth()
  const isUsuario = user?.rol === 'USUARIO'
  const { data, loading } = useFetch('/dashboard')
  if (loading) return <Spinner />

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>
          {isUsuario ? `Bienvenido, ${user?.username}` : 'Dashboard'}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 3 }}>
          {isUsuario ? 'Resumen de tus citas y mascotas' : 'Resumen general de la clínica'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard icon="📅" label="Citas hoy"        value={data?.citas?.hoy ?? 0}        variant="teal"   />
        <StatCard icon="⏳" label="Pendientes"        value={data?.citas?.pendientes ?? 0}  variant="yellow" />
        <StatCard icon="✅" label="Atendidas"         value={data?.citas?.atendidas ?? 0}   variant="green"  />
        <StatCard icon="🐾" label={isUsuario ? 'Mis mascotas' : 'Mascotas activas'}
                            value={data?.mascotas?.total ?? 0}    variant="blue"   />
        {!isUsuario && <>
          <StatCard icon="💰" label="Ingresos del mes" value={fmt(data?.ingresos?.total_mes ?? 0)} variant="purple" />
          <StatCard icon="⚠️" label="Bajo stock"       value={data?.stock?.bajo_stock ?? 0}  variant="red"    />
        </>}
      </div>

      {!isUsuario && (data?.ingresos?.total_mes ?? 0) > (data?.ingresos?.cobrado_mes ?? 0) && (
        <Card style={{ padding: '16px 20px', borderLeft: '3px solid var(--yellow)', background: 'var(--yellow-bg)' }}>
          <p style={{ fontSize: 13, color: 'var(--yellow)', fontWeight: 600 }}>
            💳 Por cobrar este mes: {fmt((data?.ingresos?.total_mes ?? 0) - (data?.ingresos?.cobrado_mes ?? 0))}
          </p>
        </Card>
      )}

      {isUsuario && (
        <Card style={{ padding: '16px 20px', borderLeft: '3px solid var(--accent)', background: 'var(--accent-light)' }}>
          <p style={{ fontSize: 13, color: 'var(--accent-dark)', fontWeight: 600 }}>
            🐾 Puedes registrar nuevas mascotas y agendar citas desde el menú lateral.
          </p>
        </Card>
      )}
    </div>
  )
}
