import type { MetadataRoute } from "next";
import { getSitemapEntriesForNext } from "@/lib/seo/sitemap-data";

/** 每次请求拉取 Supabase，新房源/slug 无需重新部署即可出现在 sitemap（Vercel 轻量接口可接受） */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getSitemapEntriesForNext();
}
