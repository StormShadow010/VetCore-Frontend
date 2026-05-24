import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar, { type PageKey } from './components/Sidebar'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import MascotasPage from './pages/MascotasPage'
import CitasPage from './pages/CitasPage'
import PropietariosPage from './pages/PropietariosPage'
import {
  VeterinariosPage, EspecialidadesPage, EspeciesPage,
  MedicamentosPage, FacturasPage, UsuariosPage, ConsultasSQLPage,
} from './pages/OtherPages'
import { Spinner } from './components/ui'

function Layout() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState<PageKey>('dashboard')

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner />
    </div>
  )
  if (!user) return <LoginPage />

  const pages: Record<PageKey, React.ReactNode> = {
    dashboard:      <DashboardPage />,
    citas:          <CitasPage />,
    mascotas:       <MascotasPage />,
    propietarios:   <PropietariosPage />,
    veterinarios:   <VeterinariosPage />,
    especialidades: <EspecialidadesPage />,
    especies:       <EspeciesPage />,
    medicamentos:   <MedicamentosPage />,
    facturas:       <FacturasPage />,
    consultas_sql:  <ConsultasSQLPage />,
    usuarios:       <UsuariosPage />,
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar active={page} setPage={setPage} />
      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', background: 'var(--surface-raised)', minWidth: 0 }}>
        {pages[page]}
      </main>
    </div>
  )
}

export default function App() {
  return <AuthProvider><Layout /></AuthProvider>
}
