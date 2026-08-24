import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

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
