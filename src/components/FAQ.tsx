"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle } from "lucide-react";
import { useState } from "react";
import { BASE_PATH } from "@/lib/constants";

const faqs = [
  {
    question: "Quelle est la durée minimum de réservation ?",
    answer: "La durée minimum de réservation est de 1 heure.\n\nAprès la première heure, il est possible de réserver par tranches de 30 minutes.\n\nPar exemple, vous pouvez réserver un studio pour 1h30, 2h, 2h30, etc., selon les disponibilités."
  },
  {
    question: "À quels usages les studios peuvent-ils être loués ?",
    answer: "Les studios peuvent être loués pour une large variété d'activités, notamment :\n\n• Cours collectifs : tous types de danse, yoga, mat Pilates, stretching, fitness, etc.\n\n• Cours privés ou en petits groupes : coaching individuel, séances personnalisées, entraînements ciblés.\n\n• Répétitions : danseurs, chorégraphies, spectacles, performances scéniques.\n\n• Création et production de contenu : enregistrements vidéo de danse, tournages de contenus artistiques, répétitions filmées, shootings photo.\n\nLes studios sont adaptés à un usage artistique, sportif et créatif, dans le respect des règles de fonctionnement du lieu."
  },
  {
    question: "Puis-je venir au studio sans réservation préalable ?",
    answer: "Non. L'accès aux studios se fait uniquement sur réservation préalable, et ce selon les disponibilités.\n\nCette règle s'applique à tous les usages, qu'il s'agisse d'un usage personnel, d'un cours privé ou de cours collectifs."
  },
  {
    question: "Puis-je annuler ma réservation ?",
    answer: "Annulation gratuite jusqu'à 72 h avant la session. Entre 24 h et 72 h avant la session : 50 % du montant retenu. Moins de 24 h avant la session : aucun remboursement."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative py-24 md:py-32 overflow-hidden bg-white">
      {/* Background decoration */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-gradient-to-br from-accent-500/10 to-tertiary-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 2xl:max-w-8xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", duration: 0.8 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary-500/10 to-secondary-500/10 mb-6"
          >
            <HelpCircle className="w-5 h-5 text-primary-500" />
            <span className="text-sm font-semibold font-nav text-charcoal">FAQ</span>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 text-charcoal">
            Questions{" "}
            <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Fréquentes
            </span>
          </h2>

          <p className="text-lg md:text-xl text-soft-charcoal leading-relaxed">
            Trouvez rapidement les réponses à vos questions les plus courantes.
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="max-w-4xl 2xl:max-w-5xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <motion.div
                className="skeu-card overflow-hidden"
                whileHover={{ scale: 1.01 }}
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between p-6 text-left cursor-pointer"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={openIndex === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <h3 className="text-lg md:text-xl font-display font-semibold text-charcoal pr-8">
                    {faq.question}
                  </h3>

                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                    aria-hidden
                  >
                    {openIndex === index ? (
                      <Minus className="w-6 h-6 text-primary-500" />
                    ) : (
                      <Plus className="w-6 h-6 text-primary-500" />
                    )}
                  </motion.div>
                </button>

                {/* Answer */}
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      id={`faq-answer-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-0">
                        <motion.div
                          initial={{ y: -10 }}
                          animate={{ y: 0 }}
                          className="pt-4 border-t border-charcoal/10"
                        >
                          <div className="text-soft-charcoal leading-relaxed space-y-4">
                            {faq.answer.split(/\n\n+/).map((paragraph, i) => (
                              <p key={i} className="m-0">
                                {paragraph.trim()}
                              </p>
                            ))}
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-soft-charcoal mb-4 text-lg">
            Vous avez d&apos;autres questions ?
          </p>
            <a
            href={`${BASE_PATH}/contact`}
            className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold font-nav rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-[1.05] active:scale-[0.95]"
          >
            Contactez-nous
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
