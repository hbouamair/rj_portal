"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export interface LoginResult {
  ok: boolean;
  error?: string;
}

/**
 * Server-side login so auth cookies are written on the response
 * (browser-only signIn often leaves middleware unable to see the session).
 */
export async function loginAdmin(
  email: string,
  password: string
): Promise<LoginResult> {
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail || !password) {
    return { ok: false, error: "Email et mot de passe requis." };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return {
      ok: false,
      error:
        "Configuration Supabase manquante (URL / clé publishable) dans .env.local.",
    };
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: trimmedEmail,
    password,
  });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { ok: false, error: "Email ou mot de passe incorrect." };
    }
    if (error.message.includes("Email not confirmed")) {
      return {
        ok: false,
        error:
          "Confirmez votre email dans Supabase (Authentication → Users), ou recréez l'utilisateur avec « Auto Confirm User ».",
      };
    }
    return { ok: false, error: error.message };
  }

  if (!data.session || !data.user) {
    return {
      ok: false,
      error:
        "Session non créée. Vérifiez que l'utilisateur existe dans Supabase Auth.",
    };
  }

  return { ok: true };
}

export async function logoutAdmin(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return;

  const cookieStore = await cookies();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.signOut();
}
