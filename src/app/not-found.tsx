import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Navigation />
      <main className="relative min-h-screen flex items-center justify-center pt-[88px] sm:pt-[96px] md:pt-[104px]">
        <div className="text-center px-4">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-display font-bold text-primary-500 mb-4">
            404
          </h1>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-semibold text-charcoal mb-4">
            Page non trouvée
          </h2>
          <p className="text-soft-charcoal mb-8 max-w-md mx-auto">
            Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-4 text-white font-nav font-bold rounded-full shadow-md hover:shadow-lg transition-all"
            style={{
              background: "linear-gradient(to right, #1E3A5F, #182E4C)",
              color: "#ffffff"
            }}
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

