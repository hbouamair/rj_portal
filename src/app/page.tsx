import dynamic from "next/dynamic";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import HomeStudiosSection from "@/components/studios/HomeStudiosSection";

const HowItWorks = dynamic(() => import("@/components/HowItWorks"), {
  loading: () => <div className="min-h-[420px] bg-gradient-to-br from-secondary-600 to-primary-800" aria-hidden />,
});
const WhyChooseUs = dynamic(() => import("@/components/WhyChooseUs"), {
  loading: () => <div className="min-h-[480px] bg-primary-900" aria-hidden />,
});
const FAQ = dynamic(() => import("@/components/FAQ"), {
  loading: () => <div className="min-h-[400px] bg-white" aria-hidden />,
});
const Footer = dynamic(() => import("@/components/Footer"), {
  loading: () => <div className="min-h-[280px] bg-charcoal" aria-hidden />,
});

export default function HomePage() {
  return (
    <>
      <Navigation />
      <main className="relative">
        <Hero />
        <HomeStudiosSection />
        <HowItWorks />
        <WhyChooseUs />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
