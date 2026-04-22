import type { Metadata } from "next";
import { supabase } from "@/integrations/supabase/client";
import {
  nextSearchParamsToQueryString,
  stripMarketingParamsFromSearch,
} from "@/lib/seo/search-params-seo";
import { DEFAULT_OG_IMAGE } from "@/lib/seo/site-config";

export const SITE_URL = "https://realrealbali.com";

type Lang = "zh" | "en";

type Parsed =
  | { kind: "root" }
  | { kind: "admin" }
  | { kind: "unknown"; path: string }
  | { kind: "localized"; lang: Lang; segments: string[] };

function parseSlug(slug: string[] | undefined): Parsed {
  if (!slug || slug.length === 0) return { kind: "root" };
  if (slug[0] === "admin") return { kind: "admin" };
  if (slug[0] === "zh" || slug[0] === "en") {
    return { kind: "localized", lang: slug[0], segments: slug.slice(1) };
  }
  return { kind: "unknown", path: `/${slug.join("/")}` };
}

function pathWoLang(segments: string[]): string {
  if (segments.length === 0) return "";
  return `/${segments.join("/")}`;
}

function buildAlternates(
  lang: Lang,
  pathWo: string,
  searchClean: string
): NonNullable<Metadata["alternates"]> {
  const zh = `${SITE_URL}/zh${pathWo}${searchClean}`;
  const en = `${SITE_URL}/en${pathWo}${searchClean}`;
  const self = lang === "zh" ? zh : en;
  return {
    canonical: self,
    languages: {
      "zh-CN": zh,
      "en-US": en,
      "x-default": `${SITE_URL}/zh${pathWo}${searchClean}`,
    },
  };
}

function ogLocale(lang: Lang): string {
  return lang === "zh" ? "zh_CN" : "en_US";
}

function toAbsoluteImage(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("//")) return `https:${url}`;
  return `${SITE_URL.replace(/\/$/, "")}${url.startsWith("/") ? "" : "/"}${url}`;
}

async function fetchPropertyMetadata(slugOrId: string, lang: Lang) {
  const { data: bySlug } = await supabase
    .from("properties")
    .select("title_zh, title_en, description_zh, description_en, image")
    .eq("slug", slugOrId)
    .maybeSingle();

  const row =
    bySlug ||
    (
      await supabase
        .from("properties")
        .select("title_zh, title_en, description_zh, description_en, image")
        .eq("id", slugOrId)
        .maybeSingle()
    ).data;

  if (!row) return null;

  const title = lang === "zh" ? row.title_zh : row.title_en;
  const rawDesc = lang === "zh" ? row.description_zh : row.description_en;
  const description = (rawDesc || "").replace(/\s+/g, " ").trim().slice(0, 160);

  return {
    title: `${title || (lang === "zh" ? "房源" : "Property")} - REAL REAL`,
    description: description || (lang === "zh" ? "巴厘岛优质房源" : "Bali property listing"),
    image: toAbsoluteImage(row.image),
  };
}

async function fetchBlogMetadata(postSlug: string) {
  const { data } = await supabase
    .from("blog_posts")
    .select("title, seo_title, seo_description, cover_image")
    .eq("slug", postSlug)
    .eq("published", true)
    .maybeSingle();

  if (!data) return null;
  return {
    title: `${data.title} - REAL REAL`,
    description: data.seo_description || "",
    image: toAbsoluteImage(data.cover_image),
  };
}

