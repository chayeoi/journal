import Link from "next/link";
import type { Metadata } from "next";
import { getAuthors } from "@/lib/authors";
import { authorsListMetadata, buildAuthorsListJsonLd } from "@/lib/metadata";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageInit from "@/components/PageInit";
import TweaksPanel from "@/components/TweaksPanel";
import AuthorCard from "@/components/AuthorCard";
import styles from "./styles.css";

export const revalidate = 300;

export const metadata: Metadata = authorsListMetadata;

export default async function AuthorsPage() {
  const authors = await getAuthors();
  const jsonLd = buildAuthorsListJsonLd(authors);

  return (
    <>
      <PageInit page="authors" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SiteHeader />

      <main className="wrap">
        <nav className="breadcrumb" aria-label="위치">
          <Link href="/">홈</Link>
          <span aria-hidden="true">›</span>
          <span>집필진</span>
        </nav>

        <header className={`listhead ${styles.head}`}>
          <p className={`eyebrow ${styles.eyebrow}`}>집필진 · CONTRIBUTORS</p>
          <h1>공간분쟁을 직접 다루는 변호사들</h1>
          <p>모든 글은 그 분야를 직접 맡아 온 변호사가 판례와 실무를 근거로 씁니다.</p>
        </header>

        {authors.length > 0 ? (
          <section className={styles.list} aria-label="변호사 목록">
            {authors.map((a) => (
              <AuthorCard key={a.id} author={a} />
            ))}
          </section>
        ) : (
          <div className={styles.empty}>
            <h3>등록된 집필진이 없어요</h3>
            <p>발행된 글이 쌓이면 작성한 변호사가 이곳에 표시돼요.</p>
          </div>
        )}
      </main>

      <SiteFooter />
      <div id="tweaks-root">
        <TweaksPanel />
      </div>
    </>
  );
}
