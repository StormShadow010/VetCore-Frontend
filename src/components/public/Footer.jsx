import React from 'react';
import { PawPrint } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[var(--background)] py-8 border-t border-[var(--border)]/50">
      <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--ink-soft)] font-medium px-8 md:px-16">
        
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
