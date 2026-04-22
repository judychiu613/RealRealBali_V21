import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * 供根 layout 设置 <html lang>，与 /zh、/en 及首页默认语言一致，利于 SEO 与可访问性。
 * 与 build-metadata 中 alternates 的 x-default（中文）一致。
 */
function htmlLangFromPathname(pathname: string): string {
  if (pathname === "/" || pathname === "") return "zh-Hans";
  if (pathname.startsWith("/zh")) return "zh-Hans";
  if (pathname.startsWith("/en")) return "en";
  if (pathname.startsWith("/admin")) return "en";
  return "en";
}

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-rr-html-lang", htmlLangFromPathname(request.nextUrl.pathname));
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    // 排除 _next 与常见静态直出资源；含扩展名的 public 资源通常不走页面 HTML，保守排除 xml/txt/ico
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt).*)",
    "/",
  ],
};
