/** Static homepage studio cards — avoids a Supabase call on first paint. */
export const HOME_STUDIOS = [
  {
    id: 1,
    name: "Studio 1",
    subtitle: "Idéal pour les groupes et les ateliers",
    size: "Grand - 49m²",
    capacity: "10-16 personnes",
    priceOffPeak: "300 MAD/h",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=640&q=75",
    popular: true,
    features: [
      "Système son Bluetooth",
      "Climatisation",
      "Grand miroirs",
    ],
  },
  {
    id: 2,
    name: "Studio 2",
    subtitle: "Parfait pour les cours ou fitness en groupe",
    size: "Moyen - 34m²",
    capacity: "7-12 personnes",
    priceOffPeak: "200 MAD/h",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=640&q=75",
    popular: false,
    features: ["Système son Bluetooth", "Climatisation", "Grand miroirs"],
  },
  {
    id: 3,
    name: "Studio 3",
    subtitle: "Cours privés, répétitions ou petits groupes",
    size: "Moyen - 30m²",
    capacity: "6-10 personnes",
    priceOffPeak: "150 MAD/h",
    image:
      "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=640&q=75",
    popular: false,
    features: ["Système son Bluetooth", "Climatisation", "Grand miroirs"],
  },
] as const;
