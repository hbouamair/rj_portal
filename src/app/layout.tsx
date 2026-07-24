import type { Metadata } from "next";
import { DM_Sans, Sora, Outfit, Caveat } from "next/font/google";
import "./globals.css";
import ConditionalWhatsApp from "@/components/ConditionalWhatsApp";
import JsonLd from "@/components/JsonLd";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-sora",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-nav",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-signature",
  display: "swap",
  preload: false,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.rjstudio.ma";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "RJ Studio | Studio de Danse à Casablanca",
    template: "%s | RJ Studio",
  },
  description: "RJ Studio est le premier open studio de danse et de bien-être à Casablanca. Studios à la réservation pour professeurs indépendants et artistes. Location à l'heure ou en packs, 7j/7.",
  keywords: ["open studio danse", "studio danse Casablanca", "location studio danse", "cours danse bien-être", "réservation studio", "RJ Studio", "Casablanca", "professeur indépendant", "atelier danse"],
  authors: [{ name: "RJ Studio", url: siteUrl }],
  creator: "RJ Studio",
  publisher: "RJ Studio",
  formatDetection: { email: false, address: false, telephone: false },
  icons: {
    icon: "/logo_white.ico",
  },
  openGraph: {
    type: "website",
    locale: "fr_MA",
    url: siteUrl,
    siteName: "RJ Studio",
    title: "RJ Studio | Studio de Danse à Casablanca",
    description: "Open studio de danse et bien-être à Casablanca. Location de studios à la réservation pour enseignants et artistes.",
    images: [
      {
        url: "/studio-image.jpg",
        width: 1200,
        height: 630,
        alt: "RJ Studio - Studio de danse Casablanca",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RJ Studio | Studio de Danse à Casablanca",
    description: "Open studio de danse et bien-être à Casablanca. Studios à la réservation, 7j/7.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  verification: {
    // À remplir quand vous avez les codes (Google Search Console, Bing, etc.)
    // google: "votre-code-google",
    // yandex: "votre-code-yandex",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      className={`scroll-smooth ${dmSans.variable} ${sora.variable} ${outfit.variable} ${caveat.variable}`}
    >
      <body className={`${dmSans.className} antialiased`}>
        <JsonLd />
        {children}
        <ConditionalWhatsApp />
      </body>
    </html>
  );
}
