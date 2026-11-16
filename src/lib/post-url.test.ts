import { describe, expect, it, vi } from 'vitest';
import { getPostPath, parsePostNumber } from '@/lib/post-url';

const { getPostByNumber } = vi.hoisted(() => ({ getPostByNumber: vi.fn() }));
vi.mock('@/lib/posts', () => ({ getPostByNumber }));
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('HTTP 404');
  },
  permanentRedirect: (path: string) => {
    throw new Error(`HTTP 308 ${path}`);
  },
}));

describe('post URLs', () => {
  it('uses a stable number to avoid duplicate-title collisions and normalizes Korean titles', () => {
    expect(
      getPostPath({ post_number: 42, title: '추가공사대금 · 청구 요건!' }),
    ).toBe(`/posts/42-${encodeURIComponent('추가공사대금-청구-요건')}`);
    expect(
      getPostPath({ post_number: 43, title: '추가공사대금 · 청구 요건!' }),
    ).not.toBe(
      getPostPath({ post_number: 42, title: '추가공사대금 · 청구 요건!' }),
    );
    expect(
      getPostPath({ post_number: 42, title: '한글'.normalize('NFD') }),
    ).toBe(`/posts/42-${encodeURIComponent('한글')}`);
    expect(getPostPath({ post_number: 42, title: 'A / B ? # %' })).toBe(
      '/posts/42-a-b',
    );
    expect(getPostPath({ post_number: 42, title: '!!!' })).toBe(
      '/posts/42-article',
    );
  });
  it('accepts numeric and old-title aliases but rejects ambiguous numbers', () => {
    for (const slug of ['42', '42-옛제목'])
      expect(parsePostNumber(slug)).toBe(42);
    for (const slug of [
      '0',
      '-1',
      '1.5',
      '1e2',
      '0x10',
      '01',
      'abc',
      '42-',
      '9007199254740992',
    ])
      expect(parsePostNumber(slug)).toBeNull();
  });
  it('checks missing and hidden posts before rendering children', async () => {
    const { default: layout } =
      await import('@/app/(blog)/posts/[slug]/layout');
    getPostByNumber.mockResolvedValue(null);
    await expect(
      layout({
        params: Promise.resolve({ slug: '316' }),
        children: 'skeleton',
      }),
    ).rejects.toThrow('HTTP 404');
  });
  it('redirects numeric and old-title links to the current canonical and renders only canonical children', async () => {
    const { default: layout } =
      await import('@/app/(blog)/posts/[slug]/layout');
    getPostByNumber.mockResolvedValue({ post_number: 42, title: '현재 제목' });
    for (const slug of ['42', '42-옛제목'])
      await expect(
        layout({ params: Promise.resolve({ slug }), children: 'article' }),
      ).rejects.toThrow(
        `HTTP 308 /posts/42-${encodeURIComponent('현재-제목')}`,
      );
    await expect(
      layout({
        params: Promise.resolve({ slug: '42-현재-제목' }),
        children: 'article',
      }),
    ).resolves.toBe('article');
  });
  it('renders percent-encoded Korean canonical params without a redirect loop', async () => {
    const { default: layout } =
      await import('@/app/(blog)/posts/[slug]/layout');
    getPostByNumber.mockResolvedValue({ post_number: 42, title: '현재 제목' });
    await expect(
      layout({
        params: Promise.resolve({
          slug: `42-${encodeURIComponent('현재-제목')}`,
        }),
        children: 'article',
      }),
    ).resolves.toBe('article');
  });
  it('propagates DB failures without converting them to a missing post', async () => {
    const { default: layout } =
      await import('@/app/(blog)/posts/[slug]/layout');
    getPostByNumber.mockRejectedValue(new Error('DB timeout'));
    await expect(
      layout({ params: Promise.resolve({ slug: '42' }), children: 'article' }),
    ).rejects.toThrow('DB timeout');
  });
});
