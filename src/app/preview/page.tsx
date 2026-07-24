"use client";

import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import StudioSelection from "@/components/StudioSelection";
import WhyChooseUs from "@/components/WhyChooseUs";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function PreviewHomePage() {
  return (
    <>
      <Navigation />
      <main className="relative">
        <Hero />
        <HowItWorks />
        <StudioSelection />
        <WhyChooseUs />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
