import nextDynamic from "next/dynamic";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import HomeStudiosSection from "@/components/studios/HomeStudiosSection";

const HowItWorks = nextDynamic(() => import("@/components/HowItWorks"), {
  loading: () => <div className="min-h-[420px] bg-gradient-to-br from-secondary-600 to-primary-800" aria-hidden />,
});
const WhyChooseUs = nextDynamic(() => import("@/components/WhyChooseUs"), {
  loading: () => <div className="min-h-[480px] bg-primary-900" aria-hidden />,
});
const FAQ = nextDynamic(() => import("@/components/FAQ"), {
  loading: () => <div className="min-h-[400px] bg-white" aria-hidden />,
});
const Footer = nextDynamic(() => import("@/components/Footer"), {
  loading: () => <div className="min-h-[280px] bg-charcoal" aria-hidden />,
});

export const dynamic = "force-dynamic";

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
