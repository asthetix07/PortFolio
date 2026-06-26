import type { MetadataRoute } from "next";
import { baseURL, routes as routesConfig } from "@/resources";
import { supabase } from "@/lib/supabase";

// Routes that should never appear in the sitemap
const EXCLUDED_ROUTES = ["/admin", "/admin/dashboard"];

// SEO priority and change frequency per route
const ROUTE_SEO_CONFIG: Record<
  string,
  { changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }
> = {
  "/": { changeFrequency: "weekly", priority: 1.0 },
  "/about": { changeFrequency: "monthly", priority: 0.8 },
  "/work": { changeFrequency: "weekly", priority: 0.9 },
  "/projects": { changeFrequency: "weekly", priority: 0.9 },
  "/blog": { changeFrequency: "daily", priority: 0.9 },
  "/gallery": { changeFrequency: "monthly", priority: 0.6 },
  "/contact": { changeFrequency: "yearly", priority: 0.5 },
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString().split("T")[0];

  // ── Static routes ──────────────────────────────────────────────────
  const activeRoutes = Object.keys(routesConfig)
    .filter(
      (route) =>
        routesConfig[route as keyof typeof routesConfig] &&
        !EXCLUDED_ROUTES.includes(route),
    )
    .map((route) => {
      const config = ROUTE_SEO_CONFIG[route] ?? {
        changeFrequency: "monthly" as const,
        priority: 0.5,
      };
      return {
        url: `${baseURL}${route !== "/" ? route : ""}`,
        lastModified: now,
        changeFrequency: config.changeFrequency,
        priority: config.priority,
      };
    });

  // ── Dynamic blog posts (fetched from Supabase at request time) ────
  let blogs: MetadataRoute.Sitemap = [];
  try {
    const { data: blogData } = await supabase
      .from("blogs")
      .select("slug, created_at, updated_at")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (blogData) {
      blogs = blogData.map((post) => ({
        url: `${baseURL}/blog/${post.slug}`,
        lastModified: post.updated_at || post.created_at,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch (err) {
    console.error("Sitemap: failed to fetch blogs from Supabase:", err);
  }

  // ── Dynamic project pages (fetched from Supabase at request time) ─
  let works: MetadataRoute.Sitemap = [];
  try {
    const { data: projectData } = await supabase
      .from("projects")
      .select("title, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (projectData) {
      works = projectData.map((project) => {
        const slug = project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        return {
          url: `${baseURL}/work/${slug}`,
          lastModified: project.updated_at || project.created_at,
          changeFrequency: "monthly" as const,
          priority: 0.7,
        };
      });
    }
  } catch (err) {
    console.error("Sitemap: failed to fetch projects from Supabase:", err);
  }

  return [...activeRoutes, ...blogs, ...works];
}
