import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

// sitemap.xml은 force-dynamic이라 캐시가 없어 이 웹훅과 무관하게 항상
// 최신 상태다. 이 라우트는 홈/카테고리/아카이브/추천글/저자 목록 등
// unstable_cache(tags: ['posts'])로 캐시된 나머지 페이지들을 위한 것이다.
export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = req.headers.get('x-revalidate-secret');

  if (
    !process.env.REVALIDATE_SECRET ||
    secret !== process.env.REVALIDATE_SECRET
  ) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // DB 웹훅이 매 write마다 호출하므로, 다음 요청에서 stale 응답을 한 번 더
  // 서빙하는 'max' 프로필 대신 즉시 만료(expire: 0)로 강제한다.
  revalidateTag('posts', { expire: 0 });

  return NextResponse.json({ revalidated: true, tag: 'posts' });
}
