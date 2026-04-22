import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { MetadataRoute } from "next";
import { getPublicSiteUrl } from "./site-config";

/**
 * 供 sitemap 脚本、app/sitemap 共用。使用独立 createClient，避免 tsx 脚本无法解析 @/ 别名问题。
 */
function createSupabaseForSitemap(): SupabaseClient {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    "https://placeholder.supabase.co";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    "placeholder";
  return createClient(supabaseUrl, supabaseKey);
}

function pathSegFromProperty(p: { slug: string | null; id: string }): string {
  const s = p.slug?.trim();
  if (s) return s;
  return p.id;
}

const STATIC_PATHS: { path: string; changeFrequency: NonNullable<MetadataRoute.Sitemap[0]["changeFrequency"]>; priority: number }[] = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/properties", changeFrequency: "daily", priority: 0.9 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
];

const LANGS = ["zh", "en"] as const;

function abs(lang: (typeof LANGS)[number], pathWoLang: string): string {
  const base = getPublicSiteUrl();
  const suffix = pathWoLang || "";
  return `${base}/${lang}${suffix}`;
}

/**
 * 构建 Next.js MetadataRoute.Sitemap，与 build-metadata 中 hreflang 一致：zh-CN、en-US、x-default=中文站。
 */
export async function getSitemapEntriesForNext(
  supabase: SupabaseClient = createSupabaseForSitemap()
): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const { data: properties, error: pe } = await supabase
    .from("properties")
    .select("slug, id, updated_at")
    .eq("is_published", true)
    .order("updated_at", { ascending: false });
  if (pe) {
    console.error("[sitemap] properties fetch", pe);
  }

  const { data: blogPosts, error: be } = await supabase
    .from("blog_posts")
    .select("slug, updated_at")
    .eq("published", true)
    .order("updated_at", { ascending: false });
  if (be) {
    console.error("[sitemap] blog fetch", be);
  }

  const out: MetadataRoute.Sitemap = [];

  const alts = (pathSuffix: string) => {
    const zh = abs("zh", pathSuffix);
    const en = abs("en", pathSuffix);
    return {
      languages: {
        "zh-CN": zh,
        "en-US": en,
        "x-default": zh,
      } satisfies Record<string, string>,
    };
  };

  for (const sp of STATIC_PATHS) {
    const p = sp.path;
    for (const lang of LANGS) {
      out.push({
        url: abs(lang, p),
        lastModified: now,
        changeFrequency: sp.changeFrequency,
        priority: sp.priority,
        alternates: alts(p),
      });
    }
  }

  for (const pr of properties || []) {
    const seg = pathSegFromProperty(pr);
    const pathSuffix = `/property/${seg}`;
    const lastMod = pr.updated_at ? new Date(pr.updated_at) : now;
    for (const lang of LANGS) {
      out.push({
        url: abs(lang, pathSuffix),
        lastModified: lastMod,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: alts(pathSuffix),
      });
    }
  }

  for (const post of blogPosts || []) {
    const pathSuffix = `/blog/${post.slug}`;
    const lastMod = post.updated_at ? new Date(post.updated_at) : now;
    for (const lang of LANGS) {
      out.push({
        url: abs(lang, pathSuffix),
        lastModified: lastMod,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: alts(pathSuffix),
      });
    }
  }

  return out;
}

/** 供 `npm run generate-sitemap` 写本地/备份用 XML（与 app/sitemap 数据同源） */
export function serializeSitemapToLegacyUrlsetXml(entries: MetadataRoute.Sitemap): string {
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  let body = "";
  for (const e of entries) {
    const lastmod =
      e.lastModified != null
        ? `    <lastmod>${esc(new Date(e.lastModified).toISOString().split("T")[0])}</lastmod>\n`
        : "";
    const cf = e.changeFrequency ? `    <changefreq>${e.changeFrequency}</changefreq>\n` : "";
    const pr = e.priority != null ? `    <priority>${e.priority}</priority>\n` : "";
    let links = "";
    if (e.alternates?.languages) {
      for (const [hreflang, href] of Object.entries(e.alternates.languages)) {
        links += `    <xhtml:link rel="alternate" hreflang="${esc(hreflang)}" href="${esc(href)}" />\n`;
      }
    }
    body += `  <url>
    <loc>${esc(e.url)}</loc>
${links}${lastmod}${cf}${pr}  </url>
`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}</urlset>
`;
}

export { createSupabaseForSitemap, pathSegFromProperty, STATIC_PATHS, abs, LANGS };
