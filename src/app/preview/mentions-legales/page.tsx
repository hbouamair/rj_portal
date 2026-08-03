"use client";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { BASE_PATH, CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, HOME_URL } from "@/lib/constants";

export default function PreviewMentionsLegalesPage() {
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
              <FileText className="w-8 h-8 text-primary-500" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-charcoal">Mentions légales</h1>
              <p className="text-soft-charcoal mt-1">Informations légales du site RJ Studio</p>
            </div>
          </div>
          <div className="prose prose-lg max-w-none text-soft-charcoal space-y-10">
            <section>
              <h2 className="text-xl font-display font-semibold text-charcoal mb-3">1. Éditeur du site</h2>
              <p className="leading-relaxed">
                Le site <strong>www.rjstudio.ma</strong> est édité par <strong>RJ Studio</strong>, studio de danse et location de studios situé à Casablanca, Maroc.
              </p>
              <p className="leading-relaxed mt-3">
                Adresse : {CONTACT_ADDRESS}.<br />
                Téléphone : {CONTACT_PHONE_DISPLAY}<br />
                Email : {CONTACT_EMAIL}
              </p>
            </section>
            <section>
              <h2 className="text-xl font-display font-semibold text-charcoal mb-3">2. Hébergement</h2>
              <p className="leading-relaxed">
                Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.
                Pour toute question relative à l&apos;hébergement, vous pouvez consulter les conditions sur vercel.com.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-display font-semibold text-charcoal mb-3">3. Propriété intellectuelle</h2>
              <p className="leading-relaxed">
                L&apos;ensemble du contenu de ce site (textes, images, vidéos, logos, graphismes) est protégé par le droit d&apos;auteur et les lois sur la propriété intellectuelle. Toute reproduction, représentation ou exploitation non autorisée des contenus est interdite sans accord préalable de RJ Studio.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-display font-semibold text-charcoal mb-3">4. Données personnelles (RGPD)</h2>
              <p className="leading-relaxed">
                Les données collectées via le formulaire de contact et les réservations sont utilisées uniquement pour répondre à vos demandes et gérer vos réservations. Elles ne sont pas cédées à des tiers. Conformément à la réglementation en vigueur, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données en nous contactant à {CONTACT_EMAIL}.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-display font-semibold text-charcoal mb-3">5. Cookies</h2>
              <p className="leading-relaxed">
                Le site peut utiliser des cookies techniques nécessaires au bon fonctionnement (session, préférences). Aucun cookie publicitaire ou de traçage tiers n&apos;est utilisé sans votre consentement. Vous pouvez configurer votre navigateur pour refuser les cookies.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-display font-semibold text-charcoal mb-3">6. Limitation de responsabilité</h2>
              <p className="leading-relaxed">
                RJ Studio s&apos;efforce d&apos;assurer l&apos;exactitude des informations publiées. Toutefois, RJ Studio ne peut être tenu responsable des erreurs, omissions ou des conséquences liées à l&apos;utilisation des informations de ce site. Les liens vers des sites externes n&apos;engagent pas la responsabilité de RJ Studio.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-display font-semibold text-charcoal mb-3">7. Contact</h2>
              <p className="leading-relaxed">
                Pour toute question relative aux mentions légales : {CONTACT_EMAIL} ou {CONTACT_PHONE_DISPLAY}.
              </p>
            </section>
          </div>
          <div className="mt-12 pt-8 border-t border-charcoal/10 flex flex-wrap gap-6">
            <Link href={`${BASE_PATH}/cgu`} className="text-primary-500 hover:text-primary-600 font-medium transition-colors">
              Voir les Conditions générales d&apos;utilisation (CGU)
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
