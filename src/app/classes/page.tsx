"use client";

import Navigation from "@/components/Navigation";
import ClassesGrid from "@/components/ClassesGrid";
import Footer from "@/components/Footer";

export default function ClassesPage() {
  return (
    <>
      <Navigation />
      <main className="relative">
        <ClassesGrid />
      </main>
      <Footer />
    </>
  );
}
