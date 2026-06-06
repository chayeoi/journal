import type { Metadata } from "next";
import type { Post } from "@/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "법무법인 저널";
const SITE_DESCRIPTION =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ?? "법률 전문가의 인사이트";

export function buildPostMetadata(post: Post): Metadata {
  const url = `${SITE_URL}/posts/${post.slug}`;
  const image = post.cover_image_url ?? `${SITE_URL}/og-default.png`;

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.excerpt ?? undefined,
      images: [{ url: image }],
      siteName: SITE_NAME,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      authors: post.author ? [post.author.name] : undefined,
      section: post.category?.name,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt ?? undefined,
      images: [image],
    },
    alternates: { canonical: url },
  };
}

export function buildPostJsonLd(post: Post) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.cover_image_url,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: post.author
      ? { "@type": "Person", name: post.author.name }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/posts/${post.slug}` },
    keywords: post.tags?.map((t) => t.name).join(", "),
    articleSection: post.category?.name,
  };
}

export const defaultMetadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "ko_KR",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};
