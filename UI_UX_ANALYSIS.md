# Analyse UI/UX & technique — RJ Studio

Analyse en tant qu’expert UI/UX et développeur web : points à supprimer, à corriger et à améliorer.

---

## À supprimer ou à ne plus utiliser

### 1. **Code mort (composants non utilisés)**
- **`FormulesPreview.tsx`** — Jamais importé. La page d’accueil utilise déjà StudioSelection pour les formules. **À supprimer** ou à réintégrer si vous voulez une section “Voir toutes les formules” en plus.
- **`PicktimeBookButton.tsx`** — Jamais importé ; la nav et le hero utilisent des liens directs. **À supprimer** sauf si vous prévoyez de réutiliser ce bouton image Picktime quelque part.
- **`Schedule.tsx`** — Composant standalone jamais importé (le planning est dans BookingModal). **À supprimer** pour éviter la confusion, sauf si vous voulez une section “Planning” dédiée sur une page.

### 2. **BookingModal sur la page d’accueil**
- Sur **`src/app/page.tsx`**, le `BookingModal` est rendu mais **aucun bouton ne l’ouvre** (`handleBookClass` a été retiré). Soit vous réaffectez un CTA “Réserver / Voir planning” qui ouvre ce modal, soit vous **retirez le modal de la page d’accueil** pour alléger le code (il reste utile sur `/classes`).

### 3. **Contenu placeholder / incohérent**
- **Footer** : 
  - Adresse “Zone Industrielle” alors que la page Contact indique “Rue Biranzarane”. **Uniformiser** avec Rue Biranzarane (et le reste du site).
  - Téléphone “+212 6XX XXX XXX” → remplacer par le vrai numéro (ex. 0661777421 / +212 661 77 77 21).
  - Liens sociaux (Instagram, Facebook, etc.) pointent vers `#`. Les **remplacer** par les vrais URLs ou les **retirer** s’ils ne sont pas encore utilisés (éviter des liens morts).
- **Contact (bandeau)** : même chose pour “+212 6XX XXX XXX” et l’email si besoin.
- **Footer** : “Privacy Policy” et “Terms of Service” en anglais sur un site 100 % français. Soit **traduire** (ex. “Mentions légales”, “CGU”), soit retirer en attendant d’avoir les pages.

### 4. **Langue**
- **ClassCard** : bouton “View Schedule” en anglais. À remplacer par **“Voir le planning”** ou **“Réserver”** pour cohérence avec le reste du site.

---

## Améliorations UI/UX recommandées

### 1. **Hiérarchie et lisibilité**
- **Page Studios** : les cartes en pleine largeur sont bien ; vérifier que sur très grands écrans le texte et les blocs ne s’étirent pas trop (max-width du contenu déjà en place, à garder).
- **Hero** : le bloc texte sur fond semi-transparent est lisible ; garder un contraste suffisant si vous changez la vidéo ou l’overlay.
- **FAQ** : les réponses en `whitespace-pre-line` sont claires ; envisager un léger espacement entre les paragraphes (margin-bottom) si les blocs deviennent longs.

### 2. **Conversion et parcours “Réserver”**
- **CTA “Réserver”** : présent en nav, hero et cartes studios → bien. Sur la page d’accueil, le lien “Planning des Cours” mène à `/classes` (cours) alors que la réservation studio se fait via Picktime. À clarifier en copy si besoin : “Réserver un studio” vs “Voir les cours”.
- **Studios (page)** : un seul CTA “Réserver” par carte suffit ; pas de doublon.
- **WhatsApp** : bouton fixe sur tout le site → bon pour le contact ; éviter de le faire concurrence au CTA principal “Réserver” (position et taille actuelles sont correctes).

### 3. **Cohérence des infos de contact**
- Utiliser **partout** la même adresse (Rue Biranzarane), le même numéro (0661777421 / +212 661 77 77 21) et le même email (ex. contact@studiorj.ma).
- Mettre à jour : **Footer**, bandeau **Contact**, et FAQ si le numéro y est indiqué.

### 4. **Accessibilité**
- Vérifier que tous les **boutons et liens** ont un libellé explicite (ou `aria-label`) : déjà le cas pour le menu mobile et WhatsApp.
- **Contraste** : les textes blancs sur dégradés (Hero, WhyChooseUs) semblent corrects ; à valider avec un outil type axe DevTools ou WAVE si vous changez les couleurs.
- **Focus** : s’assurer que la navigation au clavier (Tab) montre un focus visible sur les liens et boutons (outline ou ring).

