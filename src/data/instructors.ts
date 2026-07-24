import { Instructor } from "./types";

/**
 * Disciplines et usages proposés par les professeurs & artistes indépendants
 * qui louent nos studios. RJ Studio met l'espace à disposition — les cours
 * sont organisés par chaque professionnel.
 */
export const instructors: Instructor[] = [
  {
    id: "danse",
    name: "Danse",
    title: "Classique, contemporain, jazz, hip-hop…",
    specialties: ["Ballet", "Contemporain", "Jazz", "Hip Hop"],
    bio: "Des professeurs indépendants proposent des cours collectifs et privés dans nos studios équipés.",
    yearsExperience: 0,
  },
  {
    id: "fitness",
    name: "Fitness & Bien-être",
    title: "Yoga, Pilates, stretching",
    specialties: ["Yoga", "Pilates", "Stretching", "Fitness"],
    bio: "Coachs sportifs et praticiens du bien-être louent nos espaces pour leurs séances en groupe ou en privé.",
    yearsExperience: 0,
  },
  {
    id: "repetitions",
    name: "Répétitions & Création",
    title: "Chorégraphies, spectacles, projets artistiques",
    specialties: ["Répétition", "Chorégraphie", "Performance"],
    bio: "Danseurs et compagnies utilisent nos studios pour répéter, créer et préparer leurs projets.",
    yearsExperience: 0,
  },
  {
    id: "contenu",
    name: "Contenu & Tournages",
    title: "Vidéos, shootings, enregistrements",
    specialties: ["Tournage", "Photo", "Contenu digital"],
    bio: "Artistes et créateurs de contenu réservent nos studios pour filmer, photographier ou produire.",
    yearsExperience: 0,
  },
  {
    id: "ateliers",
    name: "Ateliers & Workshops",
    title: "Stages ponctuels et masterclasses",
    specialties: ["Workshop", "Masterclass", "Stage"],
    bio: "Des ateliers thématiques sont organisés régulièrement par des intervenants invités.",
    yearsExperience: 0,
  },
  {
    id: "prive",
    name: "Cours Privés",
    title: "Coaching individuel ou en petit groupe",
    specialties: ["Privé", "Coaching", "Petit groupe"],
    bio: "Réservez un studio pour vos cours privés ou séances personnalisées avec vos élèves.",
    yearsExperience: 0,
  },
];
