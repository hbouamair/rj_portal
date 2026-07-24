import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client. NEXT_PUBLIC_* must be referenced literally
 * so Next.js inlines them into the client bundle.
 */
export function getSupabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or publishable/anon key in .env.local"
    );
  }

  return createBrowserClient(url, key, {
    cookieOptions: {
      path: "/",
      sameSite: "lax",
      // localhost is http — Secure cookies would be dropped by the browser
      secure: process.env.NODE_ENV === "production",
    },
  });
}
