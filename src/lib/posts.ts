import { createClient } from "@/lib/supabase/server";
import { createStaticClient } from "@/lib/supabase/static";
import type {
  Post,
  PostListItem,
  PostsResult,
  CategoryCount,
  ArchiveDate,
  PostSearchParams,
  Profile,
} from "@/types";
import { CATEGORY_ORDER } from "@/types";

const PAGE_SIZE = 50;

const POST_LIST_FIELDS =
  "id, title, thumbnail_url, author_id, category, published_at, created_at, tags, excerpt, reading_minutes";

async function fetchAuthors(
  supabase: Awaited<ReturnType<typeof createClient>>,
  authorIds: string[],
): Promise<Map<string, Pick<Profile, "id" | "display_name" | "avatar_url">>> {
  const map = new Map<string, Pick<Profile, "id" | "display_name" | "avatar_url">>();
  if (!authorIds.length) return map;
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", authorIds);
  data?.forEach((p) => map.set(p.id, p));
  return map;
}

function mapToListItem(
  p: Record<string, unknown>,
  profilesMap: Map<string, Pick<Profile, "id" | "display_name" | "avatar_url">>,
): PostListItem {
  const authorId = p.author_id as string | null;
  return {
    id: p.id as string,
    title: p.title as string,
    thumbnail_url: (p.thumbnail_url as string | null) ?? null,
    author_id: authorId,
    category: (p.category as string | null) ?? null,
    published_at: (p.published_at as string | null) ?? null,
    created_at: p.created_at as string,
    tags: (p.tags as string[]) ?? [],
    excerpt: (p.excerpt as string | null) ?? null,
    reading_minutes: (p.reading_minutes as number | null) ?? null,
    author: authorId ? profilesMap.get(authorId) : undefined,
  };
}

export async function getPosts(params: PostSearchParams = {}): Promise<PostsResult> {
  const supabase = await createClient();
  const { query, category, tag, archive, page = 1 } = params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = supabase
    .from("posts")
    .select(POST_LIST_FIELDS, { count: "exact" })
    .eq("is_visible", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (category) q = q.eq("category", category);
  if (tag) q = q.contains("tags", [tag]);
  if (query) {
    const esc = query.replace(/[%_\\]/g, "\\$&");
    q = q.or(`title.ilike.%${esc}%,excerpt.ilike.%${esc}%`);
  }
  if (archive) {
    const [y, m] = archive.split("-");
    const first = `${y}-${m.padStart(2, "0")}-01`;
    const lastDate = new Date(parseInt(y), parseInt(m), 0);
    const last = `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, "0")}-${String(lastDate.getDate()).padStart(2, "0")}T23:59:59Z`;
    q = q.gte("published_at", first).lte("published_at", last);
  }

  const from = (page - 1) * PAGE_SIZE;
  q = q.range(from, from + PAGE_SIZE - 1);

  const { data, count, error } = await q;
  if (error) throw error;

  const rows = (data ?? []) as Record<string, unknown>[];
  const authorIds = [...new Set(rows.map((p) => p.author_id as string | null).filter(Boolean))] as string[];
  const profilesMap = await fetchAuthors(supabase, authorIds);

  const total = count ?? 0;
  const posts = rows.map((p) => mapToListItem(p, profilesMap));

  return { posts, total, hasMore: from + posts.length < total };
}

export async function getCategoryCounts(): Promise<CategoryCount[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("category")
    .eq("is_visible", true);

  if (error) return [];

  const counts = new Map<string, number>();
  let total = 0;
  (data ?? []).forEach((p) => {
    total++;
    if (p.category) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  });

  const byCategory: CategoryCount[] = CATEGORY_ORDER
    .filter((c) => counts.has(c))
    .map((c) => ({ category: c, count: counts.get(c)! }));

  return [{ category: "all", count: total }, ...byCategory];
}

export async function getArchiveDates(): Promise<ArchiveDate[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("published_at")
    .eq("is_visible", true)
    .not("published_at", "is", null);

  if (error) return [];

  const counts = new Map<string, number>();
  (data ?? []).forEach((p) => {
    if (p.published_at) {
      const key = p.published_at.slice(0, 7);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  });

  return Array.from(counts.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, count]) => {
      const [y, mo] = key.split("-");
      return { key, label: `${y}년 ${parseInt(mo)}월`, count };
    });
}

export async function getFeaturedPosts(): Promise<PostListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_LIST_FIELDS)
    .eq("is_visible", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) return [];

  const rows = (data ?? []) as Record<string, unknown>[];
  const authorIds = [...new Set(rows.map((p) => p.author_id as string | null).filter(Boolean))] as string[];
  const profilesMap = await fetchAuthors(supabase, authorIds);

  return rows.map((p) => mapToListItem(p, profilesMap));
}

export async function getRelatedPosts(
  postId: string,
  tags: string[],
  authorId: string | null,
  category: string | null,
  limit = 3,
): Promise<PostListItem[]> {
  const supabase = await createClient();

  // 태그 겹침 OR 같은 카테고리인 후보 수집
  const orParts: string[] = [];
  if (tags.length > 0) orParts.push(`tags.ov.{${tags.join(",")}}`);
  if (category) orParts.push(`category.eq.${category}`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = supabase
    .from("posts")
    .select(POST_LIST_FIELDS)
    .eq("is_visible", true)
    .neq("id", postId)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(20);

  if (orParts.length > 0) q = q.or(orParts.join(","));

  const { data, error } = await q;
  if (error || !data?.length) return [];

  const rows = (data ?? []) as Record<string, unknown>[];
  const currentTagSet = new Set(tags);

  const scored = rows.map((p) => {
    let score = 0;
    if (authorId && p.author_id === authorId) score += 1;
    if (category && p.category === category) score += 2;
    score += ((p.tags as string[]) ?? []).filter((t) => currentTagSet.has(t)).length * 2;
    return { p, score };
  });
  scored.sort((a, b) => b.score - a.score);

  const top = scored.slice(0, limit).map((x) => x.p);
  const authorIds = [...new Set(top.map((p) => p.author_id as string | null).filter(Boolean))] as string[];
  const profilesMap = await fetchAuthors(supabase, authorIds);

  return top.map((p) => mapToListItem(p, profilesMap));
}

export async function getPostById(id: string): Promise<Post | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .eq("is_visible", true)
    .single();

  if (error || !data) return null;

  let author: Profile | undefined;
  if (data.author_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, display_name, bio, avatar_url")
      .eq("id", data.author_id)
      .single();
    if (profile) author = profile as Profile;
  }

  return { ...data, tags: data.tags ?? [], author } as Post;
}

// 빌드 타임 / sitemap 용 — 쿠키 없이 호출
export async function getAllPostIds(): Promise<string[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id")
    .eq("is_visible", true);

  if (error) return [];
  return (data ?? []).map((p) => p.id);
}
