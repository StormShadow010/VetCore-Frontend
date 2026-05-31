import React from 'react';
import Navbar from "../components/public/Navbar";
import Footer from "../components/public/Footer";
import ContactoInfo from "../components/public/ContactoInfo"; 

export default function ContactoPage() {
  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "var(--background)" }}>
      <Navbar />
      
      <section className="w-full px-8 md:px-16 py-16">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-10">
          
          {/* CABECERA CENTRADA */}
          <div className="flex flex-col items-center text-center gap-3 max-w-2xl">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--accent-light)] text-emerald-800 text-xs font-medium tracking-wide">
                Contacto
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] tracking-tight">
              Hablemos de tu mascota
            </h1>
            <p className="text-base text-[var(--ink-soft)] font-medium">
              Aquí encuentras todos nuestros canales de atención y ubicación.
            </p>
          </div>

          {/* CONTENEDOR DE LA INFORMACIÓN */}
          <div className="w-full flex justify-center items-center">
            <ContactoInfo />
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
