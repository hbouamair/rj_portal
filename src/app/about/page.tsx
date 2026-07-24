"use client";

import Navigation from "@/components/Navigation";
import About from "@/components/About";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <>
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <main className="relative pt-20">
        <About />
      </main>
      
      {/* Footer */}
      <Footer />
    </>
  );
}
