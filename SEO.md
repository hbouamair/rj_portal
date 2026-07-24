# Guide SEO — RJ Studio

Ce document résume ce qui a été mis en place pour le référencement et ce que vous pouvez faire pour apparaître dans les premières pages de Google.

---

## Ce qui est déjà en place (technique)

### 1. Métadonnées (layout)
- **Title** et **description** sur tout le site, avec template par page.
- **Open Graph** (Facebook, LinkedIn) et **Twitter Card** pour un beau partage sur les réseaux.
- **metadataBase** et **canonical** pour que Google utilise la bonne URL (sans doublon).
- **Robots** : indexation et suivi des liens autorisés.
- **Keywords** et **authors** pour les moteurs de recherche.

### 2. Sitemap (`/sitemap.xml`)
- Généré automatiquement par Next.js.
- Liste toutes les pages importantes (accueil, studios, classes, about, contact, mentions légales, CGU).
- Indique la fréquence de mise à jour et la priorité pour Google.

### 3. Robots.txt (`/robots.txt`)
- Autorise l’indexation de tout le site.
- Interdit uniquement `/api/` (appels techniques).
- Référence le sitemap pour que les robots trouvent toutes les pages.

### 4. Données structurées (JSON-LD)
- Schéma **DanceStudio** (LocalBusiness) pour Google.
- Permet l’affichage en « résultat enrichi » (adresse, téléphone, horaires) dans les résultats de recherche.
- À compléter : coordonnées GPS dans `src/components/JsonLd.tsx` et liens réseaux sociaux quand vous les avez.

### 5. URL du site
- Par défaut : `https://www.rjstudio.ma`.
- En production, définir la variable d’environnement **`NEXT_PUBLIC_SITE_URL`** (ex. `https://www.rjstudio.ma`) pour que sitemap, robots et partages utilisent la bonne URL.

---

## À faire de votre côté pour monter dans Google

### 1. Google Search Console (priorité haute)
1. Allez sur [search.google.com/search-console](https://search.google.com/search-console).
2. Ajoutez la propriété avec l’URL exacte de votre site (ex. `https://www.rjstudio.ma`).
3. Vérifiez le site (méthode « balise HTML » ou « fichier HTML ») et ajoutez le code de vérification dans `layout.tsx` (section `metadata.verification.google`).
4. Envoyez le sitemap : dans Search Console, « Sitemaps » → ajoutez `https://www.rjstudio.ma/sitemap.xml`.
5. Consultez régulièrement « Performances » et « Couverture » pour voir les requêtes et les pages indexées.

### 2. Contenu et mots-clés
- **Mots-clés ciblés** : « studio de danse Casablanca », « cours de danse Casablanca », « location studio danse », « réserver studio Casablanca », etc.
- Utilisez ces expressions dans les titres (H1, H2), la description et le texte des pages (accueil, studios, classes, à propos).
- Ajoutez une page ou une section **« Tarifs »** ou **« Prix »** avec les formules (heure, pack, demi-journée) : beaucoup de gens cherchent « prix studio danse Casablanca ».

### 3. Blog ou actualités (recommandé)
- Une section **« Actualités »** ou **« Blog »** avec des articles (nouveaux cours, événements, conseils danse) améliore le référencement et donne des raisons à Google de revenir.
- Chaque article = une URL avec un bon titre et une description dédiés.

### 4. Liens externes (netlinking)
- Inscrivez le site sur des annuaires (studios, loisirs, Casablanca).
- Partenariats avec des écoles, associations, influenceurs danse : un lien depuis leur site vers RJ Studio compte beaucoup pour Google.
- Réseaux sociaux : créez des pages Instagram/Facebook et indiquez l’URL du site ; ajoutez ensuite ces URLs dans `JsonLd.tsx` (champ `sameAs`).

### 5. Expérience et performance
- Le site est déjà rapide (Next.js, peu de dépendances).
- Gardez des images légères et utilisez `next/image` pour les photos (déjà recommandé dans l’analyse UI/UX).
- Mobile : la navigation et les CTA sont adaptés ; Google favorise les sites « mobile-friendly ».

### 6. Local (Google Business / Google Maps)
- Créez ou réclamez la fiche **Google Business** (ex. « RJ Studio – Studio de danse ») à l’adresse Rue Biranzarane.
- Renseignez horaires, téléphone, site web, photos.
- Les avis Google et la fiche Maps aident beaucoup pour les recherches « studio danse près de moi » ou « Casablanca ».

---

## Résumé des actions prioritaires

| Priorité | Action |
|----------|--------|
| 1 | Configurer **Google Search Console** et envoyer le sitemap. |
| 2 | Définir **NEXT_PUBLIC_SITE_URL** en production (ex. `https://www.rjstudio.ma`). |
| 3 | Créer / optimiser la fiche **Google Business** (Maps). |
| 4 | Enrichir le contenu avec les mots-clés (tarifs, formules, quartier). |
| 5 | Ajouter les liens réseaux sociaux dans le site et dans **JsonLd** quand ils existent. |

Le référencement prend plusieurs semaines à quelques mois. En appliquant ces étapes, vous donnez à Google les bons signaux techniques et de contenu pour progresser vers les premières pages.
