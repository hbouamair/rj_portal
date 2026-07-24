"use client";

import Navigation from "@/components/Navigation";
import Instructors from "@/components/Instructors";
import Footer from "@/components/Footer";

export default function PreviewInstructorsPage() {
  return (
    <>
      <Navigation />
      <main className="relative">
        <Instructors />
      </main>
      <Footer />
    </>
  );
}
