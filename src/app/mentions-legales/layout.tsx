import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales | RJ Studio",
  description: "Mentions légales et informations légales de RJ Studio, studio de danse à Casablanca.",
};

export default function MentionsLegalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
