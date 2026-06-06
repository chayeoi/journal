import { createClient } from "@/lib/supabase/server";
import type {
  Post,
  PostListItem,
  PostSearchParams,
  PaginatedResponse,
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