function staticPageMeta(
  lang: Lang,
  key:
    | "home"
    | "properties"
    | "about"
    | "contact"
    | "blog"
    | "favorites"
    | "profile"
    | "login"
): { title: string; description: string; keywords?: string } {
  const m = {
    home: {
      zh: {
        title: "REAL REAL | 巴厘岛房产",
        description: "巴厘岛专业房产中介服务，提供别墅、土地等优质房产资源",
        keywords: "巴厘岛房产,巴厘岛别墅,巴厘岛投资,印尼房产",
      },
      en: {
        title: "REAL REAL | Bali Property",
        description:
          "Professional Bali property agency offering villas, land and premium properties",
        keywords: "Bali property,Bali villa,Bali investment,Indonesia real estate",
      },
    },
    properties: {
      zh: {
        title: "巴厘岛房产 | 精选房源 - REAL REAL",
        description: "浏览巴厘岛精选房产，包括别墅、土地等优质投资项目",
        keywords: "巴厘岛房产列表,巴厘岛别墅出售,巴厘岛土地,房产投资",
      },
      en: {
        title: "Bali Properties | Featured Listings - REAL REAL",
        description:
          "Browse featured Bali properties including villas, land and premium investment opportunities",
        keywords: "Bali property listings,Bali villa for sale,Bali land,property investment",
      },
    },
    about: {
      zh: {
        title: "关于我们 - REAL REAL",
        description: "了解 REAL REAL，巴厘岛专业房产中介团队，为您提供优质的房产投资服务",
      },
      en: {
        title: "About Us - REAL REAL",
        description:
          "Learn about REAL REAL, professional Bali property agency team providing quality investment services",
      },
    },
    contact: {
      zh: {
        title: "联系我们 - REAL REAL",
        description: "联系 REAL REAL 巴厘岛房产中介，获取专业的房产咨询服务",
      },
      en: {
        title: "Contact Us - REAL REAL",
        description: "Contact REAL REAL Bali property agency for professional property consultation",
      },
    },
    blog: {
      zh: {
        title: "博客 - REAL REAL",
        description: "阅读巴厘岛房产投资指南、市场分析和专业建议",
      },
      en: {
        title: "Blog - REAL REAL",
        description: "Read Bali property investment guides, market analysis and professional advice",
      },
    },
    favorites: {
      zh: { title: "我的收藏 - REAL REAL", description: "您收藏的巴厘岛房源" },
      en: { title: "My Favorites - REAL REAL", description: "Your saved Bali properties" },
    },
    profile: {
      zh: { title: "个人中心 - REAL REAL", description: "账户与偏好设置" },
      en: { title: "Profile - REAL REAL", description: "Account and preferences" },
    },
    login: {
      zh: { title: "登录 - REAL REAL", description: "登录 REAL REAL" },
      en: { title: "Sign in - REAL REAL", description: "Sign in to REAL REAL" },
    },
  } as const;
  const k = m[key][lang];
  return { ...k, keywords: "keywords" in k ? (k as { keywords: string }).keywords : undefined };
}

