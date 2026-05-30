import React from 'react';
import { PawPrint } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#f4f3ea] py-8 border-t border-gray-200/50">
      <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600 font-medium px-8 md:px-16">
        
        {/* SECCIÓN IZQUIERDA */}
        <div className="flex items-center gap-2">
          <PawPrint className="w-4 h-4 text-emerald-700" />
          <span>© 2026 Huellitas Veterinaria</span>
        </div>

        {/* SECCIÓN DERECHA */}
        <div className="text-center sm:text-right">
          <p>Cuidando a tu mejor amigo con amor y dedicación.</p>
        </div>

      </div>
    </footer>
  );
}
