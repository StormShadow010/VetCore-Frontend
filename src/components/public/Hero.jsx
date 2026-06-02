import React from "react";
import { Link } from "react-router-dom";
import petsImage from "../../assets/purina-perros-y-gatos-pueden-ser-amigos.avif";

export default function Hero() {
  return (
    <section
      style={{
        minHeight: "calc(100vh - 76px)",
        background: "var(--background)",
        display: "flex",
        alignItems: "center",
        padding: "3rem 4rem",
        transition: "background .25s",
      }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">
        {/* COLUMNA IZQUIERDA: TEXTOS Y BOTONES */}
        <div className="flex flex-col gap-6 max-w-xl">
          {/* Pequeña etiqueta superior */}
          <div>
            <span
              style={{
                display: "inline-block",
                padding: "6px 14px",
                borderRadius: 99,
                background: "var(--accent-light)",
                color: "var(--accent-dark)",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: ".3px",
              }}
            >
              Clínica veterinaria de confianza
            </span>
          </div>

          {/* Título Principal con cambio de color */}
          <h1 className="text-5xl md:text-6xl font-bold text-[var(--foreground)] leading-[1.1] tracking-tight">
            Cuidamos a quienes{" "}
            <span className="text-emerald-700">más quieres.</span>
          </h1>

          {/* Párrafo descriptivo */}
          <p className="text-lg text-[var(--ink-soft)] font-medium leading-relaxed">
            En Huellitas brindamos atención veterinaria integral con un equipo
            cálido y profesional, porque tu mascota es familia.
          </p>

          {/* Botones de Acción */}
          <div className="flex items-center gap-4 mt-2">
            <Link
              to="/servicios"
              className="px-8 py-3.5 rounded-full bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition-all shadow-md shrink-0 block text-center"
            >
              Ver servicios
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 rounded-full border border-[var(--border)] text-[var(--ink)] font-semibold bg-[var(--accent-light)]/50 hover:bg-[var(--accent-light)] transition-all shrink-0 block text-center"
            >
              Agendar cita
            </Link>
          </div>
        </div>

        {/* COLUMNA DERECHA: AJUSTE DEFINITIVO DE NITIDEZ */}
        <div className="w-full flex justify-center md:justify-end">
          <div className="relative w-full max-w-2xl rounded-[40px] overflow-hidden shadow-lg bg-[var(--surface)]">
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
