import { getAllPostSlugs } from '@/lib/posts';
import { getAllAuthorIds } from '@/lib/authors';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://journal.fightingspirit.kr';

// 메타데이터 라우트(app/sitemap.ts)의 `revalidate`가 프로덕션에서 적용되지 않아
// 사이트맵이 배포 시점에 동결되는 문제(#53 수정 이후에도 lastmod 미갱신 실측,
// 2026-07-12 WO 검색대상성 리페어)로 라우트 핸들러로 전환.
// 라우트 핸들러의 ISR 은 안정적으로 동작한다 — 매일 새 글이 배포 없이 노출된다.
export const revalidate = 300;

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
    getAllAuthorIds(),
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
