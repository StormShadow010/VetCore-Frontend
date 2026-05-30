import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
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
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Páginas Públicas
import Home from './pages/Home'
import ServiciosPage from './pages/ServiciosPage'
import ContactoPage from './pages/ContactoPage'
import RegistroPage from './pages/RegistroPage'

// Componente para proteger la ruta del Dashboard
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner />
    </div>
  )

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Wrapper del Dashboard con el Sidebar y el selector de subpáginas interno
function DashboardLayout() {
  const [page, setPage] = useState('dashboard')

  const pages = {
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
        {pages[page] ?? <DashboardPage />}
      </main>
    </div>
  )
}

// Redirige al dashboard si el usuario ya está autenticado e intenta ir a /login
function LoginWrapper() {
  const { user } = useAuth()
  if (user) {
    return <Navigate to="/dashboard" replace />
  }
  return <LoginPage />
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/servicios" element={<ServiciosPage />} />
          <Route path="/contacto" element={<ContactoPage />} />
          <Route path="/registro" element={<RegistroPage />} />
          <Route path="/login" element={<LoginWrapper />} />

          {/* Ruta Protegida del Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  )
}

