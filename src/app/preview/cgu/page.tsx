"use client";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowLeft, ScrollText } from "lucide-react";
import { BASE_PATH, CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, HOME_URL } from "@/lib/constants";

export default function PreviewCGUPage() {
  return (
    <>
      <Navigation />
      <main className="relative pt-24 pb-16 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 max-w-4xl">
          <Link
            href={HOME_URL}
            className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-medium mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l&apos;accueil
          </Link>
          <div className="flex items-center gap-3 mb-10">
            <div className="p-3 rounded-2xl bg-primary-500/10">
              <ScrollText className="w-8 h-8 text-primary-500" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-charcoal">Conditions générales d&apos;utilisation</h1>
              <p className="text-soft-charcoal mt-1">CGU — Réservation et utilisation des studios RJ Studio</p>
            </div>
          </div>
          <div className="prose prose-lg max-w-none text-soft-charcoal space-y-10">
            <section>
              <h2 className="text-xl font-display font-semibold text-charcoal mb-3">1. Objet et acceptation</h2>
              <p className="leading-relaxed">
                Les présentes Conditions générales d&apos;utilisation (CGU) régissent l&apos;accès et l&apos;utilisation des services de location de studios et des cours proposés par <strong>RJ Studio</strong>, situé Rue Biranzarane, Casablanca. En réservant un studio ou en utilisant nos services, vous acceptez sans réserve les présentes CGU.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-display font-semibold text-charcoal mb-3">2. Réservation</h2>
              <p className="leading-relaxed">
                La réservation s&apos;effectue en ligne via la plateforme indiquée sur le site (Picktime ou équivalent) ou par téléphone / WhatsApp au {CONTACT_PHONE_DISPLAY}. La durée minimum de réservation est d&apos;une heure. Au-delà, les réservations se font par tranches de 30 minutes. Les réservations à la demi-journée ou à la journée sont soumises à devis sur demande.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-display font-semibold text-charcoal mb-3">3. Paiement</h2>
              <p className="leading-relaxed">
                Le paiement est demandé au moment de la réservation ou selon les modalités communiquées (packs d&apos;heures, formules). Les moyens de paiement acceptés sont ceux proposés sur la plateforme de réservation. Les tarifs en vigueur (heures pleines / heures creuses, packs) sont indiqués sur le site et peuvent être modifiés ; le tarif applicable est celui au moment de la réservation.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-display font-semibold text-charcoal mb-3">4. Annulation et remboursement</h2>
              <p className="leading-relaxed">
                <strong>Annulation gratuite</strong> jusqu&apos;à 72 h avant le début de la session. Entre 24 h et 72 h avant la session : des frais d&apos;annulation peuvent s&apos;appliquer (50 % du montant retenu selon les cas). Moins de 24 h avant la session : aucun remboursement. Les créneaux non utilisés dans le cadre d&apos;un pack restent valables selon les conditions du pack.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-display font-semibold text-charcoal mb-3">5. Utilisation des studios</h2>
              <p className="leading-relaxed">
                Les studios sont mis à disposition pour des activités artistiques, sportives et créatives (danse, yoga, fitness, répétitions, tournages, etc.). L&apos;utilisateur s&apos;engage à respecter le matériel et les lieux, à ne pas causer de nuisances et à quitter le studio à l&apos;heure prévue. RJ Studio se réserve le droit de refuser l&apos;accès en cas de non-respect des règles ou de comportement inapproprié.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-display font-semibold text-charcoal mb-3">6. Responsabilité</h2>
              <p className="leading-relaxed">
                RJ Studio met tout en œuvre pour assurer la sécurité et le bon état des studios. La responsabilité de RJ Studio ne peut être engagée en cas de vol, dommage ou accident survenant dans le cadre de l&apos;usage des locaux, sauf faute prouvée de sa part. Les utilisateurs sont responsables de leurs effets personnels et des personnes qu&apos;ils invitent.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-display font-semibold text-charcoal mb-3">7. Cours et instructeurs</h2>
              <p className="leading-relaxed">
                Les cours proposés par RJ Studio ou par des instructeurs partenaires sont soumis à des conditions spécifiques communiquées lors de l&apos;inscription. La présence aux cours est soumise aux mêmes règles d&apos;annulation que les locations de studios, sauf mention contraire.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-display font-semibold text-charcoal mb-3">8. Modifications et litiges</h2>
              <p className="leading-relaxed">
                RJ Studio se réserve le droit de modifier les présentes CGU. Les modifications sont opposables à partir de leur publication sur le site. Pour toute question ou litige, merci de nous contacter à {CONTACT_EMAIL} ou au {CONTACT_PHONE_DISPLAY}. Le droit marocain est applicable.
              </p>
            </section>
          </div>
          <div className="mt-12 pt-8 border-t border-charcoal/10 flex flex-wrap gap-6">
            <Link href={`${BASE_PATH}/mentions-legales`} className="text-primary-500 hover:text-primary-600 font-medium transition-colors">
              Voir les Mentions légales
            </Link>
            <Link href={`${BASE_PATH}/contact`} className="text-primary-500 hover:text-primary-600 font-medium transition-colors">
              Nous contacter
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
