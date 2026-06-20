import { NextResponse } from 'next/server';
import { getPosts } from '@/lib/posts';

export async function GET() {
  try {
    const { posts, total } = await getPosts();
    return NextResponse.json({ data: posts, total });
  } catch {
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
