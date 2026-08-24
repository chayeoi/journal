import { getAllPostSlugs } from '@/lib/posts';
import { getAllAuthorIdsUncached } from '@/lib/authors';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://journal.fightingspirit.kr';

// 시간 기반 revalidate(#54)와 태그 기반 revalidateTag/revalidatePath 웹훅(#60,
// #61)까지 프로덕션에서 반복적으로 정체되는 것을 실측해서(Vercel 엣지 캐시가
// 무효화 신호를 반영하지 않는 것으로 추정) 아예 캐시를 두지 않기로 결정.
// 트래픽이 낮은 라우트라 매 요청 새로 계산해도 비용이 크지 않다.
export const dynamic = 'force-dynamic';

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

interface Entry {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

function renderUrl(entry: Entry): string {
  return [
    '<url>',
    `<loc>${xmlEscape(entry.loc)}</loc>`,
    `<lastmod>${entry.lastmod}</lastmod>`,
    `<changefreq>${entry.changefreq}</changefreq>`,
    `<priority>${entry.priority}</priority>`,
    '</url>',
  ].join('');
}

export async function GET(): Promise<Response> {
  const [slugs, authorIds] = await Promise.all([
    getAllPostSlugs(),
    getAllAuthorIdsUncached(),
  ]);

  const now = new Date().toISOString();
  const entries: Entry[] = [
    { loc: SITE_URL, lastmod: now, changefreq: 'daily', priority: '1' },
    {
      loc: `${SITE_URL}/authors`,
      lastmod: now,
      changefreq: 'monthly',
      priority: '0.6',
    },
    ...authorIds.map(id => ({
      loc: `${SITE_URL}/authors/${id}`,
      lastmod: now,
      changefreq: 'weekly',
      priority: '0.7',
    })),
    ...slugs.map(({ post_number, updated_at }) => ({
      loc: `${SITE_URL}/posts/${post_number}`,
      lastmod: new Date(updated_at).toISOString(),
      changefreq: 'weekly',
      priority: '0.8',
    })),
  ];

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    entries.map(renderUrl).join('') +
    '</urlset>';

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
