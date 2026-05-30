import React from 'react';
import { PawPrint } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="w-full bg-[#f4f3ea] shadow-sm">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-8 py-4">
        
        {/* 1. SECCIÓN IZQUIERDA: LOGO Y NOMBRE */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 text-white">
            <PawPrint className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-gray-800">Huellitas</span>
        </Link>

        {/* 2. SECCIÓN CENTRAL: ENLACES DE NAVEGACIÓN LIMPIOS */}
        <div className="flex items-center gap-8">
          <Link 
            to="/" 
            className="font-medium text-gray-600 hover:text-emerald-700 transition-colors"
          >
            Inicio
          </Link>
          
          <Link 
            to="/servicios" 
            className="font-medium text-gray-600 hover:text-emerald-700 transition-colors"
          >
            Servicios
          </Link>
          
          <Link 
            to="/contacto" 
            className="font-medium text-gray-600 hover:text-emerald-700 transition-colors"
          >
            Contacto
          </Link>
        </div>

        {/* 3. SECCIÓN DERECHA: BOTONES DE ACCIÓN CORREGIDOS */}
        <div className="flex items-center gap-6">
          <Link 
            to="/login" 
            className="font-medium text-gray-700 hover:text-emerald-700 transition-colors"
          >
            Iniciar sesión
          </Link>
          
          <Link 
            to="/registro" 
            className="px-6 py-2.5 rounded-full bg-emerald-700 text-white font-medium hover:bg-emerald-800 transition-all shadow-sm block text-center shrink-0"
          >
            Registrarse
          </Link>
        </div>

      </div>
    </nav>
  );
}
