import type { MetadataRoute } from "next";
import { getAllPostNumbers } from "@/lib/posts";
import { getAllAuthorIds } from "@/lib/authors";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fightingspirit.kr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [numbers, authorIds] = await Promise.all([
    getAllPostNumbers(),
    getAllAuthorIds(),
  ]);

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/authors`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...authorIds.map((id) => ({
      url: `${SITE_URL}/authors/${id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...numbers.map((n) => ({
      url: `${SITE_URL}/posts/${n}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
