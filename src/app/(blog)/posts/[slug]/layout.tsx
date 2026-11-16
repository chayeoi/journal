import { notFound, permanentRedirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getPostByNumber } from '@/lib/posts';
import { getPostPath, parsePostNumber } from '@/lib/post-url';

interface Props {
  params: Promise<{ slug: string }>;
  children: ReactNode;
}

// This layout is outside loading.tsx's Suspense boundary: determine HTTP status
// before the skeleton can start streaming a 200 response. The page shares the
// request-level post cache, so this does not issue another detail query.
export default async function PostLayout({ params, children }: Props) {
  const { slug } = await params;
  const number = parsePostNumber(slug);
  const post = number === null ? null : await getPostByNumber(number);
  if (!post) notFound();
  const path = getPostPath(post);
  // Next.js can supply percent-encoded params (including prerendered paths).
  // Decode once before comparing, or Korean canonical URLs redirect to themselves.
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch {
    // A malformed decorative suffix still resolves by number to its canonical URL.
  }
  if (`/posts/${encodeURIComponent(decodedSlug)}` !== path)
    permanentRedirect(path);
  return children;
}
