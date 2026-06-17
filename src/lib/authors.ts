import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createStaticClient } from "@/lib/supabase/static";
import type { AuthorListItem, AuthorDetail, PostListItem, Profile } from "@/types";

const POST_LIST_FIELDS =
  "id, post_number, title, thumbnail_url, author_id, category, published_at, created_at, tags, excerpt, reading_minutes";

const AUTHOR_PROFILE_FIELDS = "id, display_name, bio, avatar_url";

function mapToListItem(
  p: Record<string, unknown>,
  author?: Pick<Profile, "id" | "display_name" | "avatar_url">,
): PostListItem {
  return {
    id: p.id as string,
    post_number: p.post_number as number,
    title: p.title as string,
    thumbnail_url: (p.thumbnail_url as string | null) ?? null,
    author_id: (p.author_id as string | null) ?? null,
    category: (p.category as string | null) ?? null,
    published_at: (p.published_at as string | null) ?? null,
    created_at: p.created_at as string,
    tags: (p.tags as string[]) ?? [],
    excerpt: (p.excerpt as string | null) ?? null,
    reading_minutes: (p.reading_minutes as number | null) ?? null,
    author,
  };
}

/**
 * /authors — 발행 글이 있는 모든 저자(이름 + 간략 소개).
 * 집필 수 → 이름(가나다) 정렬. 집필 수는 정렬에만 쓰고 노출하지 않는다.
 */
export const getAuthors = unstable_cache(
  async (): Promise<AuthorListItem[]> => {
    const supabase = createStaticClient();

    const { data: posts, error } = await supabase
      .from("posts")
      .select("author_id")
      .eq("is_visible", true)
      .not("author_id", "is", null);

    if (error || !posts?.length) return [];

    const countByAuthor = new Map<string, number>();
    for (const p of posts) {
      const id = p.author_id as string;
      countByAuthor.set(id, (countByAuthor.get(id) ?? 0) + 1);
    }

    const authorIds = [...countByAuthor.keys()];
    if (!authorIds.length) return [];

    const { data: profiles } = await supabase
      .from("profiles")
      .select(AUTHOR_PROFILE_FIELDS)
      .in("id", authorIds);

    const list: AuthorListItem[] = (profiles ?? []).map((p) => ({
      id: p.id as string,
      display_name: p.display_name as string,
      bio: (p.bio as string | null) ?? null,
      avatar_url: (p.avatar_url as string | null) ?? null,
    }));

    list.sort((a, b) => {
      const c = (countByAuthor.get(b.id) ?? 0) - (countByAuthor.get(a.id) ?? 0);
      if (c) return c;
      return a.display_name.localeCompare(b.display_name, "ko");
    });

    return list;
  },
  ["authors"],
  { revalidate: 300 },
);

/** /authors/{id} — 단일 저자 프로필 + 담당 글 목록 + 집필 수. */
export const getAuthorById = cache(async function getAuthorById(
  id: string,
): Promise<AuthorDetail | null> {
  const supabase = createStaticClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(AUTHOR_PROFILE_FIELDS)
    .eq("id", id)
    .single();

  if (error || !profile) return null;

  const { data: rows } = await supabase
    .from("posts")
    .select(POST_LIST_FIELDS)
    .eq("is_visible", true)
    .eq("author_id", id)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const authorMini = {
    id: profile.id as string,
    display_name: profile.display_name as string,
    avatar_url: (profile.avatar_url as string | null) ?? null,
  };

  const posts: PostListItem[] = (rows ?? []).map((p) =>
    mapToListItem(p as Record<string, unknown>, authorMini),
  );

  return {
    id: profile.id as string,
    display_name: profile.display_name as string,
    bio: (profile.bio as string | null) ?? null,
    avatar_url: (profile.avatar_url as string | null) ?? null,
    post_count: posts.length,
    posts,
  };
});

/** 발행 글이 있는 저자 id 목록 — generateStaticParams / sitemap 용. */
export async function getAllAuthorIds(): Promise<string[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("posts")
    .select("author_id")
    .eq("is_visible", true)
    .not("author_id", "is", null);

  if (error) return [];
  return [...new Set((data ?? []).map((p) => p.author_id as string))];
}
