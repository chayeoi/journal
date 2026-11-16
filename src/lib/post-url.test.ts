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
  it('keeps the original numeric path regardless of title changes', () => {
    for (const title of ['현재 제목', '바꾼 제목', '!!!']) {
      const post = { post_number: 42, title };
      expect(getPostPath(post)).toBe('/posts/42');
    }
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
  it('serves both numeric and already-published title paths without redirecting', async () => {
    const { default: layout } =
      await import('@/app/(blog)/posts/[slug]/layout');
    getPostByNumber.mockResolvedValue({ post_number: 42, title: '현재 제목' });
    // A browser may retain the old numeric -> title 308. A reverse redirect
    // would loop forever, so both paths must render the same article.
    for (const slug of ['42', '42-옛제목', '42-현재-제목']) {
      await expect(
        layout({ params: Promise.resolve({ slug }), children: 'article' }),
      ).resolves.toBe('article');
    }
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
