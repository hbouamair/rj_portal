import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

function getAuthConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return { url, key };
}

/**
 * POST /api/admin/login
 * Signs in and attaches Supabase auth cookies to the HTTP response.
 * Prefer the browser client on the login page; this route remains as a fallback.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email et mot de passe requis." },
        { status: 400 }
      );
    }

    const { url, key } = getAuthConfig();
    if (!url || !key) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Configuration Supabase manquante (URL / clé publishable ou anon) dans .env.local.",
        },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ ok: true });
    let cookiesWritten = 0;

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesWritten += cookiesToSet.length;
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, {
              ...options,
              path: options?.path ?? "/",
              sameSite: options?.sameSite ?? "lax",
              secure: process.env.NODE_ENV === "production",
            });
          });
        },
      },
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      let message = error.message;
      const isNetwork =
        /fetch failed|ECONNRESET|ENOTFOUND|ETIMEDOUT|certificate|network/i.test(
          error.message
        );
      if (isNetwork) {
        message =
          "Impossible de joindre Supabase depuis ce réseau (connexion coupée / pare-feu). Vérifiez internet, VPN, ou pause du projet Supabase.";
      } else if (error.message.includes("Invalid login credentials")) {
        message = "Email ou mot de passe incorrect.";
      } else if (error.message.includes("Email not confirmed")) {
        message =
          "Confirmez votre email dans Supabase (Authentication → Users), ou recréez l'utilisateur avec « Auto Confirm User ».";
      }
      return NextResponse.json(
        { ok: false, error: message },
        { status: isNetwork ? 503 : 401 }
      );
    }

    if (!data.session || !data.user) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Session non créée. Vérifiez que l'utilisateur existe dans Supabase Auth.",
        },
        { status: 401 }
      );
    }

    // Force cookie write if sign-in did not trigger setAll (known SSR edge case)
    if (cookiesWritten === 0) {
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "La session n'a pas pu être vérifiée après connexion. Ajoutez la clé anon JWT (eyJ…) dans NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        },
        { status: 500 }
      );
    }

    if (cookiesWritten === 0) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Cookies de session non écrits. Ajoutez NEXT_PUBLIC_SUPABASE_ANON_KEY (clé JWT eyJ… dans Supabase → API) et redémarrez le serveur.",
        },
        { status: 500 }
      );
    }

    return response;
  } catch (err) {
    console.error("Admin login API error:", err);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur lors de la connexion." },
      { status: 500 }
    );
  }
}
