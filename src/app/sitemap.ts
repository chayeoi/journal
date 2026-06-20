import type { MetadataRoute } from 'next';
import { getAllPostSlugs } from '@/lib/posts';
import { getAllAuthorIds } from '@/lib/authors';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://journal.fightingspirit.kr';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, authorIds] = await Promise.all([
    getAllPostSlugs(),
    getAllAuthorIds(),
  ]);

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/authors`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...authorIds.map(id => ({
      url: `${SITE_URL}/authors/${id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...slugs.map(
      ({
        post_number,
        updated_at,
      }: {
        post_number: number;
        updated_at: string;
      }) => ({
        url: `${SITE_URL}/posts/${post_number}`,
        lastModified: new Date(updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }),
    ),
  ];
}
