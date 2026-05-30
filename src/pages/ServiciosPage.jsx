import React from 'react';
import Navbar from "../components/public/Navbar";
import Servicios from "../components/public/Servicios";
import Footer from "../components/public/Footer";

export default function ServiciosPage() {
  return (
    <div className="w-full min-h-screen bg-[#f4f3ea] block">
      <Navbar />
      <Servicios />
      <Footer />
    </div>
  );
}
