import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getPostByNumber, getAllPostNumbers, getRelatedPosts } from "@/lib/posts";
import { buildPostMetadata, buildPostJsonLd } from "@/lib/metadata";
import { extractHeadings, injectHeadingIds } from "@/utils/toc";
import { fmtDate } from "@/utils/format";
import { ICON } from "@/utils/icons";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TocWatcher from "@/components/TocWatcher";
import PageInit from "@/components/PageInit";
import TweaksPanel from "@/components/TweaksPanel";
import PostCard from "@/components/PostCard";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const numbers = await getAllPostNumbers();
  return numbers.map((n) => ({ slug: String(n) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostByNumber(Number(slug));
  if (!post) return {};
  return buildPostMetadata(post);
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostByNumber(Number(slug));
  if (!post) notFound();

  const relatedPosts = await getRelatedPosts(post.id, post.tags ?? [], post.author_id, post.category, 3);
  const headings = extractHeadings(post.content);
  const processedContent = injectHeadingIds(post.content);
  const readingTime = post.reading_minutes ?? 1;
  const jsonLd = buildPostJsonLd(post);

  const authorName = post.author?.display_name ?? "AUCTORITAS";

  return (
    <>
      <PageInit page="detail" cover="overlay" />
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.setAttribute("data-cover","overlay");`,
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SiteHeader />

      <main className="wrap" id="article-main">
        <nav className="breadcrumb" aria-label="위치">
          <Link href="/">홈</Link>
          <span aria-hidden="true">›</span>
          {post.category && (
            <>
              <Link href={`/?cat=${encodeURIComponent(post.category)}`}>
                {post.category}
              </Link>
              <span aria-hidden="true">›</span>
            </>
          )}
          <span>{post.title}</span>
        </nav>

        <header className="arthead">
          <div className="arthead__text">
            {post.category && (
              <p className="eyebrow arthead__cat">{post.category}</p>
            )}
            <h1 className="arthead__title">{post.title}</h1>
            <div className="arthead__meta">
              <span className="artmeta__sub">
                {post.published_at && (
                  <time dateTime={post.published_at}>
                    {fmtDate(post.published_at, "long")}
                  </time>
                )}
                <span className="dotsep">·</span>
                읽는 데 {readingTime}분
              </span>
            </div>
          </div>
          {post.thumbnail_url && (
            <figure className="artcover">
              <img
                src={post.thumbnail_url}
                alt=""
                width={1600}
                height={900}
                loading="eager"
              />
            </figure>
          )}
        </header>

        <div className="artbody">
          {headings.length > 0 ? (
            <nav className="artrail" aria-label="목차">
              <div className="toc__label">목차</div>
              <div className="toc" id="toc">
                {headings.map((h) => (
                  <a key={h.id} href={`#${h.id}`}>
                    {h.text}
                  </a>
                ))}
              </div>
            </nav>
          ) : (
            <div className="artrail" />
          )}

          <div>
            <article
              className="prose"
              id="prose"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />

            <div className="artfoot">
              {(post.tags ?? []).length > 0 && (
                <div className="artfoot__tags">
                  {post.tags.map((t) => (
                    <Link
                      key={t}
                      className="ptag"
                      href={`/?tag=${encodeURIComponent(t)}`}
                    >
                      {t}
                    </Link>
                  ))}
                </div>
              )}

              {post.author && (
                <div className="authorbox">
                  {post.author.avatar_url ? (
                    <img
                      src={post.author.avatar_url}
                      alt={authorName}
                      width={56}
                      height={56}
                      style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                    />
                  ) : (
                    <span
                      className="avatar avatar--accent"
                      style={{ width: 56, height: 56, fontSize: 24, fontWeight: 700 }}
                      aria-hidden="true"
                    >
                      {authorName.charAt(0)}
                    </span>
                  )}
                  <div>
                    <div className="authorbox__name">{authorName}</div>
                    {post.author.bio && (
                      <p className="authorbox__bio">{post.author.bio}</p>
                    )}
                  </div>
                </div>
              )}

              {/* <ConsultNote /> */}
            </div>
          </div>
        </div>

        {relatedPosts.length > 0 && (
          <section
            className="related wrap"
            aria-labelledby="rel-h"
            style={{ paddingLeft: 0, paddingRight: 0 }}
          >
            <div className="sec__head">
              <div>
                <h2 className="sec__title" id="rel-h">관련 아티클</h2>
                <p className="sec__sub">이 글과 함께 읽으면 좋은 판례·실무</p>
              </div>
              <Link className="sec__link" href="/#articles">
                아티클 전체{" "}
                <span dangerouslySetInnerHTML={{ __html: ICON.arrow }} />
              </Link>
            </div>
            <div className="cardgrid">
              {relatedPosts.map((rp) => (
                <PostCard key={rp.id} post={rp} showReadingTime={false} />
              ))}
            </div>
          </section>
        )}
      </main>

      <TocWatcher headings={headings} />

      <SiteFooter />
      <div id="tweaks-root">
        <TweaksPanel />
      </div>
    </>
  );
}
