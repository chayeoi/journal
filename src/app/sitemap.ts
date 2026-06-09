import type { MetadataRoute } from "next";
import { getAllPostNumbers } from "@/lib/posts";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fightingspirit.kr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const numbers = await getAllPostNumbers();

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...numbers.map((n) => ({
      url: `${SITE_URL}/posts/${n}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
