"use client";

import Navigation from "@/components/Navigation";
import Instructors from "@/components/Instructors";
import Footer from "@/components/Footer";

export default function InstructorsPage() {
  return (
    <>
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <main className="relative">
        <Instructors />
      </main>
      
      {/* Footer */}
      <Footer />
    </>
  );
}

