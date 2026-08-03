import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublic } from "@/lib/supabase/public";
import {
  DEFAULT_ABOUT_CONTENT,
  DEFAULT_CONTACT_CONTENT,
} from "./defaults";
import type {
  AboutPageContent,
  ContactPageContent,
  SitePageSlug,
} from "./types";

function formatDbError(scope: string, error: { message: string }) {
  return new Error(`${scope}: ${error.message}`);
}

function mergeContact(raw: Partial<ContactPageContent> | null | undefined): ContactPageContent {
  return { ...DEFAULT_CONTACT_CONTENT, ...raw };
}

function mergeAbout(raw: Partial<AboutPageContent> | null | undefined): AboutPageContent {
  const merged = { ...DEFAULT_ABOUT_CONTENT, ...raw };
  return {
    ...merged,
    conceptParagraphs:
      raw?.conceptParagraphs?.filter(Boolean).length
        ? raw.conceptParagraphs.filter(Boolean)
        : DEFAULT_ABOUT_CONTENT.conceptParagraphs,
    missionParagraphs:
      raw?.missionParagraphs?.filter(Boolean).length
        ? raw.missionParagraphs.filter(Boolean)
        : DEFAULT_ABOUT_CONTENT.missionParagraphs,
    values: raw?.values?.length ? raw.values : DEFAULT_ABOUT_CONTENT.values,
    stats: raw?.stats?.length ? raw.stats : DEFAULT_ABOUT_CONTENT.stats,
  };
}

export async function fetchContactContent(
  client: SupabaseClient = getSupabasePublic()
): Promise<ContactPageContent> {
  try {
    const { data, error } = await client
      .from("site_pages")
      .select("content")
      .eq("slug", "contact")
      .maybeSingle();
    if (error) throw formatDbError("fetchContactContent", error);
    return mergeContact((data?.content as Partial<ContactPageContent>) ?? undefined);
  } catch {
    return DEFAULT_CONTACT_CONTENT;
  }
}

export async function fetchAboutContent(
  client: SupabaseClient = getSupabasePublic()
): Promise<AboutPageContent> {
  try {
    const { data, error } = await client
      .from("site_pages")
      .select("content")
      .eq("slug", "about")
      .maybeSingle();
    if (error) throw formatDbError("fetchAboutContent", error);
    return mergeAbout((data?.content as Partial<AboutPageContent>) ?? undefined);
  } catch {
    return DEFAULT_ABOUT_CONTENT;
  }
}

export async function fetchAllSiteContent(
  client: SupabaseClient = getSupabasePublic()
): Promise<{ contact: ContactPageContent; about: AboutPageContent }> {
  const [contact, about] = await Promise.all([
    fetchContactContent(client),
    fetchAboutContent(client),
  ]);
  return { contact, about };
}

export async function fetchSitePageRaw(
  slug: SitePageSlug,
  client: SupabaseClient = getSupabasePublic()
) {
  const { data, error } = await client
    .from("site_pages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw formatDbError(`fetchSitePageRaw(${slug})`, error);
  return data;
}
