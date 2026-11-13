import { beforeEach, describe, expect, it, vi } from 'vitest';

const { queries, state } = vi.hoisted(() => ({
  queries: [] as { fields: string; range?: number[] }[],
  state: { rows: [] as Record<string, unknown>[], error: null as unknown },
}));
vi.mock('next/cache', () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => {
    const entries = new Map<string, unknown>();
    return (...args: unknown[]) => {
      const key = JSON.stringify(args);
      if (!entries.has(key)) entries.set(key, fn(...args));
      return entries.get(key);
    };
  },
}));
vi.mock('@/lib/supabase/static', () => ({
  createStaticClient: () => ({
    from: () => {
      const query = { fields: '', range: undefined as number[] | undefined };
      queries.push(query);
      const builder = {
        select(fields: string) {
          query.fields = fields;
          return builder;
        },
        eq() {
          return builder;
        },
        order() {
          return builder;
        },
        not() {
          return builder;
        },
        range(...args: number[]) {
          query.range = args;
          return builder;
        },
        then(resolve: (value: unknown) => unknown) {
          return Promise.resolve({
            data: state.rows,
            count: state.rows.length,
            error: state.error,
          }).then(resolve);
        },
      };
      return builder;
    },
  }),
}));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  queries.length = 0;
  state.rows = [];
  state.error = null;
});

describe('탐색용 집계', () => {
  it('카테고리와 월별 개수를 동일 조회로 계산하고 기존 정렬·null 처리를 유지한다', async () => {
    state.rows = [
      { category: '임대차', published_at: '2026-01-01T00:00:00Z' },
      { category: '공사대금', published_at: '2026-03-01T00:00:00Z' },
      { category: '임대차', published_at: null },
      { category: null, published_at: '2026-03-02T00:00:00Z' },
      { category: '알 수 없는 분류', published_at: '2026-01-02T00:00:00Z' },
    ];
    const { getCategoryCounts, getArchiveDates } = await import('@/lib/posts');
    expect(await getCategoryCounts()).toEqual([
      { category: 'all', count: 5 },
      { category: '공사대금', count: 1 },
      { category: '임대차', count: 2 },
    ]);
    expect(await getArchiveDates()).toEqual([
      { key: '2026-03', label: '2026년 3월', count: 2 },
      { key: '2026-01', label: '2026년 1월', count: 2 },
    ]);
    expect(queries).toHaveLength(1);
  });

  it('조회 오류 때 두 탐색 목록 모두 빈 배열을 돌려준다', async () => {
    state.error = new Error('offline');
    const { getCategoryCounts, getArchiveDates } = await import('@/lib/posts');
    expect(await getCategoryCounts()).toEqual([]);
    expect(await getArchiveDates()).toEqual([]);
  });
});

describe('목록 캐시의 범위', () => {
  it('홈의 첫 페이지 복원과 기본 목록 API는 같은 범위·캐시를 공유한다', async () => {
    const { getPosts } = await import('@/lib/posts');
    await getPosts({ upToPage: 1 });
    await getPosts();
    await getPosts({ page: 1 });
    expect(queries).toHaveLength(1);
    expect(queries[0].range).toEqual([0, 49]);
  });

  it('2페이지까지 복원할 때 page는 조회 범위에 영향을 주지 않는다', async () => {
    const { getPosts } = await import('@/lib/posts');
    await getPosts({ page: 1, upToPage: 2 });
    await getPosts({ page: 2, upToPage: 2 });
    expect(queries).toHaveLength(1);
    expect(queries[0].range).toEqual([0, 99]);
  });
});
