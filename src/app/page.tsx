import { getPosts, getCategoryCounts, getArchiveDates, getFeaturedPosts } from "@/lib/posts";
import { buildSiteJsonLd } from "@/lib/metadata";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { ArticleList } from "@/components/ArticleList";
import { PageInit } from "@/components/PageInit";
import { TweaksPanel } from "@/components/TweaksPanel";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "공간을 둘러싼 분쟁, 법으로 풀어내다 — AUCTORITAS LAB",
  description:
    "공사대금·부동산·임대차 등 공간분쟁을 판례와 실무 기준으로 정리하는 법률 저널. 공간분쟁 전문 변호사팀이 직접 씁니다.",
};

interface Props {
  searchParams: Promise<{ cat?: string; tag?: string; q?: string; archive?: string }>;
}

export default async function HomePage({ searchParams }: Props) {
  const sp = await searchParams;

  const [result, categoryCounts, archiveDates, featuredPosts] = await Promise.all([
    getPosts({
      category: sp.cat,
      tag: sp.tag,
      query: sp.q,
      archive: sp.archive,
    }),
    getCategoryCounts(),
    getArchiveDates(),
    getFeaturedPosts(),
  ]);

  const { posts, total, hasMore } = result;
  const jsonLd = buildSiteJsonLd();

  return (
    <>
      <PageInit page="home" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script type="application/ld+json" id="ld-list" />

      <SiteHeader />

      <main>
        <section className="hero-lite wrap" aria-label="저널 소개">
          <p className="hero-lite__kicker">
            <b>AUCTORITAS LAB</b>
            <span className="rule" />
            공간분쟁 판례·실무 저널
          </p>
          <h1 className="hero-lite__title">
            공간을 둘러싼 분쟁,<br />법으로 풀어내다.
          </h1>
          <p className="hero-lite__sub">
            공사대금, 부동산, 임대차 등 공간분쟁을 판례와 실무 기준으로 정리합니다.
          </p>
        </section>

        <FeaturedCarousel posts={featuredPosts} />

        <ArticleList
          initialPosts={posts}
          total={total}
          hasMore={hasMore}
          categoryCounts={categoryCounts}
          archiveDates={archiveDates}
          filters={{
            cat: sp.cat ?? "",
            tag: sp.tag ?? "",
            q: sp.q ?? "",
            archive: sp.archive ?? "",
          }}
        />
      </main>

      <SiteFooter />
      <div id="tweaks-root">
        <TweaksPanel />
      </div>
    </>
  );
}
