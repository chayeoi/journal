import Link from 'next/link';
import type { Metadata } from 'next';
import { getPosts } from '@/lib/posts';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageInit from '@/components/PageInit';
import PostCard from '@/components/PostCard';
import styles from './styles.css';

export const revalidate = 60;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://journal.fightingspirit.kr';
const TITLE = '나홀로소송 가이드';
const DESCRIPTION =
  '소장과 답변서 준비부터 증거 정리, 재판기일, 판결 후 집행까지 나홀로소송의 흐름과 관련 법률 글을 한곳에서 살펴보세요.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: 'website',
    title: `${TITLE} — AUCTORITAS LAB`,
    description: DESCRIPTION,
    locale: 'ko_KR',
    siteName: 'AUCTORITAS LAB',
  },
  alternates: { canonical: `${SITE_URL}/self-litigation` },
};

const PHASES = [
  {
    label: '서면 준비',
    title: '소장·답변서',
    description:
      '누가 누구에게 무엇을 청구하는지 정리하고, 상대방 주장에 답할 사실과 근거를 구분합니다.',
    links: [
      { label: '소장 글 보기', href: '/?q=소장' },
      { label: '답변서 글 보기', href: '/?q=답변서' },
    ],
  },
  {
    label: '자료 정리',
    title: '증거',
    description:
      '계약서, 대화, 송금 내역처럼 주장을 뒷받침할 자료를 쟁점별로 묶고 제출 순서를 살핍니다.',
    links: [{ label: '증거 글 보기', href: '/?q=증거' }],
  },
  {
    label: '재판 진행',
    title: '기일',
    description:
      '법원이 확인할 쟁점과 제출 기한을 점검하고, 기일에서 설명할 핵심 내용을 준비합니다.',
    links: [{ label: '기일 글 보기', href: '/?q=기일' }],
  },
  {
    label: '판결 이후',
    title: '집행',
    description:
      '판결문과 확정 여부를 확인한 뒤 채권의 종류와 상대방 재산에 맞는 집행 절차를 살핍니다.',
    links: [{ label: '집행 글 보기', href: '/?q=집행' }],
  },
] as const;

const ENTRANCES = [
  {
    title: '민사',
    description:
      '계약, 금전, 부동산처럼 개인과 사업자 사이에서 생긴 분쟁을 주제별로 찾아보세요.',
    links: [
      { label: '공사대금', href: '/?cat=공사대금' },
      { label: '임대차', href: '/?cat=임대차' },
      { label: '부동산매매', href: '/?cat=부동산매매' },
      { label: '명도·인도', href: '/?cat=명도·인도' },
    ],
  },
  {
    title: '행정',
    description:
      '처분의 근거와 통지 시점, 불복 기간을 먼저 확인해야 하는 행정 분쟁 글을 모았습니다.',
    links: [{ label: '행정 글 보기', href: '/?cat=행정' }],
  },
  {
    title: '가사',
    description:
      '이혼, 양육, 상속 등 가족관계와 재산 문제가 함께 얽힌 분쟁의 기준을 살펴보세요.',
    links: [
      { label: '가사·가족', href: '/?cat=가사·가족' },
      { label: '상속', href: '/?cat=상속' },
    ],
  },
] as const;

const SELF_LITIGATION_CATEGORIES = new Set([
  '공사대금',
  '임대차',
  '부동산매매',
  '상속',
  '행정',
  '재개발·재건축',
  '가사·가족',
  '명도·인도',
]);

export default async function SelfLitigationPage() {
  const { posts } = await getPosts();
  const relatedPosts = posts
    .filter(post =>
      post.category ? SELF_LITIGATION_CATEGORIES.has(post.category) : false,
    )
    .slice(0, 6);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${TITLE} — AUCTORITAS LAB`,
    description: DESCRIPTION,
    url: `${SITE_URL}/self-litigation`,
    inLanguage: 'ko-KR',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: relatedPosts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: post.title,
        url: `${SITE_URL}/posts/${post.post_number}`,
      })),
    },
  };

  return (
    <>
      <PageInit page="self-litigation" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />

      <main>
        <section className={`on-dark ${styles.hero}`}>
          <div className={`wrap ${styles.heroInner}`}>
            <p className={`eyebrow ${styles.heroEyebrow}`}>SELF LITIGATION</p>
            <h1 className={styles.heroTitle}>
              나홀로소송, 순서부터 잡아보세요.
            </h1>
            <p className={styles.heroDescription}>
              준비할 서면과 증거, 재판 진행, 판결 뒤 절차까지 필요한 정보를
              단계별로 찾을 수 있습니다.
            </p>
            <p className={styles.heroNote}>
              사건의 종류와 진행 상황에 따라 필요한 절차와 기간은 달라질 수
              있습니다.
            </p>
          </div>
        </section>

        <section
          className={`wrap ${styles.section}`}
          aria-labelledby="steps-title"
        >
          <div className={styles.sectionHead}>
            <div>
              <p className="eyebrow">소송의 흐름</p>
              <h2 id="steps-title" className={styles.sectionTitle}>
                지금 필요한 단계에서 시작하세요
              </h2>
            </div>
            <p className={styles.sectionDescription}>
              각 단계에서 자주 찾는 주제로 바로 이동합니다.
            </p>
          </div>
          <ol className={styles.phaseGrid}>
            {PHASES.map((phase, index) => (
              <li key={phase.title} className={styles.phaseCard}>
                <div className={styles.phaseMeta}>
                  <span className={styles.phaseNumber} aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.phaseLabel}>{phase.label}</span>
                </div>
                <h3 className={styles.phaseTitle}>{phase.title}</h3>
                <p className={styles.phaseDescription}>{phase.description}</p>
                <div className={styles.linkRow}>
                  {phase.links.map(link => (
                    <Link
                      key={link.href}
                      className={styles.textLink}
                      href={link.href}
                    >
                      {link.label}
                      <span aria-hidden="true">→</span>
                    </Link>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section
          className={styles.entranceSection}
          aria-labelledby="field-title"
        >
          <div className="wrap">
            <div className={styles.sectionHead}>
              <div>
                <p className="eyebrow">사건 분야</p>
                <h2 id="field-title" className={styles.sectionTitle}>
                  사건에 맞는 입구를 고르세요
                </h2>
              </div>
              <p className={styles.sectionDescription}>
                분야별 쟁점과 실무 글을 모아 볼 수 있습니다.
              </p>
            </div>
            <div className={styles.entranceGrid}>
              {ENTRANCES.map(entrance => (
                <article key={entrance.title} className={styles.entranceCard}>
                  <h3 className={styles.entranceTitle}>{entrance.title}</h3>
                  <p className={styles.entranceDescription}>
                    {entrance.description}
                  </p>
                  <div className={styles.chipList}>
                    {entrance.links.map(link => (
                      <Link
                        key={link.href}
                        className={styles.chipLink}
                        href={link.href}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className={`wrap ${styles.articleSection}`}
          aria-labelledby="latest-title"
        >
          <div className={styles.sectionHead}>
            <div>
              <p className="eyebrow">최근 글</p>
              <h2 id="latest-title" className={styles.sectionTitle}>
                나홀로소송에 참고할 최신 글
              </h2>
            </div>
            <Link className={styles.allLink} href="/">
              모든 글 보기 <span aria-hidden="true">→</span>
            </Link>
          </div>
          {relatedPosts.length > 0 ? (
            <div className={styles.postList}>
              {relatedPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className={styles.empty}>관련 글을 준비하고 있습니다.</p>
          )}
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
