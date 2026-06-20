import { type NextRequest, NextResponse } from 'next/server';
import { getPosts } from '@/lib/posts';

export const revalidate = 60;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(sp.get('page') ?? '1', 10));

  try {
    const result = await getPosts({
      category: sp.get('cat') ?? undefined,
      tag: sp.get('tag') ?? undefined,
      query: sp.get('q') ?? undefined,
      archive: sp.get('archive') ?? undefined,
      page,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error('[api/posts] error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 },
    );
  }
}