function baseMetadata(
  input: {
    title: string;
    description: string;
    lang: Lang;
    pathWo: string;
    searchClean: string;
    image?: string;
    type?: "website" | "article" | "product";
    robots?: Metadata["robots"];
    keywords?: string;
  }
): Metadata {
  const { title, description, lang, pathWo, searchClean, image, type, robots, keywords } = input;
  const url = (lang === "zh" ? `${SITE_URL}/zh` : `${SITE_URL}/en`) + pathWo + searchClean;
  const absImage = toAbsoluteImage(image);
  return {
    metadataBase: new URL(SITE_URL),
    title: { absolute: title },
    description,
    keywords: keywords ? keywords : undefined,
    alternates: buildAlternates(lang, pathWo, searchClean),
    robots: robots ?? { index: true, follow: true },
    openGraph: {
      type: type === "product" ? "website" : type ?? "website",
      url,
      siteName: "REAL REAL",
      title,
      description,
      locale: ogLocale(lang),
      alternateLocale: [lang === "zh" ? "en_US" : "zh_CN"],
      images: absImage ? [{ url: absImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: absImage ? [absImage] : undefined,
    },
  };
}

export async function buildMetadataForSlug(
  slug: string[] | undefined,
  searchParams: { [key: string]: string | string[] | undefined } | undefined
): Promise<Metadata> {
  const rawQ = nextSearchParamsToQueryString(searchParams);
  const searchClean = stripMarketingParamsFromSearch(rawQ);
  const parsed = parseSlug(slug);

  if (parsed.kind === "root") {
    const title = "REAL REAL | 巴厘岛房产";
    const description = "REAL REAL - 巴厘岛精选房产与土地投资平台";
    return {
      metadataBase: new URL(SITE_URL),
      title: { absolute: title },
      description,
      alternates: {
        canonical: `${SITE_URL}/`,
        languages: {
          "zh-CN": `${SITE_URL}/zh`,
          "en-US": `${SITE_URL}/en`,
          "x-default": `${SITE_URL}/zh`,
        },
      },
      openGraph: {
        type: "website",
        url: `${SITE_URL}/`,
        siteName: "REAL REAL",
        title,
        description,
        locale: "zh_CN",
        alternateLocale: ["en_US"],
        images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "REAL REAL Bali" }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [DEFAULT_OG_IMAGE],
      },
    };
  }

  if (parsed.kind === "admin") {
    return {
      metadataBase: new URL(SITE_URL),
      title: { absolute: "REAL REAL Admin" },
      description: "Administration",
      robots: { index: false, follow: false },
    };
  }

  if (parsed.kind === "unknown") {
    return {
      metadataBase: new URL(SITE_URL),
      title: { absolute: "REAL REAL" },
      description: "REAL REAL - Bali property",
      robots: { index: false, follow: false },
    };
  }

  const { lang, segments } = parsed;
  const pathWo = pathWoLang(segments);
  const segs = segments;

  if (segs.length === 0) {
    const s = staticPageMeta(lang, "home");
    return baseMetadata({ ...s, lang, pathWo, searchClean });
  }

  if (segs[0] === "properties" && segs.length === 1) {
    const s = staticPageMeta(lang, "properties");
    return baseMetadata({ ...s, lang, pathWo, searchClean });
  }

  if (segs[0] === "about" && segs.length === 1) {
    const s = staticPageMeta(lang, "about");
    return baseMetadata({ ...s, lang, pathWo, searchClean });
  }

  if (segs[0] === "contact" && segs.length === 1) {
    const s = staticPageMeta(lang, "contact");
    return baseMetadata({ ...s, lang, pathWo, searchClean });
  }

  if (segs[0] === "favorites" && segs.length === 1) {
    const s = staticPageMeta(lang, "favorites");
    return baseMetadata({
      ...s,
      lang,
      pathWo,
      searchClean,
      robots: { index: false, follow: false },
    });
  }

  if (segs[0] === "profile" && segs.length === 1) {
    const s = staticPageMeta(lang, "profile");
    return baseMetadata({
      ...s,
      lang,
      pathWo,
      searchClean,
      robots: { index: false, follow: false },
    });
  }

  if (segs[0] === "login" && segs.length === 1) {
    const s = staticPageMeta(lang, "login");
    return baseMetadata({
      ...s,
      lang,
      pathWo,
      searchClean,
      robots: { index: false, follow: false },
    });
  }

  if (segs[0] === "blog" && segs.length === 1) {
    const s = staticPageMeta(lang, "blog");
    return baseMetadata({ ...s, lang, pathWo, searchClean, type: "website" });
  }

  if (segs[0] === "blog" && segs.length === 2) {
    const postSlug = segs[1]!;
    const blog = await fetchBlogMetadata(postSlug);
    if (blog) {
      return baseMetadata({
        title: blog.title,
        description: blog.description,
        lang,
        pathWo,
        searchClean,
        image: blog.image,
        type: "article",
      });
    }
    return baseMetadata({
      title: lang === "zh" ? "博客 - REAL REAL" : "Blog - REAL REAL",
      description: "REAL REAL Blog",
      lang,
      pathWo,
      searchClean,
    });
  }

  if (segs[0] === "property" && segs.length === 2) {
    const idOrSlug = segs[1]!;
    const pm = await fetchPropertyMetadata(idOrSlug, lang);
    if (pm) {
      return baseMetadata({
        title: pm.title,
        description: pm.description,
        lang,
        pathWo,
        searchClean,
        image: pm.image,
        type: "product",
      });
    }
    return baseMetadata({
      title: lang === "zh" ? "房源详情 - REAL REAL" : "Property Details - REAL REAL",
      description: lang === "zh" ? "巴厘岛房源" : "Bali property",
      lang,
      pathWo,
      searchClean,
    });
  }

  return {
    metadataBase: new URL(SITE_URL),
    title: { absolute: "REAL REAL" },
    description: "REAL REAL - Bali property",
    alternates: buildAlternates(lang, pathWo, searchClean),
    robots: { index: false, follow: false },
  };
}
