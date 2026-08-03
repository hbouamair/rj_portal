import Navigation from "@/components/Navigation";
import About from "@/components/About";
import Footer from "@/components/Footer";
import { fetchAboutContent } from "@/lib/site-content/db";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const content = await fetchAboutContent();

  return (
    <>
      <Navigation />
      <main className="relative pt-20">
        <About content={content} />
      </main>
      <Footer />
    </>
  );
}