### 5. **Mobile**
- Hero : vidéo en 100vh sur mobile déjà en place.
- Cartes studios (accueil) : grille 1 colonne sur mobile, hauteur égale et bouton en bas → bon.
- Menu mobile : fermeture au clic sur un lien déjà présente ; garder un espace de tap confortable (padding actuel suffisant).

### 6. **Performance et technique**
- **Images** : les cartes studios sur l’accueil utilisent des URLs Unsplash ; pour la prod, héberger les images en local (ou via votre CDN) et utiliser `next/image` pour les optimiser.
- **Page Studios** : `studio-image.jpg` en local → bien ; garder des dimensions raisonnables (ex. max 1200–1600 px de large).
- **Formulaire contact** : envoi en POST vers `/api/contact` et email Resend → pas de changement nécessaire côté logique.

### 7. **Contenu et confiance**
- **Footer** : ajouter un lien “Mentions légales” ou “CGU” vers une page dédiée quand vous les aurez.
- **FAQ** : contenu clair (durée min, usages, annulation, demi-journée). Si vous avez des avis ou partenaires, une courte section “Ils nous font confiance” peut renforcer la crédibilité.
- **About** : vérifier que les chiffres (années, nombre de danseurs, etc.) correspondent bien à la réalité ou les adapter.

### 8. **Petits ajustements visuels**
- **WhyChooseUs** : les cartes sont bien mises en avant ; vous pouvez ajouter une très légère ombre ou bordure au survol pour renforcer le feedback.
- **Navigation** : l’indicateur de page active (point sous le lien) est clair ; à conserver.
- **WhatsApp** : position bas-droite et z-index au-dessus du contenu → correct ; ne pas le placer trop proche d’un autre CTA fixe pour éviter la surcharge.

---

## Résumé des actions prioritaires

| Priorité | Action |
|----------|--------|
| Haute | Remplacer tous les placeholders (téléphone, adresse) par les vraies infos (dont 0661777421 et Rue Biranzarane). |
| Haute | Supprimer les composants inutilisés : FormulesPreview, PicktimeBookButton, Schedule (ou les réutiliser de façon claire). |
| Haute | Décider : soit retirer BookingModal de la page d’accueil, soit réajouter un bouton qui l’ouvre. |
| Moyenne | Traduire “View Schedule” en “Voir le planning” ou “Réserver” dans ClassCard. |
| Moyenne | Footer : corriger adresse, téléphone, liens sociaux ; traduire ou retirer “Privacy Policy” / “Terms of Service”. |
| Basse | Ajouter Mentions légales / CGU quand disponibles. |
| Basse | Vérifier contraste et focus clavier (accessibilité). |

---

## Ce qui fonctionne déjà bien

- Structure des pages (Accueil, Studios, Classes, À propos, Contact) et navigation claire.
- Hero avec vidéo, titre et sous-titre alignés avec l’offre (location flexible, Casablanca).
- Cartes studios avec tarifs heures pleines / creuses bien séparés et lisibles.
- Formulaire de contact fonctionnel avec envoi d’email et template soigné.
- FAQ à jour et utile.
- Bouton WhatsApp global avec le bon numéro.
- Design cohérent (couleurs, typo, cartes) entre les pages.
- Responsive et mise en page mobile propre.

Si vous voulez, on peut enchaîner par des modifications concrètes dans le code (fichiers à toucher, extraits à remplacer) en commençant par les actions “Haute priorité”.

---

## Statut d'application (mis à jour)

### Fait
- **Code mort** : FormulesPreview, PicktimeBookButton, Schedule supprimés.
- **BookingModal** : retiré de la page d'accueil (reste sur /classes).
- **Footer** : adresse Rue Biranzarane, téléphone +212 661 77 77 21, email contact@studiorj.ma ; liens sociaux en Bientôt disponible ; Mentions légales / CGU.
- **Contact (bandeau)** : téléphone mis à jour (+212 661 77 77 21).
- **ClassCard** : View Schedule → Voir le planning.
- **FAQ** : numéro dans la réponse demi-journée/journée mis à jour (+212 661 77 77 21).
- **Accessibilité** : focus visible au clavier (outline) sur liens et boutons dans globals.css.
- **WhyChooseUs** : cartes ont déjà ombre et bordure au survol.

### Optionnel / à faire plus tard
- **Mentions légales / CGU** : créer les pages et mettre les vrais liens dans le footer (actuellement #).
- **About** : vérifier les chiffres (années, nombre de danseurs) avec le client.
- **Images** : remplacer les URLs Unsplash des cartes studios par des images locales et next/image pour la prod.
- **FAQ** : espacement entre paragraphes (margin-bottom) si les réponses s'allongent.
- **Contraste** : valider avec axe DevTools ou WAVE si les couleurs changent.
