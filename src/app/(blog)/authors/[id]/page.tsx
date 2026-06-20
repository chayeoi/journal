import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getAuthorById, getAllAuthorIds } from '@/lib/authors';
import { buildAuthorMetadata, buildAuthorJsonLd } from '@/lib/metadata';
import { ICON } from '@/utils/icons';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageInit from '@/components/PageInit';
import TweaksPanel from '@/components/TweaksPanel';
import PostCard from '@/components/PostCard';
import styles from './styles.css';

export const revalidate = 300;
export const dynamicParams = true;

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  const ids = await getAllAuthorIds();
  return ids.map(id => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const author = await getAuthorById(id);
  if (!author) return {};
  return buildAuthorMetadata(author);
}

export default async function AuthorPage({ params }: Props) {
  const { id } = await params;
  const author = await getAuthorById(id);
  if (!author) notFound();

  const jsonLd = buildAuthorJsonLd(author);
  const initial = (author.display_name ?? 'A').charAt(0);

  return (
    <>
      <PageInit page="author" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SiteHeader />

      <main className="wrap">
        <nav className="breadcrumb" aria-label="위치">
          <Link href="/">홈</Link>
          <span aria-hidden="true">›</span>
          <Link href="/authors">집필진</Link>
          <span aria-hidden="true">›</span>
          <span>{author.display_name}</span>
        </nav>

        <header className={styles.profile}>
          {author.avatar_url ? (
            <img
              src={author.avatar_url}
              alt={author.display_name}
              width={124}
              height={124}
              className={styles.avatarImg}
            />
          ) : (
            <span
              className={`avatar avatar--dark ${styles.avatar}`}
              aria-hidden="true"
            >
              {initial}
            </span>
          )}
          <div className={styles.profileText}>
            <p className={`eyebrow ${styles.eyebrow}`}>집필진 · CONTRIBUTOR</p>
            <h1 className={styles.name}>{author.display_name}</h1>
            {author.bio && <p className={styles.bio}>{author.bio}</p>}
            <div className={styles.meta}>
              <span>
                <b>{author.post_count}</b>편의 아티클
              </span>
            </div>
          </div>
        </header>

        <section className={styles.posts} aria-labelledby="ap-h">
          <div className="sec__head">
            <div>
              <h2 className="sec__title" id="ap-h">
                작성한 글
              </h2>
              <p className="sec__sub">총 {author.post_count}편</p>
            </div>
            {author.post_count > 0 && (
              <Link className="sec__link" href={`/?author=${author.id}`}>
                더 보기{' '}
                <span dangerouslySetInnerHTML={{ __html: ICON.arrow }} />
              </Link>
            )}
          </div>

          {author.posts.length > 0 ? (
            <div className={styles.postgrid}>
              {author.posts.map(p => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <p>아직 발행된 글이 없어요.</p>
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
      <div id="tweaks-root">
        <TweaksPanel />
      </div>
    </>
  );
}
