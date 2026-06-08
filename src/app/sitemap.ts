import type { MetadataRoute } from "next";
import { getAllPostIds } from "@/lib/posts";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fightingspirit.kr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ids = await getAllPostIds();

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...ids.map((id) => ({
      url: `${SITE_URL}/posts/${id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
