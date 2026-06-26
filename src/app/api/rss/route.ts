import { baseURL, blog, person } from "@/resources";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  let posts: { slug: string; title: string; description: string; created_at: string; cover_url: string | null; tag?: string }[] = [];

  try {
    const { data, error } = await supabase
      .from("blogs")
      .select("slug, title, description, created_at, cover_url")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      posts = data;
    }
  } catch (err) {
    console.error("RSS: failed to fetch blogs from Supabase:", err);
  }

  // Generate RSS XML
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${blog.title}</title>
    <link>${baseURL}/blog</link>
    <description>${blog.description}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseURL}/api/rss" rel="self" type="application/rss+xml" />
    <managingEditor>${person.email || "noreply@example.com"} (${person.name})</managingEditor>
    <webMaster>${person.email || "noreply@example.com"} (${person.name})</webMaster>
    <image>
      <url>${baseURL}${person.avatar || "/images/avatar.png"}</url>
      <title>${blog.title}</title>
      <link>${baseURL}/blog</link>
    </image>
    ${posts
      .map(
        (post) => `
    <item>
      <title>${post.title}</title>
      <link>${baseURL}/blog/${post.slug}</link>
      <guid>${baseURL}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
      <description><![CDATA[${post.description}]]></description>
      ${post.cover_url ? `<enclosure url="${post.cover_url}" type="image/jpeg" />` : ""}
      <author>${person.email || "noreply@example.com"} (${person.name})</author>
    </item>`,
      )
      .join("")}
  </channel>
</rss>`;

  // Return the RSS XML with the appropriate content type
  return new NextResponse(rssXml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
