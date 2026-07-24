import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { COMING_SOON } from "@/lib/constants";

const BLOCKED_WHILE_COMING_SOON = [
  "/about",
  "/classes",
  "/studios",
  "/instructors",
  "/contact",
  "/cgu",
  "/mentions-legales",
  "/reservation",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    // Always create a response we can attach refreshed cookies to
    let response = NextResponse.next({ request });

    if (!url || !key) {
      if (pathname !== "/admin/login") {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
      return response;
    }

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, {
              ...options,
              path: options?.path ?? "/",
              sameSite: (options?.sameSite as "lax" | "strict" | "none") ?? "lax",
              secure: process.env.NODE_ENV === "production",
            });
          });
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isLoginPage = pathname === "/admin/login";

    if (!user && !isLoginPage) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    if (user && isLoginPage) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return response;
  }

  if (
    COMING_SOON &&
    BLOCKED_WHILE_COMING_SOON.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
