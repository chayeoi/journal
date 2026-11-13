import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { createStaticClient } from '@/lib/supabase/static';
import { throwQueryError } from '@/lib/supabase/errors';
import type {
  Post,
  PostListItem,
  PostsResult,
  CategoryCount,
  ArchiveDate,
  PostSearchParams,
  Profile,
} from '@/types';
import { CATEGORY_ORDER } from '@/types';

const PAGE_SIZE = 50;
const SITEMAP_PAGE_SIZE = 1000;

// 글 쓰기·수정은 DB 웹훅(/api/revalidate → revalidateTag('posts'))이 즉시 반영한다.
// 시간 기반 재검증은 웹훅이 누락됐을 때의 안전망이라 1시간으로 둔다(이전 60초).
// 라우트 세그먼트의 `export const revalidate`는 리터럴만 허용되므로 페이지에는 3600을 직접 적는다.
export const POSTS_CACHE_SECONDS = 3600;

// 빌드 때 미리 만드는 글 상세 수. 나머지는 첫 방문 때 만들어 캐시한다(dynamicParams = true).
export const PRERENDER_POST_COUNT = 20;

const POST_LIST_FIELDS =
  'id, post_number, title, thumbnail_url, author_id, category, published_at, created_at, tags, excerpt, reading_minutes';

// 캐시 원칙
// - unstable_cache 안에서 부른 unstable_cache는 캐시를 건너뛴다(Next.js 동작). 그래서 작성자 캐시는
//   글 캐시 안에서 부르지 않고, 글 캐시 결과에 요청 시점에 붙인다(withAuthors). 그래야 모든 글 페이지가
//   작성자 캐시 하나를 공유한다.
// - 캐시 함수 안에서는 DB 오류를 던진다. 빈 결과가 1시간 동안 캐시되지 않게 하기 위해서다.
//   화면을 비워서라도 보여 줘야 하는 곳은 캐시 바깥에서 잡는다.

// 작성자 정보는 거의 바뀌지 않으므로 id 묶음 기준으로 캐시한다(글 상세·목록마다 profiles 재조회 방지).
const _cachedAuthorRows = unstable_cache(
  async (authorIds: string[]): Promise<Profile[]> => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, bio, avatar_url')
      .in('id', authorIds);
    if (error) throw error;
    return (data ?? []) as Profile[];
  },
  ['author-rows'],
  { revalidate: POSTS_CACHE_SECONDS, tags: ['posts', 'profiles'] },
);

async function fetchAuthors(
  authorIds: string[],
): Promise<Map<string, Profile>> {
  const map = new Map<string, Profile>();
  const ids = [...new Set(authorIds)].sort();
  if (!ids.length) return map;
  const rows = await _cachedAuthorRows(ids);
  rows.forEach(p => map.set(p.id, p));
  return map;
}

async function withAuthors(items: PostListItem[]): Promise<PostListItem[]> {
  const map = await fetchAuthors(
    items.map(p => p.author_id).filter((id): id is string => !!id),
  );
  return items.map(p => {
    const a = p.author_id ? map.get(p.author_id) : undefined;
    return {
      ...p,
      author: a
        ? { id: a.id, display_name: a.display_name, avatar_url: a.avatar_url }
        : undefined,
    };
  });
}

function mapToListItem(p: Record<string, unknown>): PostListItem {
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
  };
}

const _cachedGetPosts = unstable_cache(
  async (
    category: string,
    tag: string,
    query: string,
    archive: string,
    page: number,
    upToPage: number,
  ): Promise<PostsResult> => {
    const supabase = createStaticClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = supabase
      .from('posts')
      .select(POST_LIST_FIELDS, { count: 'exact' })
      .eq('is_visible', true)
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (category) q = q.eq('category', category);
    if (tag) q = q.contains('tags', [tag]);
    if (query) {
      const esc = query.replace(/[%_\\]/g, '\\$&');
      q = q.or(`title.ilike.%${esc}%,excerpt.ilike.%${esc}%`);
    }
    if (archive) {
      const [y, m] = archive.split('-');
      const first = `${y}-${m.padStart(2, '0')}-01`;
      const lastDate = new Date(parseInt(y), parseInt(m), 0);
      const last = `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, '0')}-${String(lastDate.getDate()).padStart(2, '0')}T23:59:59Z`;
      q = q.gte('published_at', first).lte('published_at', last);
    }

    // upToPage가 1보다 크면 1~upToPage 페이지 전체를 한 번에 가져옴 (뒤로 가기 상태 복원용)
    const from = upToPage > 1 ? 0 : (page - 1) * PAGE_SIZE;
    const to = upToPage > 1 ? upToPage * PAGE_SIZE - 1 : from + PAGE_SIZE - 1;
    q = q.range(from, to);

    const { data, count, error } = await q;
    if (error) throw error;

    const rows = (data ?? []) as Record<string, unknown>[];
    const total = count ?? 0;
    return { posts: rows.map(mapToListItem), total, hasMore: to + 1 < total };
  },
  ['posts-v2'],
  { revalidate: POSTS_CACHE_SECONDS, tags: ['posts'] },
);

