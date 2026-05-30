import React from "react";
import Navbar from "../components/public/Navbar";
import Hero from "../components/public/Hero";
import CTA from "../components/public/CTA";
import Footer from "../components/public/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f4f3ea]">
      <Navbar />
      <Hero />
      <CTA />
      <Footer />
    </div>
  );
}
