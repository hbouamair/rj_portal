"use client";

import Navigation from "@/components/Navigation";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function PreviewContactPage() {
  return (
    <>
      <Navigation />
      <main className="relative">
        <Contact />
      </main>
      <Footer />
    </>
  );
}
