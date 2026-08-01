import type { Studio } from "./types";

const URL_REGEX = /^https?:\/\/.+/i;

/** Ordered gallery images; falls back to legacy single `image_url`. */
export function getStudioImages(
  studio: Pick<Studio, "gallery_urls" | "image_url">
): string[] {
  const gallery = studio.gallery_urls?.filter(Boolean) ?? [];
  if (gallery.length > 0) return gallery;
  if (studio.image_url) return [studio.image_url];
  return [];
}

export function getStudioCoverImage(
  studio: Pick<Studio, "gallery_urls" | "image_url">
): string | null {
  return getStudioImages(studio)[0] ?? null;
}

export function normalizeGalleryUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of urls) {
    const url = raw.trim();
    if (!url || !URL_REGEX.test(url) || seen.has(url)) continue;
    seen.add(url);
    result.push(url);
    if (result.length >= 12) break;
  }
  return result;
}

export function isValidImageUrl(url: string): boolean {
  return URL_REGEX.test(url.trim());
}
