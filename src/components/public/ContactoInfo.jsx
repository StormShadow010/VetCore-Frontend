import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function ContactoInfo() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full h-full py-2">
      <div className="w-full max-w-md flex flex-col gap-4">

        {/* Tarjeta Dirección */}
        <div className="bg-[#fafaf6] border border-gray-200/60 rounded-[24px] p-6 flex gap-4 items-start shadow-sm w-full">
          <div className="w-10 h-10 rounded-full bg-[#e3ebd7] flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-emerald-800" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-bold text-gray-800">Dirección</h3>
            <p className="text-sm text-gray-600 font-medium">Av. Siempre Viva 742</p>
            <p className="text-sm text-gray-600 font-medium">Ciudad</p>
          </div>
        </div>

        {/* Tarjeta Teléfono */}
        <div className="bg-[#fafaf6] border border-gray-200/60 rounded-[24px] p-6 flex gap-4 items-start shadow-sm w-full">
          <div className="w-10 h-10 rounded-full bg-[#e3ebd7] flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5 text-emerald-800" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-bold text-gray-800">Teléfono</h3>
            <p className="text-sm text-gray-600 font-medium">+1 (555) 123-4567</p>
          </div>
        </div>

        {/* Tarjeta Email */}
        <div className="bg-[#fafaf6] border border-gray-200/60 rounded-[24px] p-6 flex gap-4 items-start shadow-sm w-full">
          <div className="w-10 h-10 rounded-full bg-[#e3ebd7] flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-emerald-800" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-bold text-gray-800">Email</h3>
            <p className="text-sm text-gray-600 font-medium">hola@huellitas.vet</p>
          </div>
        </div>

        {/* Tarjeta Horarios */}
        <div className="bg-[#fafaf6] border border-gray-200/60 rounded-[24px] p-6 flex gap-4 items-start shadow-sm w-full">
          <div className="w-10 h-10 rounded-full bg-[#e3ebd7] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-emerald-800" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-bold text-gray-800">Horarios</h3>
            <p className="text-sm text-gray-600 font-medium">Lun–Vie: 8:00–20:00</p>
            <p className="text-sm text-gray-600 font-medium">Sáb: 9:00–14:00</p>
            <p className="text-sm text-emerald-700 font-bold mt-1">Urgencias 24/7</p>
          </div>
        </div>

      </div>
    </div>
  );
}
