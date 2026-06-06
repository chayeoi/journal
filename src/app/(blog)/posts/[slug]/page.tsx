import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostBySlug, getAllPostSlugs, getRelatedPosts } from "@/lib/posts";
import { buildPostMetadata, buildPostJsonLd } from "@/lib/metadata";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return buildPostMetadata(post);
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const relatedPosts = await getRelatedPosts(post.id, post.category_id);
  const jsonLd = buildPostJsonLd(post);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <article>
          <header>
            {post.category && <span>{post.category.name}</span>}
            <h1>{post.title}</h1>
            {post.excerpt && <p>{post.excerpt}</p>}
            <div>
              {post.author && <span>{post.author.name}</span>}
              {post.published_at && (
                <time dateTime={post.published_at}>
                  {new Date(post.published_at).toLocaleDateString("ko-KR")}
                </time>
              )}
            </div>
            {post.tags && post.tags.length > 0 && (
              <ul>
                {post.tags.map((tag) => (
                  <li key={tag.id}>
                    <a href={`/posts?tag=${tag.slug}`}>#{tag.name}</a>
                  </li>
                ))}
              </ul>
            )}
          </header>

          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>

        {relatedPosts.length > 0 && (
          <aside>
            <h2>관련 아티클</h2>
            <ul>
              {relatedPosts.map((related) => (
                <li key={related.id}>
                  <a href={`/posts/${related.slug}`}>{related.title}</a>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </main>
    </>
  );
}
