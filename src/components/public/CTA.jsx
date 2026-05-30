import React from 'react';
import { Link } from 'react-router-dom';

export default function CTA() {
  return (
    <div className="w-full px-8 my-10">
      <div className="max-w-7xl mx-auto bg-emerald-800 rounded-[32px] p-12 text-center flex flex-col items-center gap-6">
        
        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
          ¿Listo para cuidar a tu peludo?
        </h2>
        
        <p className="text-white/90 text-lg max-w-xl">
          Crea una cuenta y agenda tu primera cita en minutos.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mt-4">
          <Link
            to="/registro"
            className="px-8 py-3.5 rounded-full bg-[#fafaf6] text-gray-800 font-semibold hover:bg-gray-100 transition-all shadow-sm block text-center"
          >
            Crear cuenta
          </Link>
          
          <Link 
            to="/contacto" 
            className="px-8 py-3.5 rounded-full border border-white/40 text-white font-semibold hover:bg-white/10 transition-all block text-center"
          >
            Contáctanos
          </Link>
        </div>

      </div>
    </div>
  );
}
