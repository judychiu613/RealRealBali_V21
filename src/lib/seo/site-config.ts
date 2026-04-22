/** 全站与 organization JSON-LD 共用的默认 OG 图（绝对 URL） */
export const DEFAULT_OG_IMAGE = "https://img.realrealbali.com/web/about1.jpg";

const DEFAULT_SITE = "https://realrealbali.com";

/**
 * 对外站点 origin（sitemap、canonical 等），无尾斜杠。
 * Vercel 可设 NEXT_PUBLIC_SITE_URL 覆盖主域；未设则默认正式域。
 */
export function getPublicSiteUrl(): string {
  const u = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (u) return u.replace(/\/$/, "");
  return DEFAULT_SITE;
}
