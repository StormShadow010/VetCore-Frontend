import React from 'react';
import Navbar from "../components/public/Navbar";
import Footer from "../components/public/Footer";
import RegistroForm from "../components/public/RegistroForm";

export default function RegistroPage() {
  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "var(--background)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <Navbar />

      <main className="w-full flex items-center justify-center px-6 py-12 flex-grow">
        <RegistroForm />
      </main>

      <Footer />
    </div>
  );
}
