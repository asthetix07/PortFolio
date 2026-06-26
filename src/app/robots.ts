import type { MetadataRoute } from "next";
import { baseURL } from "@/resources";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Allow all legitimate crawlers to index public content
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",           // Admin panel — private
          "/admin/*",         // All admin sub-routes
          "/api/",            // API endpoints — not user-facing pages
          "/_next/",          // Next.js internal assets
        ],
      },
      {
        // Block aggressive AI training scrapers that don't respect site terms
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "CCBot",
          "anthropic-ai",
          "Claude-Web",
          "Google-Extended",
          "Bytespider",
          "PetalBot",
        ],
        disallow: "/",
      },
    ],
    sitemap: `${baseURL}/sitemap.xml`,
    host: baseURL,
  };
}
