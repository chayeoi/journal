import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getPostBySlug,
  getAllPostSlugs,
  getAllPosts,
  scoreRelatedPosts,
} from "@/lib/posts";
import { buildPostMetadata, buildPostJsonLd } from "@/lib/metadata";
import { extractHeadings, injectHeadingIds } from "@/utils/toc";
import { calcReadingTime } from "@/utils/reading-time";
import { fmtDate } from "@/utils/format";
import { ICON } from "@/utils/icons";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TocWatcher } from "@/components/TocWatcher";
import { PageInit } from "@/components/PageInit";
import { TweaksPanel } from "@/components/TweaksPanel";

type Props = { params: Promise<{ slug: string }> };

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
  const [post, allPosts] = await Promise.all([
    getPostBySlug(slug),
    getAllPosts(),
  ]);
  if (!post) notFound();

  const relatedPosts = scoreRelatedPosts(post, allPosts, 3);
  const headings = extractHeadings(post.content);
  const processedContent = injectHeadingIds(post.content);
  const readingTime = calcReadingTime(post.content);
  const jsonLd = buildPostJsonLd(post);

  const authorInitials = post.author?.name?.charAt(0) ?? "A";

  return (
    <>
      <PageInit page="detail" />
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
              <Link href={`/?cat=${post.category.slug}`}>{post.category.name}</Link>
              <span aria-hidden="true">›</span>
            </>
          )}
          <span>{post.title}</span>
        </nav>

        <header className="arthead">
          {post.category && (
            <p className="eyebrow arthead__cat">{post.category.name}</p>
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
              <div className="artfoot__tags">
                {post.tags?.map((t) => (
                  <Link
                    key={t.slug}
                    className="ptag"
                    href={`/?tag=${t.slug}`}
                  >
                    {t.name}
                  </Link>
                ))}
              </div>

              {post.author && (
                <div className="authorbox">
                  <span
                    className="avatar avatar--accent"
                    style={{ width: 56, height: 56, fontSize: 24, fontWeight: 700 }}
                    aria-hidden="true"
                  >
                    {authorInitials}
                  </span>
                  <div>
                    <div className="authorbox__name">AUCTORITAS</div>
                    {post.author.bio && (
                      <p className="authorbox__bio">{post.author.bio}</p>
                    )}
                  </div>
                </div>
              )}

              <aside className="consult-note">
                <div>
                  <div className="consult-note__t">떼인 돈, 포기하지 않아도 돼요.</div>
                  <div className="consult-note__d">
                    공사대금, 보증금, 월세 등으로 받지 못한 돈이 있다면
                    FENCIL의 간편한 청구 절차로 법원에 청구해 보세요.
                  </div>
                </div>
                <a
                  className="consult-note__btn"
                  href="https://fencil.app"
                  target="_blank"
                  rel="noopener"
                >
                  무료로 시작하기{" "}
                  <span dangerouslySetInnerHTML={{ __html: ICON.arrow }} />
                </a>
              </aside>
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
                <article key={rp.id} className="pcard" data-cat={rp.category?.slug ?? ""}>
                  <a className="pcard__link" href={`/posts/${rp.slug}`} aria-label={rp.title}>
                    <span className="pcard__thumb">
                      {rp.cover_image_url && (
                        <img src={rp.cover_image_url} alt="" loading="lazy" width={1600} height={900} />
                      )}
                      <span className="pcard__cat eyebrow">{rp.category?.name ?? ""}</span>
                    </span>
                    <span className="pcard__body">
                      <h3 className="pcard__title">{rp.title}</h3>
                      {rp.excerpt && <p className="pcard__excerpt">{rp.excerpt}</p>}
                      <span className="pcard__foot">
                        <span className="avatar" style={{ width: 24, height: 24, fontSize: 11 }} aria-hidden="true" />
                        <span className="pcard__who">
                          <span className="pcard__by">AUCTORITAS</span>
                        </span>
                        <span className="pcard__metaline">
                          {rp.published_at && (
                            <time dateTime={rp.published_at}>{fmtDate(rp.published_at, "short")}</time>
                          )}
                        </span>
                      </span>
                    </span>
                  </a>
                </article>
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

      <style>{`
        .consult-note {
          display: flex; align-items: center; justify-content: space-between;
          gap: 24px; flex-wrap: wrap;
          padding: 26px 28px; margin-top: 32px;
          border: 1px solid var(--line); border-radius: var(--r-card);
          background: var(--surface-2);
        }
        .consult-note__t { font-size: 16px; font-weight: 800; color: var(--ink); letter-spacing: -0.02em; }
        .consult-note__d { font-size: 14px; color: var(--fg-2); line-height: 1.55; margin-top: 6px; max-width: 46ch; }
        .consult-note__btn {
          display: inline-flex; align-items: center; gap: 8px; white-space: nowrap;
          font-size: 14px; font-weight: 700; color: #fff; background-color: #161616;
          text-decoration: none; padding: 12px 20px; border-radius: var(--r-btn);
          transition: transform var(--d) var(--ease);
        }
        .consult-note__btn svg { width: 16px; height: 16px; }
        .consult-note__btn:hover { background: var(--accent); transform: translateY(-2px); }
      `}</style>
    </>
  );
}
