import React from 'react'
import { PawPrint } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav style={{
      width: '100%',
      background: 'var(--background)',
      borderBottom: '1px solid var(--border)',
      boxShadow: '0 1px 3px rgba(0,0,0,.06)',
      transition: 'background .25s, border-color .25s',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 32px',
      }}>

        {/* Logo */}
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          textDecoration: 'none', opacity: 1, transition: 'opacity .15s',
        }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '.8')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: '#059669', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <PawPrint size={18} color="#fff" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--foreground)' }}>
            Huellitas
          </span>
        </Link>

        {/* Links centrales */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {[['/', 'Inicio'], ['/servicios', 'Servicios'], ['/contacto', 'Contacto']].map(([to, label]) => (
            <Link key={to} to={to} style={{
              fontWeight: 500, fontSize: 14,
              color: 'var(--ink-soft)',
              textDecoration: 'none', transition: 'color .15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = '#059669')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-soft)')}
            >{label}</Link>
          ))}
        </div>

        {/* Acciones derecha */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link to="/login" style={{
            fontWeight: 500, fontSize: 14,
            color: 'var(--ink)', textDecoration: 'none', transition: 'color .15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = '#059669')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink)')}
          >
            Iniciar sesión
          </Link>
          <Link to="/registro" style={{
            padding: '9px 22px', borderRadius: 99,
            background: '#059669', color: '#fff',
            fontWeight: 600, fontSize: 14,
            textDecoration: 'none', transition: 'background .15s',
            boxShadow: '0 2px 8px rgba(5,150,105,.25)',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = '#047857')}
            onMouseLeave={e => (e.currentTarget.style.background = '#059669')}
          >
            Registrarse
          </Link>
        </div>

      </div>
    </nav>
  )
}
