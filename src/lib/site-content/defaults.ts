import {
  CONTACT_ADDRESS,
  CONTACT_EMAIL,
  CONTACT_MAP_QUERY,
  CONTACT_PHONE_DISPLAY,
  OPENING_HOURS_DISPLAY,
} from "@/lib/constants";
import type { AboutPageContent, ContactPageContent } from "./types";

export const DEFAULT_CONTACT_CONTENT: ContactPageContent = {
  pageTitle: "Venez nous voir",
  pageSubtitle:
    "Maarif, Casablanca — Réservez ou posez vos questions.",
  formTitle: "Envoyez un message",
  formSubtitle: "Réponse sous 24h en général.",
  address: CONTACT_ADDRESS,
  phone: CONTACT_PHONE_DISPLAY,
  email: CONTACT_EMAIL,
  openingHours: OPENING_HOURS_DISPLAY,
  mapQuery: CONTACT_MAP_QUERY,
};

export const DEFAULT_ABOUT_CONTENT: AboutPageContent = {
  badgeLabel: "À propos",
  titlePrefix: "À propos de",
  titleHighlight: "RJ Studio Casablanca",
  subtitle:
    "Un espace professionnel dédié à la créativité, à la danse et au bien-être.",
  conceptTitle: "Notre concept",
  conceptParagraphs: [
    "RJ Studio est le premier open studio de danse et de bien-être situé à Casablanca, conçu pour les professeurs indépendants, coachs sportifs et artistes qui souhaitent enseigner, créer et développer leur activité dans un environnement professionnel, moderne et flexible.",
    "RJ Studio n'est pas une école de danse. Il s'agit d'un espace de studios entièrement équipés mis à disposition à la réservation, permettant aux professionnels de la danse et du bien-être d'enseigner et de créer en toute autonomie.",
    "Trois studios modernes et entièrement équipés (49 m², 34 m² et 30 m²), soit plus de 110 m² d'espaces dédiés à la création et à l'enseignement : danse, fitness, yoga, mat pilates, répétitions artistiques ou workshops.",
  ],
  missionTitle: "Notre mission",
  missionParagraphs: [
    "Mettre à disposition des espaces équipés afin que chaque enseignant puisse organiser ses propres cours, ateliers ou répétitions en toute autonomie.",
    "RJ Studio agit comme un partenaire logistique et technique, en mettant à disposition des studios professionnels accessibles à la réservation. Dans un modèle classique, les studios fonctionnent comme des écoles ; chez nous, vous restez indépendants, avec des prix fixes et une réservation simple en ligne, 7 jours sur 7.",
  ],
  valuesTitle: "Un concept innovant à Casablanca",
  values: [
    {
      title: "Indépendance",
      description:
        "Vous restez totalement indépendants ; pas de rémunération au pourcentage, prix fixes.",
    },
    {
      title: "Flexibilité",
      description:
        "Vous organisez vos cours selon vos horaires et vos besoins ; réservation simple et rapide en ligne.",
    },
    {
      title: "Disponibilité",
      description: "Studios disponibles 7 jours sur 7 ; réservation à l'heure ou en packs.",
    },
    {
      title: "Autonomie",
      description:
        "Gestion totalement indépendante de votre activité et de votre communauté.",
    },
  ],
  stats: [
    { value: 3, suffix: "", label: "Studios équipés" },
    { value: 110, suffix: " m²", label: "Espace total" },
    { value: 7, suffix: "j/7", label: "Disponibilité" },
    { value: 1, suffix: "h", label: "Minimum réservation" },
  ],
  ctaText: "Découvrir nos studios",
};
