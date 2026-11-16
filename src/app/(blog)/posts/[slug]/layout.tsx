import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { getPostByNumber } from '@/lib/posts';
import { parsePostNumber } from '@/lib/post-url';

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
  // Keep already-published title paths as 200 aliases. Some clients may cache
  // the former numeric -> title 308; redirecting back would create a loop.
  // Metadata and all new links use the original numeric canonical URL.
  return children;
}
