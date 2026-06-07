import type { Metadata } from "next";
import type { Post } from "@/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fightingspirit.kr";
const SITE_NAME = "AUCTORITAS LAB";
const SITE_DESCRIPTION =
  "공사대금·부동산·임대차 등 공간분쟁을 판례와 실무 기준으로 정리하는 법률 저널. 공간분쟁 전문 변호사팀이 직접 씁니다.";

export const defaultMetadata: Metadata = {
  title: {
    default: "공간을 둘러싼 분쟁, 법으로 풀어내다 — AUCTORITAS LAB",
    template: `%s — AUCTORITAS LAB`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "ko_KR",
    title: "공간을 둘러싼 분쟁, 법으로 풀어내다 — AUCTORITAS LAB",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
  alternates: { canonical: SITE_URL },
};

export function buildSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: "AUCTORITAS LAB",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    telephone: "+82-31-546-3997",
    faxNumber: "+82-31-546-3998",
    email: "info@fightingspirit.kr",
    areaServed: "KR",
    knowsAbout: ["공사대금", "부동산매매", "임대차", "재개발", "명도소송", "유치권"],
    address: {
      "@type": "PostalAddress",
      streetAddress: "광교중앙로 248번길 7-2 원희캐슬법조타운 B동 401호",
      addressLocality: "수원시 영통구",
      addressRegion: "경기도",
      addressCountry: "KR",
    },
    sameAs: ["https://fightingspirit.kr", "https://instagram.com/auctoritas_journal"],
  };
}

export function buildPostMetadata(post: Post): Metadata {
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.cover_image_url ? [post.cover_image_url] : [],
      locale: "ko_KR",
      siteName: SITE_NAME,
    },
    alternates: {
      canonical: `${SITE_URL}/posts/${post.slug}`,
    },
  };
}

export function buildPostJsonLd(post: Post) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt,
        image: post.cover_image_url,
        datePublished: post.published_at,
        dateModified: post.updated_at,
        inLanguage: "ko",
        articleSection: post.category?.name,
        keywords: post.tags?.map((t) => t.name).join(", "),
        author: post.author
          ? {
              "@type": "Person",
              name: post.author.name,
              worksFor: { "@type": "Organization", name: "AUCTORITAS LAB" },
            }
          : undefined,
        publisher: {
          "@type": "Organization",
          name: "AUCTORITAS LAB",
          url: SITE_URL,
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${SITE_URL}/posts/${post.slug}`,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
          post.category
            ? {
                "@type": "ListItem",
                position: 2,
                name: post.category.name,
                item: `${SITE_URL}/?cat=${post.category.slug}`,
              }
            : null,
          { "@type": "ListItem", position: 3, name: post.title },
        ].filter((x): x is NonNullable<typeof x> => x !== null),
      },
    ],
  };
}
