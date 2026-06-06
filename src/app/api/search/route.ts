import { NextRequest, NextResponse } from "next/server";
import { getPosts } from "@/lib/posts";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const query = searchParams.get("q") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const tag = searchParams.get("tag") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Math.min(Number(searchParams.get("pageSize") ?? "12"), 50);

  try {
    const result = await getPosts({ query, category, tag, page, pageSize });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "검색 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
