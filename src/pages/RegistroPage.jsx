import React from 'react';
import Navbar from "../components/public/Navbar";
import Footer from "../components/public/Footer";
import RegistroForm from "../components/public/RegistroForm";

export default function RegistroPage() {
  return (
    <div className="w-full min-h-screen bg-[#f4f3ea] flex flex-col justify-between">
      <Navbar />

      <main className="w-full flex items-center justify-center px-6 py-12 flex-grow">
        <RegistroForm />
      </main>

      <Footer />
    </div>
  );
}
