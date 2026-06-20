import type { Metadata } from 'next';
import type {
  Post,
  FaqItem,
  MentionItem,
  AuthorDetail,
  AuthorListItem,
} from '@/types';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://journal.fightingspirit.kr';
const SITE_NAME = 'AUCTORITAS LAB';
const SITE_DESCRIPTION =
  '공사대금·부동산·임대차 등 공간분쟁을 판례와 실무 기준으로 정리하는 법률 저널. 공간분쟁 전문 변호사팀이 직접 씁니다.';

export const defaultMetadata: Metadata = {
  title: {
    default: '공간을 둘러싼 분쟁, 법으로 풀어내다 — AUCTORITAS LAB',
    template: `%s — AUCTORITAS LAB`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'ko_KR',
    title: '공간을 둘러싼 분쟁, 법으로 풀어내다 — AUCTORITAS LAB',
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
  alternates: { canonical: SITE_URL },
  verification: {
    other: {
      'naver-site-verification': '71b06ceb8098a274ce44eeb4dd9a18f917ebd162',
    },
  },
};

export function buildSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LegalService',
        name: 'AUCTORITAS LAB',
        description: SITE_DESCRIPTION,
        url: SITE_URL,
        telephone: '+82-31-546-3997',
        faxNumber: '+82-31-546-3998',
        email: 'info@fightingspirit.kr',
        areaServed: 'KR',
        knowsAbout: [
          '공사대금',
          '부동산매매',
          '임대차',
          '재개발',
          '명도소송',
          '유치권',
        ],
        address: {
          '@type': 'PostalAddress',
          streetAddress: '광교중앙로 248번길 7-2 원희캐슬법조타운 B동 401호',
          addressLocality: '수원시 영통구',
          addressRegion: '경기도',
          addressCountry: 'KR',
        },
        sameAs: [
          'https://fightingspirit.kr',
          'https://instagram.com/auctoritas_journal',
        ],
      },
      {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };
}

function getExcerpt(content: string, maxLen = 160): string {
  return content
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

export function buildPostMetadata(post: Post): Metadata {
  const description =
    post.excerpt?.trim() || getExcerpt(post.content) || undefined;

  const images = post.thumbnail_url
    ? [{ url: post.thumbnail_url, width: 1200, height: 630, alt: post.title }]
    : [];

  return {
    title: post.title,
    description,
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      images,
      locale: 'ko_KR',
      siteName: SITE_NAME,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      authors: post.author ? [post.author.display_name] : undefined,
      section: post.category ?? undefined,
      tags: post.tags.length > 0 ? post.tags : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: post.thumbnail_url ? [post.thumbnail_url] : undefined,
    },
    alternates: {
      canonical: `${SITE_URL}/posts/${post.post_number}`,
    },
  };
}

export function buildPostJsonLd(post: Post) {
  const excerpt = getExcerpt(post.content);

  const faqNodes =
    Array.isArray(post.faq) && post.faq.length > 0
      ? [
          {
            '@type': 'FAQPage',
            mainEntity: post.faq.map((item: FaqItem) => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: { '@type': 'Answer', text: item.a },
            })),
          },
        ]
      : [];

  const mentionEntities =
    Array.isArray(post.mentions) && post.mentions.length > 0
      ? post.mentions.map((m: MentionItem) => ({
          '@type': m.type,
          name: m.name,
        }))
      : undefined;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: post.title,
        description: excerpt || undefined,
        image: post.thumbnail_url ?? undefined,
        datePublished: post.published_at,
        dateModified: post.updated_at,
        inLanguage: 'ko',
        keywords: (post.tags ?? []).join(', ') || undefined,
        about:
          post.tags?.length > 0
            ? post.tags.map(t => ({ '@type': 'Thing', name: t }))
            : undefined,
        mentions: mentionEntities,
        author: post.author
          ? {
              '@type': 'Person',
              name: post.author.display_name,
              url: `${SITE_URL}/authors/${post.author.id}`,
              worksFor: { '@type': 'Organization', name: 'AUCTORITAS LAB' },
            }
          : undefined,
        publisher: {
          '@type': 'Organization',
          name: 'AUCTORITAS LAB',
          url: SITE_URL,
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${SITE_URL}/posts/${post.post_number}`,
        },
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['.arthead__title', '.arthead__meta'],
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '홈', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: post.title },
        ],
      },
      ...faqNodes,
    ],
  };
}

const AUTHORS_TITLE = '집필진';
const AUTHORS_DESC =
  '모든 아티클은 그 분야를 직접 다루는 변호사가 판례와 실무를 근거로 씁니다. 글을 쓴 변호사의 약력과 담당 분야를 확인해 보세요.';

export const authorsListMetadata: Metadata = {
  title: AUTHORS_TITLE,
  description: AUTHORS_DESC,
  openGraph: {
    type: 'website',
    title: `${AUTHORS_TITLE} — ${SITE_NAME}`,
    description: AUTHORS_DESC,
    locale: 'ko_KR',
    siteName: SITE_NAME,
  },
  alternates: { canonical: `${SITE_URL}/authors` },
};

/** /authors — CollectionPage + ItemList<Person>. */
export function buildAuthorsListJsonLd(authors: AuthorListItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${AUTHORS_TITLE} — ${SITE_NAME}`,
    description: AUTHORS_DESC,
    url: `${SITE_URL}/authors`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: authors.length,
      itemListElement: authors.map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}/authors/${a.id}`,
        item: {
          '@type': 'Person',
          name: a.display_name,
          description: a.bio ?? undefined,
          image: a.avatar_url ?? undefined,
          url: `${SITE_URL}/authors/${a.id}`,
          worksFor: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        },
      })),
    },
  };
}

export function buildAuthorMetadata(author: AuthorDetail): Metadata {
  const title = author.display_name;
  const description =
    author.bio?.trim() ||
    `${author.display_name} 변호사가 쓴 ${author.post_count}편의 판례·실무 아티클.`;
  const images = author.avatar_url
    ? [
        {
          url: author.avatar_url,
          width: 600,
          height: 600,
          alt: author.display_name,
        },
      ]
    : [];

  return {
    title,
    description,
    openGraph: {
      type: 'profile',
      title: `${title} — ${SITE_NAME}`,
      description,
      images,
      locale: 'ko_KR',
      siteName: SITE_NAME,
    },
    twitter: {
      card: author.avatar_url ? 'summary' : 'summary_large_image',
      title: `${title} — ${SITE_NAME}`,
      description,
      images: author.avatar_url ? [author.avatar_url] : undefined,
    },
    alternates: { canonical: `${SITE_URL}/authors/${author.id}` },
  };
}

/** /authors/{id} — ProfilePage > Person + BreadcrumbList. E-E-A-T 권위 신호의 핵심. */
export function buildAuthorJsonLd(author: AuthorDetail) {
  const url = `${SITE_URL}/authors/${author.id}`;
  const person = {
    '@type': 'Person',
    name: author.display_name,
    description: author.bio ?? undefined,
    image: author.avatar_url ?? undefined,
    url,
    worksFor: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    subjectOf: author.posts.slice(0, 10).map(p => ({
      '@type': 'Article',
      headline: p.title,
      url: `${SITE_URL}/posts/${p.post_number}`,
    })),
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        url,
        name: `${author.display_name} — ${SITE_NAME}`,
        mainEntity: person,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '홈', item: SITE_URL },
          {
            '@type': 'ListItem',
            position: 2,
            name: '집필진',
            item: `${SITE_URL}/authors`,
          },
          { '@type': 'ListItem', position: 3, name: author.display_name },
        ],
      },
    ],
  };
}
