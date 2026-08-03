"use client";

import { useState, useTransition } from "react";
import { Check, FileText, Loader2, Mail, Sparkles } from "lucide-react";
import { updateSitePageContent } from "@/app/admin/actions";
import type { AboutPageContent, ContactPageContent } from "@/lib/site-content/types";

type Tab = "contact" | "about";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-white/45">
        {label}
      </span>
      {children}
    </label>
  );
}

export default function SiteContentEditor({
  contact,
  about,
}: {
  contact: ContactPageContent;
  about: AboutPageContent;
}) {
  const [tab, setTab] = useState<Tab>("contact");
  const [contactContent, setContactContent] = useState(contact);
  const [aboutContent, setAboutContent] = useState(about);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateSitePageContent(
        tab,
        tab === "contact" ? contactContent : aboutContent
      );
      if (!result.ok) {
        setError(result.error ?? "Erreur");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab("contact")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
            tab === "contact"
              ? "bg-teal-400/15 border-teal-300/30 text-teal-200"
              : "bg-white/[0.03] border-white/10 text-white/55 hover:text-white"
          }`}
        >
          <Mail className="w-4 h-4" />
          Contact
        </button>
        <button
          type="button"
          onClick={() => setTab("about")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
            tab === "about"
              ? "bg-teal-400/15 border-teal-300/30 text-teal-200"
              : "bg-white/[0.03] border-white/10 text-white/55 hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          À propos
        </button>
      </div>

      <div className="admin-card p-5 sm:p-6 space-y-5">
        {tab === "contact" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Titre de page">
              <input
                className="admin-input w-full"
                value={contactContent.pageTitle}
                onChange={(e) =>
                  setContactContent((c) => ({ ...c, pageTitle: e.target.value }))
                }
              />
            </Field>
            <Field label="Sous-titre">
              <input
                className="admin-input w-full"
                value={contactContent.pageSubtitle}
                onChange={(e) =>
                  setContactContent((c) => ({ ...c, pageSubtitle: e.target.value }))
                }
              />
            </Field>
            <Field label="Titre du formulaire">
              <input
                className="admin-input w-full"
                value={contactContent.formTitle}
                onChange={(e) =>
                  setContactContent((c) => ({ ...c, formTitle: e.target.value }))
                }
              />
            </Field>
            <Field label="Sous-titre du formulaire">
              <input
                className="admin-input w-full"
                value={contactContent.formSubtitle}
                onChange={(e) =>
                  setContactContent((c) => ({ ...c, formSubtitle: e.target.value }))
                }
              />
            </Field>
            <Field label="Adresse">
              <input
                className="admin-input w-full md:col-span-2"
                value={contactContent.address}
                onChange={(e) =>
                  setContactContent((c) => ({ ...c, address: e.target.value }))
                }
              />
            </Field>
            <Field label="Téléphone">
              <input
                className="admin-input w-full"
                value={contactContent.phone}
                onChange={(e) =>
                  setContactContent((c) => ({ ...c, phone: e.target.value }))
                }
              />
            </Field>
            <Field label="Email">
              <input
                className="admin-input w-full"
                type="email"
                value={contactContent.email}
                onChange={(e) =>
                  setContactContent((c) => ({ ...c, email: e.target.value }))
                }
              />
            </Field>
            <Field label="Horaires affichés">
              <input
                className="admin-input w-full"
                value={contactContent.openingHours}
                onChange={(e) =>
                  setContactContent((c) => ({ ...c, openingHours: e.target.value }))
                }
              />
            </Field>
            <Field label="Requête Google Maps">
              <input
                className="admin-input w-full md:col-span-2"
                value={contactContent.mapQuery}
                onChange={(e) =>
                  setContactContent((c) => ({ ...c, mapQuery: e.target.value }))
                }
              />
            </Field>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Badge">
                <input
                  className="admin-input w-full"
                  value={aboutContent.badgeLabel}
                  onChange={(e) =>
                    setAboutContent((c) => ({ ...c, badgeLabel: e.target.value }))
                  }
                />
              </Field>
              <Field label="Texte du bouton CTA">
                <input
                  className="admin-input w-full"
                  value={aboutContent.ctaText}
                  onChange={(e) =>
                    setAboutContent((c) => ({ ...c, ctaText: e.target.value }))
                  }
                />
              </Field>
              <Field label="Titre — partie 1">
                <input
                  className="admin-input w-full"
                  value={aboutContent.titlePrefix}
                  onChange={(e) =>
                    setAboutContent((c) => ({ ...c, titlePrefix: e.target.value }))
                  }
                />
              </Field>
              <Field label="Titre — partie mise en avant">
                <input
                  className="admin-input w-full"
                  value={aboutContent.titleHighlight}
                  onChange={(e) =>
                    setAboutContent((c) => ({ ...c, titleHighlight: e.target.value }))
                  }
                />
              </Field>
            </div>
            <Field label="Introduction">
              <textarea
                className="admin-input w-full min-h-[88px] resize-y"
                value={aboutContent.subtitle}
                onChange={(e) =>
                  setAboutContent((c) => ({ ...c, subtitle: e.target.value }))
                }
              />
            </Field>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-white/70">Notre concept</p>
              <input
                className="admin-input w-full"
                value={aboutContent.conceptTitle}
                onChange={(e) =>
                  setAboutContent((c) => ({ ...c, conceptTitle: e.target.value }))
                }
              />
              {aboutContent.conceptParagraphs.map((paragraph, index) => (
                <textarea
                  key={`concept-${index}`}
                  className="admin-input w-full min-h-[96px] resize-y"
                  value={paragraph}
                  onChange={(e) =>
                    setAboutContent((c) => {
                      const next = [...c.conceptParagraphs];
                      next[index] = e.target.value;
                      return { ...c, conceptParagraphs: next };
                    })
                  }
                />
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-white/70">Notre mission</p>
              <input
                className="admin-input w-full"
                value={aboutContent.missionTitle}
                onChange={(e) =>
                  setAboutContent((c) => ({ ...c, missionTitle: e.target.value }))
                }
              />
              {aboutContent.missionParagraphs.map((paragraph, index) => (
                <textarea
                  key={`mission-${index}`}
                  className="admin-input w-full min-h-[96px] resize-y"
                  value={paragraph}
                  onChange={(e) =>
                    setAboutContent((c) => {
                      const next = [...c.missionParagraphs];
                      next[index] = e.target.value;
                      return { ...c, missionParagraphs: next };
                    })
                  }
                />
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-white/70">Valeurs</p>
              <input
                className="admin-input w-full"
                value={aboutContent.valuesTitle}
                onChange={(e) =>
                  setAboutContent((c) => ({ ...c, valuesTitle: e.target.value }))
                }
              />
              {aboutContent.values.map((value, index) => (
                <div
                  key={`value-${index}`}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3"
                >
                  <input
                    className="admin-input w-full"
                    value={value.title}
                    placeholder="Titre"
                    onChange={(e) =>
                      setAboutContent((c) => {
                        const next = [...c.values];
                        next[index] = { ...next[index], title: e.target.value };
                        return { ...c, values: next };
                      })
                    }
                  />
                  <textarea
                    className="admin-input w-full min-h-[72px] resize-y"
                    value={value.description}
                    placeholder="Description"
                    onChange={(e) =>
                      setAboutContent((c) => {
                        const next = [...c.values];
                        next[index] = { ...next[index], description: e.target.value };
                        return { ...c, values: next };
                      })
                    }
                  />
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-white/70">Chiffres clés</p>
              {aboutContent.stats.map((stat, index) => (
                <div
                  key={`stat-${index}`}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                >
                  <input
                    className="admin-input w-full"
                    type="number"
                    value={stat.value}
                    onChange={(e) =>
                      setAboutContent((c) => {
                        const next = [...c.stats];
                        next[index] = {
                          ...next[index],
                          value: Number(e.target.value) || 0,
                        };
                        return { ...c, stats: next };
                      })
                    }
                  />
                  <input
                    className="admin-input w-full"
                    value={stat.suffix}
                    placeholder="Suffixe (ex: m², j/7)"
                    onChange={(e) =>
                      setAboutContent((c) => {
                        const next = [...c.stats];
                        next[index] = { ...next[index], suffix: e.target.value };
                        return { ...c, stats: next };
                      })
                    }
                  />
                  <input
                    className="admin-input w-full"
                    value={stat.label}
                    placeholder="Libellé"
                    onChange={(e) =>
                      setAboutContent((c) => {
                        const next = [...c.stats];
                        next[index] = { ...next[index], label: e.target.value };
                        return { ...c, stats: next };
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-rose-300 bg-rose-400/10 border border-rose-400/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={save}
            disabled={isPending}
            className="admin-btn-primary inline-flex items-center gap-2 min-h-11 px-5"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enregistrement…
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4" />
                Enregistré
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Enregistrer {tab === "contact" ? "Contact" : "À propos"}
              </>
            )}
          </button>
          <a
            href={tab === "contact" ? "/contact" : "/about"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-teal-300/80 hover:text-teal-200 underline underline-offset-2"
          >
            Voir la page →
          </a>
        </div>
      </div>
    </div>
  );
}
