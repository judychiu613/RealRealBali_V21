import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import "@/index.css";
import { ORGANIZATION_JSON_LD } from "@/lib/seo/org-json-ld";
import { DEFAULT_OG_IMAGE } from "@/lib/seo/site-config";

/** 首屏兜底；各路径在 app/[[...slug]]/generateMetadata 中覆盖为与页面一致 */
export const metadata: Metadata = {
  metadataBase: new URL("https://realrealbali.com"),
  title: "REAL REAL | 巴厘岛房产",
  description: "REAL REAL - 巴厘岛精选房产与土地投资平台",
  authors: [{ name: "REAL REAL" }],
  publisher: "REAL REAL",
  openGraph: {
    siteName: "REAL REAL",
    title: "REAL REAL | 巴厘岛房产",
    description: "REAL REAL - 巴厘岛精选房产与土地投资平台",
    type: "website",
    locale: "zh_CN",
    url: "https://realrealbali.com/",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "REAL REAL Bali" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "REAL REAL | 巴厘岛房产",
    description: "REAL REAL - 巴厘岛精选房产与土地投资平台",
    images: [DEFAULT_OG_IMAGE],
  },
  icons: {
    icon: "https://img.realrealbali.com/web/logo_narrow_50%20x%2050.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const h = await headers();
  const htmlLang = h.get("x-rr-html-lang") ?? "zh-Hans";
  return (
    <html lang={htmlLang} suppressHydrationWarning>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(ORGANIZATION_JSON_LD),
          }}
        />
        {children}
      </body>
    </html>
  );
}
