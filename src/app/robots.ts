import type { MetadataRoute } from "next";
import { COMING_SOON } from "@/lib/constants";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.rjstudio.ma";

export default function robots(): MetadataRoute.Robots {
  if (COMING_SOON) {
    return {
      rules: [
        {
          userAgent: "*",
          allow: "/",
          disallow: [
            "/api/",
            "/preview/",
            "/about",
            "/classes",
            "/studios",
            "/instructors",
            "/contact",
            "/cgu",
            "/mentions-legales",
          ],
        },
      ],
      sitemap: `${siteUrl}/sitemap.xml`,
      host: siteUrl,
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
