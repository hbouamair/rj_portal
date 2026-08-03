import Navigation from "@/components/Navigation";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { fetchContactContent } from "@/lib/site-content/db";

export const dynamic = "force-dynamic";

export default async function PreviewContactPage() {
  const content = await fetchContactContent();

  return (
    <>
      <Navigation />
      <main className="relative">
        <Contact content={content} />
      </main>
      <Footer />
    </>
  );
}
