/** The immutable number identifies a post; the title makes its URL readable. */
export function getPostPath(post: {
  post_number: number;
  title: string;
}): string {
  const slug = post.title
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^가-힣a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `/posts/${post.post_number}-${encodeURIComponent(slug || 'article')}`;
}

export function parsePostNumber(slug: string): number | null {
  const match = /^([1-9]\d*)(?:-.+)?$/.exec(slug);
  if (!match) return null;
  const number = Number(match[1]);
  return Number.isSafeInteger(number) ? number : null;
}
