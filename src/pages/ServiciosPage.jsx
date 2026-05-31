import React from 'react';
import Navbar from "../components/public/Navbar";
import Servicios from "../components/public/Servicios";
import Footer from "../components/public/Footer";

export default function ServiciosPage() {
  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "var(--background)" }}>
      <Navbar />
      <Servicios />
      <Footer />
    </div>
  );
}
