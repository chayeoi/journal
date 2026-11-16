/** Numeric URLs remain canonical, independent of the post title. */
export function getPostPath(post: { post_number: number }): string {
  return `/posts/${post.post_number}`;
}

export function parsePostNumber(slug: string): number | null {
  const match = /^([1-9]\d*)(?:-.+)?$/.exec(slug);
  if (!match) return null;
  const number = Number(match[1]);
  return Number.isSafeInteger(number) ? number : null;
}
