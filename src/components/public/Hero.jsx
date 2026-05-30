import React from 'react';
import petsImage from '../../assets/purina-perros-y-gatos-pueden-ser-amigos.avif'; 

export default function Hero() {
  return (
    <section className="min-h-[calc(100vh-76px)] bg-gradient-to-br from-[#f4f3ea] to-[#e1ecd7] flex items-center px-8 md:px-16 py-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">
        
        {/* COLUMNA IZQUIERDA: TEXTOS Y BOTONES */}
        <div className="flex flex-col gap-6 max-w-xl">
          
          {/* Pequeña etiqueta superior */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#e3ebd7] text-emerald-800 text-xs font-medium tracking-wide">
              Clínica veterinaria de confianza
            </span>
          </div>

          {/* Título Principal con cambio de color */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 leading-[1.1] tracking-tight">
            Cuidamos a quienes <span className="text-emerald-700">más quieres.</span>
          </h1>

          {/* Párrafo descriptivo */}
          <p className="text-lg text-gray-600 font-medium leading-relaxed">
            En Huellitas brindamos atención veterinaria integral con un equipo cálido y profesional, 
            porque tu mascota es familia.
          </p>

          {/* Botones de Acción */}
          <div className="flex items-center gap-4 mt-2">
            <button className="px-8 py-3.5 rounded-full bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition-all shadow-md shrink-0">
              Ver servicios
            </button>
            <button className="px-8 py-3.5 rounded-full border border-gray-300 text-gray-700 font-semibold bg-[#e7edd9]/50 hover:bg-[#e7edd9] transition-all shrink-0">
              Agendar cita
            </button>
          </div>

        </div>

        {/* COLUMNA DERECHA: AJUSTE DEFINITIVO DE NITIDEZ */}
        <div className="w-full flex justify-center md:justify-end">
          <div className="relative w-full max-w-2xl rounded-[40px] overflow-hidden shadow-lg bg-white">
            <img 
              src={petsImage} 
              alt="Perro feliz y gato" 
              className="w-full h-auto max-h-[500px] object-contain block [image-rendering:-webkit-optimize-contrast] [image-rendering:crisp-edges]"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
