/**
 * 客户端 SEO：不在 React 外操作 <head> / <body>，避免与 Next 冲突（removeChild）。
 * 首屏 meta 由 app/[[...slug]]/generateMetadata 提供；这里仅补 SPA 内路由切换的标题与 JSON-LD。
 */
import { useLayoutEffect } from 'react';
import { useApp } from '@/contexts/AppContext';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  noIndex?: boolean;
  /** JSON-LD 结构化数据，在组件树内用 <script> 输出，不 appendChild 到 body */
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
}

export function SEOHead(props: SEOHeadProps) {
  const { title, structuredData } = props;
  const { language } = useApp();

  const finalTitle =
    title ||
    (language === 'zh' ? 'REAL REAL | 巴厘岛房产' : 'REAL REAL | Bali Property');

  const sig = [finalTitle, JSON.stringify(structuredData ?? null)].join('\0');

  useLayoutEffect(() => {
    if (typeof document === 'undefined') return;
    document.title = finalTitle;
  }, [finalTitle, sig]);

  if (!structuredData) {
    return null;
  }

  const jsonLd = JSON.stringify(
    Array.isArray(structuredData) ? structuredData : [structuredData]
  );

  return (
    <script
      type="application/ld+json"
      key={jsonLd.slice(0, 200)}
      suppressHydrationWarning
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}
