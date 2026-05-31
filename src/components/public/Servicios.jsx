import React from 'react';
import { 
  Stethoscope, 
  Syringe, 
  Bone, 
  Sparkles, 
  Scissors, 
  HeartPulse, 
  ShieldAlert, 
  Clock 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Servicios() {
  
  const listaServicios = [
    {
      id: 1,
      icono: <Stethoscope className="w-5 h-5 text-emerald-800" />,
      titulo: "Consultas generales",
      descripcion: "Evaluación clínica completa, diagnóstico y plan de tratamiento personalizado.",
      precio: "Desde $25"
    },
    {
      id: 2,
      icono: <Syringe className="w-5 h-5 text-emerald-800" />,
      titulo: "Vacunación",
      descripcion: "Calendarios para cachorros, adultos y mayores. Antirrábica incluida.",
      precio: "Desde $15"
    },
    {
      id: 3,
      icono: <Bone className="w-5 h-5 text-emerald-800" />,
      titulo: "Nutrición",
      descripcion: "Planes alimenticios según edad, raza y condición de salud.",
      precio: "Gratis con consulta"
    },
    {
      id: 4,
      icono: <Sparkles className="w-5 h-5 text-emerald-800" />,
      titulo: "Odontología",
      descripcion: "Limpieza dental con ultrasonido y profilaxis preventiva.",
      precio: "Desde $45"
    },
    {
      id: 5,
      icono: <Scissors className="w-5 h-5 text-emerald-800" />,
      titulo: "Estética y baño",
      descripcion: "Baño medicado, corte de pelo, uñas y limpieza de oídos.",
      precio: "Desde $20"
    },
    {
      id: 6,
      icono: <HeartPulse className="w-5 h-5 text-emerald-800" />,
      titulo: "Urgencias 24/7",
      descripcion: "Atención inmediata con equipo de guardia siempre disponible.",
      precio: "Consultar"
    },
    {
      id: 7,
      icono: <ShieldAlert className="w-5 h-5 text-emerald-800" />,
      titulo: "Cirugía",
      descripcion: "Esterilización, cirugías menores y mayores con anestesia monitoreada.",
      precio: "Desde $80"
    },
    {
      id: 8,
      icono: <Clock className="w-5 h-5 text-emerald-800" />,
      titulo: "Controles a domicilio",
      descripcion: "Visitas programadas para mascotas con movilidad reducida.",
      precio: "Desde $30"
    }
  ];

  return (
    <section style={{ width:"100%", background:"var(--background)", padding:"4rem 4rem" }}>
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        
        {/* CABECERA DE LA SECCIÓN */}
        <div className="flex flex-col gap-4 max-w-2xl">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#e3ebd7] text-emerald-800 text-xs font-medium tracking-wide">
              Servicios
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] tracking-tight">
            Todo lo que tu mascota necesita
          </h1>
          <p className="text-lg text-[var(--ink-soft)] font-medium">
            Atención profesional, cálida y centrada en el bienestar animal.
          </p>
        </div>

        {/* GRID DE TARJETAS (2 columnas en PC, 1 en celular) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {listaServicios.map((servicio) => (
            <div 
              key={servicio.id} 
              className="bg-[var(--surface)] border border-[var(--border)]/60 rounded-[32px] p-8 flex flex-col gap-5 justify-between shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col gap-4">
                {/* Contenedor circular del icono */}
                <div className="w-10 h-10 rounded-full bg-[#e3ebd7] flex items-center justify-center">
                  {servicio.icono}
                </div>
                {/* Título y Descripción */}
                <h3 className="text-xl font-bold text-[var(--foreground)]">{servicio.titulo}</h3>
                <p className="text-[var(--ink-soft)] text-base font-medium leading-relaxed">{servicio.descripcion}</p>
              </div>
              
              {/* Separador sutil y Precio */}
              <div className="flex flex-col gap-4 mt-2">
                <hr className="border-[var(--border)]/70" />
                <span className="text-[#4c6a52] font-semibold text-sm tracking-wide">
                  {servicio.precio}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* BOTÓN INFERIOR DE AGENDAR */}
        <div className="w-full flex justify-center mt-4">
          <Link 
            to="/contacto"
            className="px-8 py-3.5 rounded-full bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition-all shadow-md block text-center"
          >
            Agendar una cita
          </Link>
        </div>

      </div>
    </section>
  );
}
