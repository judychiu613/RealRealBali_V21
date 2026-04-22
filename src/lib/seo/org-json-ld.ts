/** 全站组织 JSON-LD（与历史 SEOHead 中内容一致，供 layout 服务端输出） */
export const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "REAL REAL",
  alternateName: "Real Real Bali",
  description:
    "REAL REAL is a professional Bali real estate agency founded by Chinese entrepreneurs with deep local market expertise. We specialize in cross-border property investment for Chinese-speaking clients, offering transparent, efficient, and trustworthy property acquisition services in Bali, Indonesia. We partner with all leading local agencies and developers to provide comprehensive property listings, legal support via Indonesian-based Chinese lawyers, and financial advisory services.",
  url: "https://realrealbali.com",
  logo: "https://img.realrealbali.com/web/logo_narrow_50%20x%2050.png",
  image: "https://img.realrealbali.com/web/about1.jpg",
  email: "Hello@realrealbali.com",
  telephone: "+62 0813 3067 5465",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bali",
    addressCountry: "ID",
  },
  areaServed: {
    "@type": "Place",
    name: "Bali, Indonesia",
  },
  founder: [
    {
      "@type": "Person",
      name: "Judy Chiu",
      jobTitle: "Founder & CEO",
      image: "https://img.realrealbali.com/web/founderheadshot-judy.png",
    },
    {
      "@type": "Person",
      name: "Jacky Chiu",
      jobTitle: "Co-Founder",
      image: "https://img.realrealbali.com/web/founderheadshot-jacky.jpg",
    },
  ],
  knowsLanguage: ["zh", "en", "id"],
  serviceType: [
    "Property Sales",
    "Property Investment Consulting",
    "Cross-border Real Estate Services",
    "Legal & Tax Advisory for Property",
    "Freehold & Leasehold Property",
    "Villa Sales",
    "Land Sales",
  ],
  sameAs: "https://realrealbali.com",
} as const;