export async function getPosts(
  params: PostSearchParams = {},
): Promise<PostsResult> {
  const {
    query = '',
    category = '',
    tag = '',
    archive = '',
    page = 1,
    upToPage = 0,
  } = params;
  // 같은 SQL 범위가 기본 목록과 첫 페이지 복원에서 별도 캐시로 쌓이지 않게 한다.
  const restoredPage = upToPage > 1 ? upToPage : 0;
  const effectivePage = restoredPage > 1 ? 1 : page;
  const result = await _cachedGetPosts(
    category,
    tag,
    query,
    archive,
    effectivePage,
    restoredPage,
  );
  return { ...result, posts: await withAuthors(result.posts) };
}

// 카테고리 개수·월별 아카이브를 한 번의 조회로 계산한다(이전: 같은 표를 두 번 읽음).
// React cache는 같은 렌더에서 동시에 시작한 두 호출도 합친다.
const _cachedPostFacets = unstable_cache(
  async (): Promise<{
    categories: CategoryCount[];
    archives: ArchiveDate[];
  }> => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from('posts')
      .select('category, published_at')
      .eq('is_visible', true);

    // DB 오류는 던져서 빈 집계가 캐시되지 않게 한다(바깥에서 빈 배열로 바꾼다).
    if (error) throw error;

    const categoryCounts = new Map<string, number>();
    const monthCounts = new Map<string, number>();
    for (const p of data ?? []) {
      if (p.category)
        categoryCounts.set(
          p.category,
          (categoryCounts.get(p.category) ?? 0) + 1,
        );
      if (p.published_at) {
        const key = p.published_at.slice(0, 7);
        monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1);
      }
    }

    const categories: CategoryCount[] = [
      { category: 'all', count: (data ?? []).length },
      ...CATEGORY_ORDER.filter(c => categoryCounts.has(c)).map(c => ({
        category: c,
        count: categoryCounts.get(c)!,
      })),
    ];
    const archives = Array.from(monthCounts.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, count]) => {
        const [y, mo] = key.split('-');
        return { key, label: `${y}년 ${parseInt(mo)}월`, count };
      });
    return { categories, archives };
  },
  ['post-facets'],
  { revalidate: POSTS_CACHE_SECONDS, tags: ['posts'] },
);

const getPostFacets = cache(async () => {
  try {
    return await _cachedPostFacets();
  } catch {
    return { categories: [], archives: [] };
  }
});

export async function getCategoryCounts(): Promise<CategoryCount[]> {
  return (await getPostFacets()).categories;
}

export async function getArchiveDates(): Promise<ArchiveDate[]> {
  return (await getPostFacets()).archives;
}

const _cachedFeaturedPosts = unstable_cache(
  async (): Promise<PostListItem[]> => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from('posts')
      .select(POST_LIST_FIELDS)
      .eq('is_visible', true)
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    return ((data ?? []) as Record<string, unknown>[]).map(mapToListItem);
  },
  ['featured-posts-v2'],
  { revalidate: POSTS_CACHE_SECONDS, tags: ['posts'] },
);

export async function getFeaturedPosts(): Promise<PostListItem[]> {
  try {
    return await withAuthors(await _cachedFeaturedPosts());
  } catch {
    return [];
  }
}

