import { DanceClass } from "./types";

/** Disciplines proposées par les professeurs partenaires dans nos studios */
export const danceClasses: DanceClass[] = [
  {
    id: "ballet-fondamentaux",
    title: "Ballet — Fondamentaux",
    style: "Ballet",
    instructor: "Professeurs partenaires",
    level: "Tous niveaux",
    duration: 90,
    description:
      "Travail des bases classiques : posture, placement et technique. Idéal pour débuter ou consolider les fondamentaux.",
    color: "#FFE5E5",
  },
  {
    id: "hip-hop",
    title: "Hip-Hop",
    style: "Hip Hop",
    instructor: "Professeurs partenaires",
    level: "Tous niveaux",
    duration: 60,
    description:
      "Groove, rythme et chorégraphies urbaines. Cours dynamiques animés par des professeurs indépendants.",
    color: "#E8F4F8",
  },
  {
    id: "contemporain",
    title: "Danse Contemporaine",
    style: "Contemporary",
    instructor: "Professeurs partenaires",
    level: "Intermédiaire",
    duration: 75,
    description:
      "Exploration du mouvement, de l'expression corporelle et de la créativité dans un espace professionnel.",
    color: "#F5E6FF",
  },
  {
    id: "jazz",
    title: "Jazz",
    style: "Jazz",
    instructor: "Professeurs partenaires",
    level: "Intermédiaire",
    duration: 60,
    description:
      "Technique jazz dynamique mêlant précision, énergie et expression scénique.",
    color: "#FFF3E0",
  },
  {
    id: "salsa",
    title: "Salsa",
    style: "Salsa",
    instructor: "Professeurs partenaires",
    level: "Tous niveaux",
    duration: 60,
    description:
      "Rythmes latins, pas de base et travail en duo dans une ambiance conviviale.",
    color: "#FFE8E8",
  },
  {
    id: "fitness-danse",
    title: "Fitness & Bien-être",
    style: "Ballroom",
    instructor: "Professeurs partenaires",
    level: "Tous niveaux",
    duration: 60,
    description:
      "Yoga, Pilates, stretching et fitness : des cours variés dispensés par des coachs indépendants.",
    color: "#E8F8F5",
  },
];
