import fs from "fs";
import path from "path";
import {
  getSitemapEntriesForNext,
  createSupabaseForSitemap,
  serializeSitemapToLegacyUrlsetXml,
} from "../src/lib/seo/sitemap-data";
import { getPublicSiteUrl } from "../src/lib/seo/site-config";

// 与 app/sitemap 同源；本地/CI 可选运行，导出不放进 public/，避免与动态 /sitemap.xml 冲突
try {
  const { config } = await import("dotenv");
  config();
} catch {
  /* ok */
}

async function main() {
  const site = getPublicSiteUrl();
  console.log("Site URL:", site);
  const entries = await getSitemapEntriesForNext(createSupabaseForSitemap());
  const xml = serializeSitemapToLegacyUrlsetXml(entries);
  const outPath = path.join(process.cwd(), "sitemap.static-export.xml");
  fs.writeFileSync(outPath, xml, "utf-8");
  console.log("✅ 已写入", outPath, "（Vercel 上请以线上 /sitemap.xml 为准，由 app/sitemap.ts 动态生成）");
  console.log("   条目数:", entries.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
