import {
  CONTACT_ADDRESS,
  CONTACT_EMAIL,
  CONTACT_PHONE_TEL,
  INSTAGRAM_URL,
} from "@/lib/constants";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.rjstudio.ma";

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "DanceStudio",
  "@id": `${siteUrl}/#organization`,
  name: "RJ Studio",
  description:
    "Premier open studio de danse et de bien-être à Casablanca. Studios entièrement équipés à la réservation pour professeurs indépendants, coachs et artistes. Réservation à l'heure ou en packs, 7j/7.",
  url: siteUrl,
  telephone: CONTACT_PHONE_TEL,
  email: CONTACT_EMAIL,
  address: {
    "@type": "PostalAddress",
    streetAddress: CONTACT_ADDRESS,
    addressLocality: "Casablanca",
    addressCountry: "MA",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "08:00",
    closes: "22:00",
  },
  sameAs: [INSTAGRAM_URL],
  priceRange: "$$",
  image: `${siteUrl}/studio-image.jpg`,
};

export default function JsonLd() {
  const json = JSON.stringify(localBusinessSchema);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
