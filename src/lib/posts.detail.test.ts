import { beforeEach, describe, expect, it, vi } from 'vitest';

type Result = { data: unknown; error: unknown };

const { calls, state } = vi.hoisted(() => ({
  calls: [] as { table: string; ops: string[] }[],
  state: {
    respond: (() => ({ data: null, error: null })) as (
      table: string,
      ops: string[],
    ) => Result,
  },
}));

vi.mock('next/cache', () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => {
    const entries = new Map<string, unknown>();
    return (...args: unknown[]) => {
      const key = JSON.stringify(args);
      if (!entries.has(key)) {
        const p = Promise.resolve(fn(...args));
        // 실패한 결과는 캐시에 남기지 않는다(Next.js unstable_cache와 같은 동작)
        p.catch(() => entries.delete(key));
        entries.set(key, p);
      }
      return entries.get(key);
    };
  },
}));
vi.mock('@/lib/supabase/static', () => ({
  createStaticClient: () => ({
    from: (table: string) => {
      const call = { table, ops: [] as string[] };
      calls.push(call);
      const builder: Record<string, unknown> = {};
      for (const m of [
        'select',
        'eq',
        'neq',
        'in',
        'or',
        'order',
        'limit',
        'single',
        'maybeSingle',
      ]) {
        builder[m] = (...args: unknown[]) => {
          call.ops.push(`${m}:${JSON.stringify(args)}`);
          return builder;
        };
      }
      builder.then = (
        ok: (r: Result) => unknown,
        fail?: (e: unknown) => unknown,
      ) => Promise.resolve(state.respond(table, call.ops)).then(ok, fail);
      return builder;
    },
  }),
}));

const AUTHOR = {
  id: 'a1',
  display_name: '김변호사',
  bio: '소개',
  avatar_url: null,
};
const POST = {
  id: 'p1',
  post_number: 7,
  title: '글',
  author_id: 'a1',
  tags: null,
};

beforeEach(() => {
  vi.resetModules();
  calls.length = 0;
  state.respond = (table: string) =>
    table === 'profiles'
      ? { data: [AUTHOR], error: null }
      : { data: POST, error: null };
});

describe('getPostByNumber', () => {
  it('글에 작성자를 붙이고, 작성자는 id 기준 캐시를 쓴다', async () => {
    const { getPostByNumber } = await import('@/lib/posts');
    const post = await getPostByNumber(7);
    expect(post?.author).toEqual(AUTHOR);
    expect(post?.tags).toEqual([]);
    expect(calls.filter(c => c.table === 'profiles')).toHaveLength(1);
  });

  it('행이 없으면(maybeSingle data null) null', async () => {
    state.respond = () => ({ data: null, error: null });
    const { getPostByNumber } = await import('@/lib/posts');
    expect(await getPostByNumber(999)).toBeNull();
  });

  it('그 밖의 DB 오류는 던진다 — 일시 장애가 없는 글(404)로 캐시되지 않게', async () => {
    state.respond = () => ({
      data: null,
      error: { code: '57014', message: 'timeout' },
    });
    const { getPostByNumber } = await import('@/lib/posts');
    await expect(getPostByNumber(8)).rejects.toThrow(/code=57014/);
  });

  it('잘못된 글 번호는 조회하지 않고 null', async () => {
    const { getPostByNumber } = await import('@/lib/posts');
    expect(await getPostByNumber(Number('abc'))).toBeNull();
    expect(calls).toHaveLength(0);
  });
});

describe('getRelatedPosts', () => {
  it('여러 글 페이지가 같은 작성자 캐시를 공유한다', async () => {
    state.respond = (table: string) =>
      table === 'profiles'
        ? { data: [AUTHOR], error: null }
        : { data: [{ ...POST, id: 'p2', tags: ['임대차'] }], error: null };
    const { getRelatedPosts } = await import('@/lib/posts');
    const a = await getRelatedPosts('p1', ['임대차'], 'a1', null);
    await getRelatedPosts('p3', ['임대차'], 'a1', null);
    expect(a[0].author).toEqual({
      id: 'a1',
      display_name: '김변호사',
      avatar_url: null,
    });
    expect(calls.filter(c => c.table === 'profiles')).toHaveLength(1);
  });

  it('조회 오류면 빈 배열(본문 표시는 막지 않음)', async () => {
    state.respond = () => ({ data: null, error: { message: 'offline' } });
    const { getRelatedPosts } = await import('@/lib/posts');
    expect(await getRelatedPosts('p1', [], null, null)).toEqual([]);
  });
});
