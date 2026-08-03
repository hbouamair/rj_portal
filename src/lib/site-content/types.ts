export type SitePageSlug = "contact" | "about";

export interface ContactPageContent {
  pageTitle: string;
  pageSubtitle: string;
  formTitle: string;
  formSubtitle: string;
  address: string;
  phone: string;
  email: string;
  openingHours: string;
  mapQuery: string;
}

export interface AboutStatContent {
  value: number;
  suffix: string;
  label: string;
}

export interface AboutValueContent {
  title: string;
  description: string;
}

export interface AboutPageContent {
  badgeLabel: string;
  titlePrefix: string;
  titleHighlight: string;
  subtitle: string;
  conceptTitle: string;
  conceptParagraphs: string[];
  missionTitle: string;
  missionParagraphs: string[];
  valuesTitle: string;
  values: AboutValueContent[];
  stats: AboutStatContent[];
  ctaText: string;
}

export type SitePageContent = ContactPageContent | AboutPageContent;

export interface SitePageRow<T extends SitePageContent = SitePageContent> {
  slug: SitePageSlug;
  content: T;
  updated_at: string;
}
