import { createClient } from "@/lib/supabase/server";
import type {
  Post,
  PostListItem,
  PostSearchParams,
  PaginatedResponse,
  Category,
} from "@/types";

const DEFAULT_PAGE_SIZE = 12;

export async function getPosts(
  params: PostSearchParams = {},
): Promise<PaginatedResponse<PostListItem>> {
  const supabase = await createClient();
  const {
    query,
    category,
    tag,
    author,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    year,
    month,
  } = params;

  let queryBuilder = supabase
    .from("posts")
    .select(
      `
      id, slug, title, excerpt, cover_image_url, published_at, created_at,
      author:authors(id, name, avatar_url),
      category:categories(id, name, slug),
      tags(id, name, slug)
    `,
      { count: "exact" },
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (query) {
    queryBuilder = queryBuilder.textSearch("fts", query);
  }
  if (category) {
    queryBuilder = queryBuilder.eq("categories.slug", category);
  }
  if (tag) {
    queryBuilder = queryBuilder.eq("tags.slug", tag);
  }
  if (author) {
    queryBuilder = queryBuilder.eq("authors.id", author);
  }
  if (year) {
    const start = new Date(year, (month ?? 1) - 1, 1).toISOString();
    const end = month
      ? new Date(year, month, 0, 23, 59, 59).toISOString()
      : new Date(year + 1, 0, 0, 23, 59, 59).toISOString();
    queryBuilder = queryBuilder
      .gte("published_at", start)
      .lte("published_at", end);
  }

  const from = (page - 1) * pageSize;
  queryBuilder = queryBuilder.range(from, from + pageSize - 1);

  const { data, error, count } = await queryBuilder;

  if (error) throw error;

  const total = count ?? 0;
  return {
    data: (data ?? []) as unknown as PostListItem[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      author:authors(*),
      category:categories(*),
      tags(*)
    `,
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) return null;
  return data as unknown as Post;
}

export async function getRelatedPosts(
  postId: string,
  categoryId: string | null,
  limit = 3,
): Promise<PostListItem[]> {
  const supabase = await createClient();

  let queryBuilder = supabase
    .from("posts")
    .select(
      `
      id, slug, title, excerpt, cover_image_url, published_at, created_at,
      author:authors(id, name, avatar_url),
      category:categories(id, name, slug),
      tags(id, name, slug)
    `,
    )
    .eq("status", "published")
    .neq("id", postId)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (categoryId) {
    queryBuilder = queryBuilder.eq("category_id", categoryId);
  }

  const { data, error } = await queryBuilder;

  if (error) return [];
  return (data ?? []) as unknown as PostListItem[];
}

export async function getAllPostSlugs(): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("slug")
    .eq("status", "published");

  if (error) return [];
  return (data ?? []).map((p) => p.slug);
}

// 모든 발행된 포스트 (홈 클라이언트 필터링용)
export async function getAllPosts(): Promise<PostListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(
      `id, slug, title, excerpt, cover_image_url, published_at, created_at,
       author:authors(id, name, avatar_url),
       category:categories(id, name, slug),
       tags(id, name, slug)`,
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as PostListItem[];
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .order("name");
  if (error) throw error;
  return (data ?? []) as Category[];
}

// 관련 포스트 스코어링: 같은 카테고리 +3 / 같은 저자 +1 / 공유 태그당 +2
export function scoreRelatedPosts(
  current: Post,
  candidates: PostListItem[],
  limit = 3,
): PostListItem[] {
  const currentTagSlugs = current.tags?.map((t) => t.slug) ?? [];

  const scored = candidates
    .filter((p) => p.id !== current.id)
    .map((p) => {
      let score = 0;
      if (p.category?.id === current.category_id) score += 3;
      if (p.author?.id === current.author_id) score += 1;
      const pTagSlugs = p.tags?.map((t) => t.slug) ?? [];
      score += pTagSlugs.filter((t) => currentTagSlugs.includes(t)).length * 2;
      return { p, score };
    });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const da = a.p.published_at ?? a.p.created_at;
    const db = b.p.published_at ?? b.p.created_at;
    return db.localeCompare(da);
  });

  return scored.slice(0, limit).map((x) => x.p);
}
