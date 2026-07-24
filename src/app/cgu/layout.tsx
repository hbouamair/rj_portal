import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CGU | RJ Studio",
  description: "Conditions générales d'utilisation : réservation, annulation et utilisation des studios RJ Studio à Casablanca.",
};

export default function CGULayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