// 관련 글: 'posts' 태그로 캐시해 상세 페이지 재생성 때 재조회하지 않고, 글이 바뀌면 웹훅으로 함께 무효화한다.
const _cachedRelatedPosts = unstable_cache(
  async (
    postId: string,
    tags: string[],
    authorId: string | null,
    category: string | null,
    limit: number,
  ): Promise<PostListItem[]> => {
    const supabase = createStaticClient();

    const orParts: string[] = [];
    if (tags.length > 0) orParts.push(`tags.ov.{${tags.join(',')}}`);
    if (category) orParts.push(`category.eq.${category}`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = supabase
      .from('posts')
      .select(POST_LIST_FIELDS)
      .eq('is_visible', true)
      .neq('id', postId)
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(20);

    if (orParts.length > 0) q = q.or(orParts.join(','));

    const { data, error } = await q;
    if (error) throw error;
    if (!data?.length) return [];

    const rows = data as Record<string, unknown>[];
    const currentTagSet = new Set(tags);

    const scored = rows.map(p => {
      let score = 0;
      if (authorId && p.author_id === authorId) score += 1;
      if (category && p.category === category) score += 2;
      score +=
        ((p.tags as string[]) ?? []).filter(t => currentTagSet.has(t)).length *
        2;
      return { p, score };
    });
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map(x => mapToListItem(x.p));
  },
  ['related-posts'],
  { revalidate: POSTS_CACHE_SECONDS, tags: ['posts'] },
);

export async function getRelatedPosts(
  postId: string,
  tags: string[],
  authorId: string | null,
  category: string | null,
  limit = 3,
): Promise<PostListItem[]> {
  try {
    return await withAuthors(
      await _cachedRelatedPosts(postId, tags, authorId, category, limit),
    );
  } catch {
    // 관련 글 조회 실패는 본문 표시를 막지 않는다(실패 결과는 캐시되지 않음)
    return [];
  }
}

// 글 상세: 'posts' 태그로 캐시한다. 이 태그가 상세 페이지(ISR)에도 붙어서
// 웹훅의 revalidateTag('posts')가 상세 페이지까지 무효화한다(이전에는 태그가 없어 60초 주기에만 의존).
type PostRow = Omit<Post, 'author'>;

const _cachedPostByNumber = unstable_cache(
  async (postNumber: number): Promise<PostRow | null> => {
    const supabase = createStaticClient();

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('post_number', postNumber)
      .eq('is_visible', true)
      .maybeSingle();

    // maybeSingle: 행이 없으면 error 없이 data === null('없는 글'로 캐시).
    // 그 밖의 error는 일시적 DB 오류이므로 던져서 404(noindex)가 캐시되지 않게 한다(#71).
    if (error) throwQueryError(`posts/${postNumber}`, error);
    if (!data) return null;
    return { ...data, tags: data.tags ?? [] } as PostRow;
  },
  ['post-by-number'],
  { revalidate: POSTS_CACHE_SECONDS, tags: ['posts'] },
);

// React cache()로 같은 요청 안의 generateMetadata·페이지 중복 호출도 한 번으로 줄인다.
// DB 오류는 던진다: ISR 재생성 중이면 이전 페이지가 유지되고, 일시 장애가 '없는 글(404)'로 캐시되지 않는다.
export const getPostByNumber = cache(async function getPostByNumber(
  postNumber: number,
): Promise<Post | null> {
  // /posts/abc 같은 주소는 조회할 필요 없이 "없는 글"이다.
  if (!Number.isSafeInteger(postNumber) || postNumber <= 0) return null;
  const post = await _cachedPostByNumber(postNumber);
  if (!post) return null;
  const authors = await fetchAuthors(post.author_id ? [post.author_id] : []);
  const author = post.author_id ? authors.get(post.author_id) : undefined;
  return { ...post, author };
});

/** 공개 글 번호 전체 (docs/ 시안 사본이 참조). 앱의 상세 페이지 사전 생성은 getRecentPostNumbers를 쓴다. */
export async function getAllPostNumbers(): Promise<number[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from('posts')
    .select('post_number')
    .eq('is_visible', true);

  if (error) return [];
  return (data ?? []).map(p => p.post_number);
}

/** 빌드 때 미리 만들 최근 글 번호 — generateStaticParams 전용. */
export async function getRecentPostNumbers(
  limit = PRERENDER_POST_COUNT,
): Promise<number[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from('posts')
    .select('post_number')
    .eq('is_visible', true)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []).map(p => p.post_number);
}

// sitemap.xml 전용 — force-dynamic 라우트에서만 호출되므로 캐시를 두지 않고
// 매 요청 Supabase를 직접 조회한다 (unstable_cache의 revalidate/tags 기반
// 무효화가 Vercel 프로덕션에서 반복적으로 실측 정체된 이력 때문).
export async function getAllPostSlugs(): Promise<
  { post_number: number; updated_at: string }[]
> {
  const supabase = createStaticClient();
  const rows: { post_number: number; updated_at: string }[] = [];

  for (let from = 0; ; from += SITEMAP_PAGE_SIZE) {
    const to = from + SITEMAP_PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from('posts')
      .select('post_number, updated_at')
      .eq('is_visible', true)
      .order('post_number', { ascending: true })
      .range(from, to);

    // 빈 사이트맵을 내보내지 않도록 오류는 던져 5xx로 응답한다.
    if (error) throwQueryError('sitemap posts', error);

    rows.push(
      ...((data ?? []) as { post_number: number; updated_at: string }[]),
    );
    if (!data || data.length < SITEMAP_PAGE_SIZE) break;
  }

  return rows;
}
