# Journal Homepage UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `design/` 폴더의 정적 HTML/CSS/JS 디자인을 Next.js App Router + Supabase 데이터 연동으로 완전히 이식한다.

**Architecture:** 홈페이지(/)는 Server Component가 전체 포스트 목록을 Supabase에서 가져와 Client Component에 전달, 클라이언트 필터링을 수행한다. 아티클 상세(/posts/[slug])는 Server Component가 포스트·관련글을 fetch하고, 목차 스크롤 스파이는 Client Component(`TocWatcher`)가 담당한다. 디자인 CSS(`ds-system.css`, `journal.css`)는 전역 CSS로 그대로 임포트하여 `data-*` attribute 기반 CSS 스위칭을 유지한다.

**Tech Stack:** Next.js 15 App Router, TypeScript, Supabase SSR, vanilla-extract(기존 유지), plain CSS(ds-system + journal), React 18 Client Components

---

## 파일 구조 (생성/수정 대상)

```
src/
  styles/
    ds-system.css        ← design/ds-system.css 복사 (--accent #3B82F6 고정)
    journal.css          ← design/journal.css 복사
  utils/
    reading-time.ts      ← HTML에서 읽기 시간 계산
    toc.ts               ← HTML h2 추출 + id 주입
    format.ts            ← 날짜 포맷팅 (디자인과 동일)
    icons.ts             ← ICON SVG 상수 (design/data.js ICON.* 이식)
  components/
    SiteHeader.tsx       ← Client: 스크롤 숨김/복원
    SiteFooter.tsx       ← Server: 정적 푸터
    FeaturedCarousel.tsx ← Client: 5초 자동전환 캐러셀
    ArticleList.tsx      ← Client: 필터 + 카드 그리드 (모든 인터랙션)
    PageInit.tsx         ← Client: data-page 속성 설정
    TweaksPanel.tsx      ← Client: tweaks-panel.jsx + tweaks-journal.jsx 이식
  lib/
    posts.ts             ← getAllPosts(), getCategories(), 관련글 스코어링 추가
    metadata.ts          ← AUCTORITAS LAB SEO 값으로 업데이트
  app/
    layout.tsx           ← html attrs, FOUC 스크립트, CSS 임포트
    globals.css          ← 최소 reset만 (CSS 임포트 layout으로 이동)
    page.tsx             ← 홈페이지: Server Component
    (blog)/posts/[slug]/
      page.tsx           ← 아티클 상세: Server Component
    sitemap.ts           ← AUCTORITAS LAB URL로 업데이트
```

---

## Task 1: CSS 파일 복사 + globals.css 정리

**Files:**
- Create: `src/styles/ds-system.css`
- Create: `src/styles/journal.css`
- Modify: `src/app/globals.css`

- [ ] **Step 1: design/ds-system.css → src/styles/ds-system.css 복사**

`design/ds-system.css`를 `src/styles/ds-system.css`로 복사한다. 단, `:root`의 `--accent` 값을 `#0EA5E9`에서 `#3B82F6`으로 변경한다 (디자인 데이터에서 항상 `#3B82F6`으로 고정하기 때문).

실제 파일: `design/ds-system.css`의 14번째 줄 `--accent: #0EA5E9;` → `--accent: #3B82F6;` 변경 후 복사.

- [ ] **Step 2: design/journal.css → src/styles/journal.css 복사**

`design/journal.css`를 `src/styles/journal.css`로 복사한다. `--accent: #7C1D2B;`(버건디)는 `#3B82F6`으로 변경.

```css
/* src/styles/journal.css :root 첫 줄 */
:root {
  --accent: #3B82F6;   /* 고정 accent (ds-system 기본값과 통일) */
  --measure: 68ch;
  --wrap: 1180px;
  --headerH: 64px;
  --bg: #FFFFFF;
}
```

- [ ] **Step 3: globals.css 단순화**

```css
/* src/app/globals.css */
/* ds-system.css와 journal.css는 layout.tsx에서 임포트 */
/* vanilla-extract .css.ts 파일들은 각 컴포넌트가 담당 */

:root {
  --font-sans: "";
}
```

- [ ] **Step 4: 커밋**

```bash
git add src/styles/ds-system.css src/styles/journal.css src/app/globals.css
git commit -m "feat: copy design CSS to src/styles (accent fixed to #3B82F6)"
```

---

## Task 2: layout.tsx 업데이트 (html attrs + FOUC 스크립트 + 폰트)

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: layout.tsx 교체**

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import { defaultMetadata } from "@/lib/metadata";
import "@/styles/ds-system.css";
import "@/styles/journal.css";
import "./globals.css";

// FOUC 방지: localStorage 트윅을 첫 페인트 전에 html 속성으로 적용
const FOUC_SCRIPT = `(function(){try{
  var d=JSON.parse(localStorage.getItem("auctoritas.tweaks.v4")||"{}"),r=document.documentElement;
  r.style.setProperty("--accent","#3B82F6");
  if(d.font)r.setAttribute("data-font",d.font);
  r.setAttribute("data-thumb",d.thumb||"on");
  r.setAttribute("data-shape","rounded");
  r.setAttribute("data-carousel","overlay");
  r.setAttribute("data-card","list");
  r.setAttribute("data-filter","rail");
  r.setAttribute("data-tagstyle",d.tagstyle||"hash");
  if(d.reading)r.setAttribute("data-reading",d.reading);
}catch(e){}})();`;

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ko"
      data-shape="rounded"
      data-carousel="overlay"
      data-card="list"
      data-thumb="on"
      data-filter="rail"
      data-tagstyle="hash"
      data-font="pretendard"
      data-reading="railed"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: FOUC_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: 빌드 확인**

```bash
pnpm build 2>&1 | tail -20
```

Expected: No TypeScript errors, build succeeds.

- [ ] **Step 3: 커밋**

```bash
git add src/app/layout.tsx
git commit -m "feat: add FOUC script and design system html attrs to layout"
```

---

## Task 3: 유틸리티 함수 작성

**Files:**
- Create: `src/utils/reading-time.ts`
- Create: `src/utils/toc.ts`
- Create: `src/utils/format.ts`
- Create: `src/utils/icons.ts`

- [ ] **Step 1: reading-time.ts**

```typescript
// src/utils/reading-time.ts
export function calcReadingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  // 한국어 기준 분당 ~500자 읽기 속도
  const chars = text.length;
  return Math.max(1, Math.ceil(chars / 500));
}
```

- [ ] **Step 2: toc.ts**

```typescript
// src/utils/toc.ts
export type Heading = { id: string; text: string };

/** HTML에서 h2 헤딩을 추출하여 목차 데이터 반환 */
export function extractHeadings(html: string): Heading[] {
  const headings: Heading[] = [];
  let i = 0;
  const re = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const text = m[1].replace(/<[^>]+>/g, "").trim();
    headings.push({ id: `sec-${i + 1}`, text });
    i++;
  }
  return headings;
}

/** HTML의 각 h2에 id="sec-N" 주입 */
export function injectHeadingIds(html: string): string {
  let i = 0;
  return html.replace(/<h2([^>]*)>/gi, (_, attrs) => {
    // 이미 id가 있으면 덮어쓰지 않음
    if (/\bid=/.test(attrs)) return `<h2${attrs}>`;
    return `<h2${attrs} id="sec-${++i}">`;
  });
}
```

- [ ] **Step 3: format.ts**

```typescript
// src/utils/format.ts
export function fmtDate(iso: string, opt: "long" | "short" = "long"): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if (opt === "short") {
    return `${y}.${String(m).padStart(2, "0")}.${String(day).padStart(2, "0")}`;
  }
  return `${y}년 ${m}월 ${day}일`;
}
```

- [ ] **Step 4: icons.ts (design/data.js의 ICON.* 이식)**

```typescript
// src/utils/icons.ts
export const ICON = {
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
  cal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>`,
  tag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.6 2.6 21 11a2 2 0 0 1 0 2.8l-6.2 6.2a2 2 0 0 1-2.8 0L3.6 11.6A2 2 0 0 1 3 10.2V4a1 1 0 0 1 1-1h6.2a2 2 0 0 1 1.4.6Z"/><circle cx="7.5" cy="7.5" r="1.2" fill="currentColor"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  insta: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>`,
  link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5"/></svg>`,
  chevron: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
  filter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h18l-7 8v6l-4-2v-4Z"/></svg>`,
  quote: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h4v6c0 2.5-1.6 4.3-4 5l-.6-1.6C7.7 15.9 8.6 15 8.7 14H7Zm9 0h4v6c0 2.5-1.6 4.3-4 5l-.6-1.6c1.3-.5 2.2-1.4 2.3-2.4H16Z"/></svg>`,
} as const;
```

- [ ] **Step 5: TypeScript 확인 + 커밋**

```bash
pnpm tsc --noEmit 2>&1 | head -20
git add src/utils/
git commit -m "feat: add reading-time, toc, format, icons utilities"
```

---

## Task 4: lib/posts.ts 확장

**Files:**
- Modify: `src/lib/posts.ts`

Supabase에서 홈페이지/필터에 필요한 데이터를 가져오는 함수들을 추가한다.

- [ ] **Step 1: getAllPosts 추가 (클라이언트 측 필터링용 전체 목록)**

`src/lib/posts.ts`에 다음 함수 추가:

```typescript
// 모든 발행된 포스트 (홈 클라이언트 필터링용)
export async function getAllPosts(): Promise<PostListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(
      `id, slug, title, excerpt, cover_image_url, published_at, created_at,
       author:authors(id, name, avatar_url),
       category:categories(id, name, slug),
       tags(id, name, slug)`,
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as PostListItem[];
}
```

- [ ] **Step 2: getCategories 추가**

```typescript
export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .order("name");
  if (error) throw error;
  return (data ?? []) as Category[];
}
```

- [ ] **Step 3: scoreRelatedPosts 헬퍼 추가 (DB 쿼리 없음, 앱 레이어 계산)**

```typescript
// 관련 포스트 스코어링: 같은 카테고리 +3 / 같은 저자 +1 / 공유 태그당 +2
export function scoreRelatedPosts(
  current: Post,
  candidates: PostListItem[],
  limit = 3,
): PostListItem[] {
  const currentTagSlugs = current.tags?.map((t) => t.slug) ?? [];

  const scored = candidates
    .filter((p) => p.id !== current.id)
    .map((p) => {
      let score = 0;
      if (p.category?.id === current.category_id) score += 3;
      if (p.author?.id === current.author_id) score += 1;
      const pTagSlugs = p.tags?.map((t) => t.slug) ?? [];
      score += pTagSlugs.filter((t) => currentTagSlugs.includes(t)).length * 2;
      return { p, score };
    });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const da = a.p.published_at ?? a.p.created_at;
    const db = b.p.published_at ?? b.p.created_at;
    return db.localeCompare(da);
  });

  return scored.slice(0, limit).map((x) => x.p);
}
```

- [ ] **Step 4: TypeScript 확인**

```bash
pnpm tsc --noEmit 2>&1 | head -20
```

Expected: No errors.

- [ ] **Step 5: 커밋**

```bash
git add src/lib/posts.ts
git commit -m "feat: add getAllPosts, getCategories, scoreRelatedPosts to lib/posts"
```

---

## Task 5: lib/metadata.ts 업데이트

**Files:**
- Modify: `src/lib/metadata.ts`

AUCTORITAS LAB 정보로 SEO 메타데이터를 업데이트한다.

- [ ] **Step 1: defaultMetadata 업데이트**

```typescript
// src/lib/metadata.ts
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fightingspirit.kr";
const SITE_NAME = "AUCTORITAS LAB";
const SITE_DESCRIPTION =
  "공사대금·부동산·임대차 등 공간분쟁을 판례와 실무 기준으로 정리하는 법률 저널. 공간분쟁 전문 변호사팀이 직접 씁니다.";

export const defaultMetadata: Metadata = {
  title: {
    default: "공간을 둘러싼 분쟁, 법으로 풀어내다 — AUCTORITAS LAB",
    template: `%s — AUCTORITAS LAB`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "ko_KR",
    title: "공간을 둘러싼 분쟁, 법으로 풀어내다 — AUCTORITAS LAB",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
  alternates: { canonical: SITE_URL },
};

// JSON-LD LegalService (홈페이지용)
export function buildSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: "AUCTORITAS LAB",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    telephone: "+82-31-546-3997",
    faxNumber: "+82-31-546-3998",
    email: "info@fightingspirit.kr",
    areaServed: "KR",
    knowsAbout: ["공사대금", "부동산매매", "임대차", "재개발", "명도소송", "유치권"],
    address: {
      "@type": "PostalAddress",
      streetAddress: "광교중앙로 248번길 7-2 원희캐슬법조타운 B동 401호",
      addressLocality: "수원시 영통구",
      addressRegion: "경기도",
      addressCountry: "KR",
    },
    sameAs: ["https://fightingspirit.kr", "https://instagram.com/auctoritas_journal"],
  };
}
```

`buildPostJsonLd`는 기존 것을 유지하되 `"@type"` 을 `"BlogPosting"`으로 변경하고, `author.worksFor`를 추가:

```typescript
export function buildPostJsonLd(post: Post) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt,
        image: post.cover_image_url,
        datePublished: post.published_at,
        dateModified: post.updated_at,
        inLanguage: "ko",
        articleSection: post.category?.name,
        keywords: post.tags?.map((t) => t.name).join(", "),
        author: post.author
          ? {
              "@type": "Person",
              name: post.author.name,
              worksFor: { "@type": "Organization", name: "AUCTORITAS LAB" },
            }
          : undefined,
        publisher: {
          "@type": "Organization",
          name: "AUCTORITAS LAB",
          url: SITE_URL,
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${SITE_URL}/posts/${post.slug}`,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
          post.category && {
            "@type": "ListItem",
            position: 2,
            name: post.category.name,
            item: `${SITE_URL}/?cat=${post.category.slug}`,
          },
          { "@type": "ListItem", position: 3, name: post.title },
        ].filter(Boolean),
      },
    ],
  };
}
```

- [ ] **Step 2: TypeScript 확인**

```bash
pnpm tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: 커밋**

```bash
git add src/lib/metadata.ts
git commit -m "feat: update metadata for AUCTORITAS LAB (LegalService JSON-LD)"
```

---

## Task 6: SiteHeader 컴포넌트

**Files:**
- Create: `src/components/SiteHeader.tsx`

- [ ] **Step 1: SiteHeader.tsx 작성**

```tsx
// src/components/SiteHeader.tsx
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

export function SiteHeader() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = ref.current;
    if (!header) return;
    let lastY = window.scrollY;
    let ticking = false;

    function update() {
      const y = window.scrollY;
      const delta = y - lastY;
      if (Math.abs(delta) > 6) {
        if (delta > 0 && y > 80) header.setAttribute("data-hidden", "true");
        else header.removeAttribute("data-hidden");
        lastY = y;
      }
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="site-header" ref={ref}>
      <div className="site-header__in">
        <Link className="brand" href="/">
          AUCTORITAS LAB
        </Link>
        <span className="site-header__spacer" />
        <a className="site-header__cta" href="#site-footer">
          <span>상담 문의</span>
        </a>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: TypeScript 확인**

```bash
pnpm tsc --noEmit 2>&1 | head -5
```

- [ ] **Step 3: 커밋**

```bash
git add src/components/SiteHeader.tsx
git commit -m "feat: add SiteHeader client component with scroll hide/reveal"
```

---

## Task 7: SiteFooter 컴포넌트

**Files:**
- Create: `src/components/SiteFooter.tsx`

- [ ] **Step 1: SiteFooter.tsx 작성**

design/footer.js의 `renderFooter()` 함수를 JSX로 이식한다.

```tsx
// src/components/SiteFooter.tsx
import { ICON } from "@/utils/icons";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer" id="site-footer">
      <div className="site-footer__in">
        <div className="footer-grid">
          <div className="footer-brand">
            <a className="brand" href="/">AUCTORITAS LAB</a>
            <p className="footer-about">
              공간분쟁 전문 변호사팀이 직접 쓰는 판례·실무 저널.
              공사대금·부동산·임대차 등 공간을 둘러싼 분쟁을 판례와 실무 기준으로 기록합니다.
            </p>
            <p className="footer-quote">공간을 둘러싼 분쟁, 법으로 풀어내다.</p>
          </div>
          <div className="footer-col">
            <h4>저널</h4>
            <div className="footer-contact">
              <a href="/">홈</a>
              <a href="https://instagram.com/auctoritas_journal" target="_blank" rel="noopener">
                <span dangerouslySetInnerHTML={{ __html: ICON.insta }} />
                <span>@auctoritas_journal</span>
              </a>
              <a href="https://fightingspirit.kr" target="_blank" rel="noopener">
                <span dangerouslySetInnerHTML={{ __html: ICON.link }} />
                <span>fightingspirit.kr</span>
              </a>
            </div>
          </div>
          <div className="footer-col">
            <h4>문의</h4>
            <div className="footer-contact">
              <a href="tel:0315463997">
                <span dangerouslySetInnerHTML={{ __html: ICON.phone }} />
                <span>031-546-3997</span>
              </a>
              <span>
                <span dangerouslySetInnerHTML={{ __html: ICON.phone }} />
                <span>031-546-3998 (FAX)</span>
              </span>
              <a href="mailto:info@fightingspirit.kr">
                <span dangerouslySetInnerHTML={{ __html: ICON.mail }} />
                <span>info@fightingspirit.kr</span>
              </a>
              <span>
                <span dangerouslySetInnerHTML={{ __html: ICON.pin }} />
                <span>경기도 수원시 영통구 광교중앙로 248번길 7-2 원희캐슬법조타운 B동 401호</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {year} AUCTORITAS LAB. 본 저널의 글은 일반적 정보 제공을 목적으로 하며,
          개별 사안에 대한 법률자문을 대체하지 않습니다.
        </span>
      </div>
    </footer>
  );
}
```

> **주의**: `dangerouslySetInnerHTML`로 SVG를 주입할 때 XSS 위험 없음 — `ICON.*` 는 소스에 하드코딩된 문자열이므로 안전.

- [ ] **Step 2: 커밋**

```bash
git add src/components/SiteFooter.tsx
git commit -m "feat: add SiteFooter server component"
```

---

## Task 8: PageInit 컴포넌트

**Files:**
- Create: `src/components/PageInit.tsx`

- [ ] **Step 1: PageInit.tsx 작성**

`<html data-page="home"|"detail">` 속성을 클라이언트 측에서 설정한다. TweaksPanel이 이 속성을 읽어 페이지별 컨트롤을 표시한다.

```tsx
// src/components/PageInit.tsx
"use client";

import { useEffect } from "react";

interface Props {
  page: "home" | "detail";
}

export function PageInit({ page }: Props) {
  useEffect(() => {
    document.documentElement.setAttribute("data-page", page);
  }, [page]);
  return null;
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/components/PageInit.tsx
git commit -m "feat: add PageInit client component for data-page attribute"
```

---

## Task 9: FeaturedCarousel 컴포넌트

**Files:**
- Create: `src/components/FeaturedCarousel.tsx`

design/index.html의 `buildCarousel()` + `goSlide()` + `wireCarousel()` 로직을 React Client Component로 이식한다.

- [ ] **Step 1: FeaturedCarousel.tsx 작성**

```tsx
// src/components/FeaturedCarousel.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import type { PostListItem } from "@/types";
import { ICON } from "@/utils/icons";
import { fmtDate } from "@/utils/format";

interface Props {
  posts: PostListItem[];
}

const DELAY = 5000;

export function FeaturedCarousel({ posts }: Props) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const n = posts.length;

  const goSlide = useCallback(
    (i: number) => setCurrent(((i % n) + n) % n),
    [n],
  );

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % n), DELAY);
  }, [n]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    startTimer();
    const onVis = () => (document.hidden ? stopTimer() : startTimer());
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stopTimer();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [startTimer, stopTimer]);

  if (!posts.length) return null;

  return (
    <section className="wrap" aria-label="대표 아티클" aria-roledescription="carousel">
      <div
        className="carousel"
        onMouseEnter={stopTimer}
        onMouseLeave={startTimer}
      >
        <div
          className="carousel__track"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {posts.map((post, i) => (
            <a
              key={post.id}
              className={`cslide${i === current ? " is-active" : ""}`}
              href={`/posts/${post.slug}`}
              aria-hidden={i !== current}
            >
              <span className="cslide__media">
                {post.cover_image_url ? (
                  <Image
                    src={post.cover_image_url}
                    alt=""
                    fill
                    style={{ objectFit: "cover" }}
                    priority={i === 0}
                    sizes="(max-width: 720px) 100vw, 1180px"
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "var(--ink-bg)" }} />
                )}
              </span>
              <span className="cslide__shade" />
              <span className="cslide__inner">
                <span className="cslide__cat eyebrow">
                  {post.category?.name ?? ""}
                </span>
                <span className="cslide__title">{post.title}</span>
                <span className="cslide__excerpt">{post.excerpt}</span>
                <span className="cslide__meta">
                  <span
                    className="avatar"
                    style={{ width: 30, height: 30, fontSize: 13, fontWeight: 700 }}
                    aria-hidden="true"
                  />
                  <span>
                    {post.author?.name ?? "AUCTORITAS"}
                    <span className="dotsep" aria-hidden="true">·</span>
                    {post.published_at
                      ? fmtDate(post.published_at, "long")
                      : ""}
                  </span>
                </span>
              </span>
            </a>
          ))}
        </div>

        {/* 화살표 */}
        <button
          className="carousel__arrow carousel__arrow--prev"
          aria-label="이전 슬라이드"
          onClick={(e) => { e.preventDefault(); goSlide(current - 1); startTimer(); }}
          dangerouslySetInnerHTML={{ __html: ICON.chevron }}
        />
        <button
          className="carousel__arrow carousel__arrow--next"
          aria-label="다음 슬라이드"
          onClick={(e) => { e.preventDefault(); goSlide(current + 1); startTimer(); }}
          dangerouslySetInnerHTML={{ __html: ICON.chevron }}
        />

        {/* 점 */}
        <div className="carousel__dots" role="tablist" aria-label="슬라이드 선택">
          {posts.map((post, i) => (
            <button
              key={post.id}
              className={`cdot${i === current ? " is-on" : ""}`}
              role="tab"
              aria-selected={i === current}
              aria-label={`${i + 1}번 슬라이드: ${post.title}`}
              onClick={(e) => { e.preventDefault(); goSlide(i); startTimer(); }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: TypeScript 확인**

```bash
pnpm tsc --noEmit 2>&1 | head -10
```

- [ ] **Step 3: 커밋**

```bash
git add src/components/FeaturedCarousel.tsx
git commit -m "feat: add FeaturedCarousel client component (5s auto-advance)"
```

---

## Task 10: ArticleList 컴포넌트 (필터 + 그리드)

**Files:**
- Create: `src/components/ArticleList.tsx`

design/index.html의 `state` + `filterArticles()` + `renderFilters()` + `renderResults()` + `wireFilters()` + `wireResults()` 전체를 단일 React Client Component로 이식한다.

이 컴포넌트가 가장 복잡하다. 단계별로 구현한다.

- [ ] **Step 1: 타입 및 헬퍼 정의**

```tsx
// src/components/ArticleList.tsx
"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type { PostListItem, Category } from "@/types";
import { ICON } from "@/utils/icons";
import { fmtDate } from "@/utils/format";
import { calcReadingTime } from "@/utils/reading-time";

interface FilterState {
  q: string;
  cat: string;
  tags: string[];
  archive: string;
  sort: "new" | "old";
}

interface ArchiveItem {
  key: string;   // "YYYY-MM"
  label: string; // "2026년 5월"
  count: number;
}

interface Props {
  posts: PostListItem[];
  categories: Category[];
  /** URL에서 읽은 초기 필터 (cat, tag) */
  initialCat?: string;
  initialTag?: string;
}
```

- [ ] **Step 2: 파생 데이터 계산 (allTags, archiveDates, catCounts)**

```tsx
export function ArticleList({ posts, categories, initialCat, initialTag }: Props) {
  const [state, setState] = useState<FilterState>({
    q: "",
    cat: initialCat ?? "all",
    tags: initialTag ? [initialTag] : [],
    archive: "all",
    sort: "new",
  });

  // 모든 태그 (출현 빈도순)
  const allTags = useMemo(() => {
    const m = new Map<string, { slug: string; name: string; count: number }>();
    posts.forEach((p) =>
      p.tags?.forEach((t) => {
        const e = m.get(t.slug);
        if (e) e.count++;
        else m.set(t.slug, { slug: t.slug, name: t.name, count: 1 });
      }),
    );
    return Array.from(m.values()).sort((a, b) => b.count - a.count);
  }, [posts]);

  // 아카이브 연-월 목록
  const archiveDates = useMemo<ArchiveItem[]>(() => {
    const m = new Map<string, number>();
    posts.forEach((p) => {
      if (!p.published_at) return;
      const key = p.published_at.slice(0, 7);
      m.set(key, (m.get(key) ?? 0) + 1);
    });
    return Array.from(m.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, count]) => {
        const [y, mo] = key.split("-");
        return { key, label: `${y}년 ${parseInt(mo)}월`, count };
      });
  }, [posts]);

  // 카테고리별 포스트 수
  const catCount = useCallback(
    (slug: string) => posts.filter((p) => p.category?.slug === slug).length,
    [posts],
  );
```

- [ ] **Step 3: 필터링 로직**

```tsx
  const filtered = useMemo(() => {
    const q = state.q.trim().toLowerCase();
    return posts
      .filter((p) => {
        if (state.cat !== "all" && p.category?.slug !== state.cat) return false;
        if (state.archive !== "all") {
          if (!p.published_at || !p.published_at.startsWith(state.archive))
            return false;
        }
        if (state.tags.length) {
          const pSlugs = p.tags?.map((t) => t.slug) ?? [];
          if (!state.tags.every((t) => pSlugs.includes(t))) return false;
        }
        if (q) {
          const hay = [
            p.title,
            p.excerpt ?? "",
            p.tags?.map((t) => t.name).join(" ") ?? "",
            p.author?.name ?? "",
            p.category?.name ?? "",
          ]
            .join(" ")
            .toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const da = a.published_at ?? a.created_at;
        const db = b.published_at ?? b.created_at;
        return state.sort === "new"
          ? db.localeCompare(da)
          : da.localeCompare(db);
      });
  }, [posts, state]);
```

- [ ] **Step 4: URL 동기화 + update 헬퍼**

```tsx
  const syncURL = useCallback((s: FilterState) => {
    const p = new URLSearchParams();
    if (s.cat !== "all") p.set("cat", s.cat);
    if (s.tags.length === 1) p.set("tag", s.tags[0]);
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, []);

  const update = useCallback(
    (patch: Partial<FilterState>) => {
      setState((prev) => {
        const next = { ...prev, ...patch };
        syncURL(next);
        return next;
      });
    },
    [syncURL],
  );
```

- [ ] **Step 5: JSON-LD ItemList 업데이트 (useEffect)**

```tsx
  // 필터 결과에 따라 ld-list JSON-LD 갱신
  useEffect(() => {
    const el = document.getElementById("ld-list");
    if (!el) return;
    const data = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "AUCTORITAS LAB 아티클",
      numberOfItems: filtered.length,
      itemListElement: filtered.slice(0, 20).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${window.location.origin}/posts/${p.slug}`,
        name: p.title,
      })),
    };
    el.textContent = JSON.stringify(data);
  }, [filtered]);
```

- [ ] **Step 6: 활성 필터 칩 계산**

```tsx
  type ActiveChip = { type: string; val?: string; label: string };
  const activeChips = useMemo<ActiveChip[]>(() => {
    const chips: ActiveChip[] = [];
    if (state.cat !== "all") {
      const cat = categories.find((c) => c.slug === state.cat);
      if (cat) chips.push({ type: "cat", label: cat.name });
    }
    if (state.archive !== "all") {
      const arc = archiveDates.find((a) => a.key === state.archive);
      if (arc) chips.push({ type: "archive", label: arc.label });
    }
    state.tags.forEach((t) => {
      const tag = allTags.find((a) => a.slug === t);
      chips.push({ type: "tag", val: t, label: `#${tag?.name ?? t}` });
    });
    if (state.q.trim()) chips.push({ type: "q", label: `"${state.q.trim()}"` });
    return chips;
  }, [state, categories, archiveDates, allTags]);

  function clearChip(type: string, val?: string) {
    if (type === "cat") update({ cat: "all" });
    else if (type === "archive") update({ archive: "all" });
    else if (type === "q") update({ q: "" });
    else if (type === "tag" && val) {
      update({ tags: state.tags.filter((t) => t !== val) });
    }
  }
```

- [ ] **Step 7: fmore 토글 상태**

```tsx
  const [fmoreOpen, setFmoreOpen] = useState(false);

  useEffect(() => {
    if (fmoreOpen) document.documentElement.setAttribute("data-fmore", "open");
    else document.documentElement.removeAttribute("data-fmore");
  }, [fmoreOpen]);
```

- [ ] **Step 8: JSX 렌더 — 필터 사이드바**

```tsx
  return (
    <section className="wrap home-articles" id="articles" aria-label="아티클">
      <div className="listbody">
        {/* ── 필터 사이드바 ── */}
        <aside className="filters" aria-label="필터">
          {/* 검색 */}
          <div className="fsearch fgroup">
            <span dangerouslySetInnerHTML={{ __html: ICON.search }} />
            <input
              id="q"
              type="search"
              placeholder="키워드로 검색 (예: 유치권, 권리금)"
              value={state.q}
              aria-label="키워드 검색"
              onChange={(e) => update({ q: e.target.value })}
            />
          </div>

          {/* 아카이브 select (모바일 바 모드용) */}
          <div className="barselects">
            <select
              id="bar-archive"
              aria-label="기간"
              value={state.archive}
              onChange={(e) => update({ archive: e.target.value })}
            >
              <option value="all">전체 기간</option>
              {archiveDates.map((a) => (
                <option key={a.key} value={a.key}>{a.label}</option>
              ))}
            </select>
          </div>

          {/* 카테고리 */}
          <div className="fgroup fgroup--cat">
            <div className="fgroup__label">카테고리</div>
            <div className="fcat">
              <button
                data-cat="all"
                aria-pressed={state.cat === "all"}
                onClick={() => update({ cat: "all" })}
              >
                전체<span className="fcat__count">{posts.length}</span>
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  data-cat={c.slug}
                  aria-pressed={state.cat === c.slug}
                  onClick={() => update({ cat: c.slug })}
                >
                  {c.name}
                  <span className="fcat__count">{catCount(c.slug)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 태그·아카이브 접힘 토글 */}
          <button
            type="button"
            className="fmore-toggle"
            id="fmoreToggle"
            aria-expanded={fmoreOpen}
            aria-controls="fmore"
            onClick={() => setFmoreOpen((v) => !v)}
          >
            <span>태그 · 아카이브</span>
            <span dangerouslySetInnerHTML={{ __html: ICON.chevron }} />
          </button>

          {/* fmore 영역 (태그 + 아카이브) */}
          <div className="fmore" id="fmore">
            {/* 태그 */}
            <div className="fgroup fgroup--tags">
              <div className="fgroup__label">태그</div>
              <div className="fchips">
                {allTags.map((t) => (
                  <button
                    key={t.slug}
                    className="fchip"
                    data-tag={t.slug}
                    aria-pressed={state.tags.includes(t.slug)}
                    onClick={() => {
                      const i = state.tags.indexOf(t.slug);
                      update({
                        tags:
                          i > -1
                            ? state.tags.filter((x) => x !== t.slug)
                            : [...state.tags, t.slug],
                      });
                    }}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 아카이브 */}
            <div className="fgroup fgroup--archive">
              <div className="fgroup__label">아카이브</div>
              <div className="farchive">
                {archiveDates.map((a) => (
                  <button
                    key={a.key}
                    data-archive={a.key}
                    aria-pressed={state.archive === a.key}
                    onClick={() =>
                      update({
                        archive: state.archive === a.key ? "all" : a.key,
                      })
                    }
                  >
                    {a.label}
                    <span className="farchive__count">{a.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ── 결과 영역 ── */}
        <section className="results" aria-live="polite">
          {/* 결과 바 */}
          <div className="results__bar">
            <div className="results__count">
              <b>총 {filtered.length}</b>건의 아티클
            </div>
            {activeChips.length > 0 && (
              <div className="results__active">
                {activeChips.map((c, i) => (
                  <button
                    key={i}
                    className="activechip"
                    onClick={() => clearChip(c.type, c.val)}
                  >
                    {c.label}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
                      <path d="M6 6l12 12M18 6 6 18" />
                    </svg>
                  </button>
                ))}
                <button
                  className="results__clear"
                  onClick={() =>
                    update({ q: "", cat: "all", tags: [], archive: "all" })
                  }
                >
                  모두 지우기
                </button>
              </div>
            )}
          </div>

          {/* 카드 그리드 */}
          {filtered.length > 0 ? (
            <div className="cardgrid">
              {filtered.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <h3>조건에 맞는 아티클이 없어요</h3>
              <p>필터를 줄이거나 다른 키워드로 검색해 보세요.</p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
```

- [ ] **Step 9: PostCard 인라인 함수 추가 (design의 cardHTML 이식)**

`ArticleList.tsx` 아래에 `PostCard` 컴포넌트를 추가한다:

```tsx
function PostCard({ post }: { post: PostListItem }) {
  const tags = (post.tags ?? []).slice(0, 3);
  const readingTime = calcReadingTime(post.excerpt ?? "");
  const dateStr = post.published_at
    ? fmtDate(post.published_at, "short")
    : "";

  return (
    <article className="pcard" data-cat={post.category?.slug ?? ""}>
      <a className="pcard__link" href={`/posts/${post.slug}`} aria-label={post.title}>
        <span className="pcard__thumb">
          {post.cover_image_url ? (
            <img
              src={post.cover_image_url}
              alt=""
              loading="lazy"
              width={1600}
              height={900}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "var(--surface-2)" }} />
          )}
          <span className="pcard__cat eyebrow">{post.category?.name ?? ""}</span>
        </span>
        <span className="pcard__body">
          <span className="pcard__kicker eyebrow">{post.category?.name ?? ""}</span>
          <h3 className="pcard__title">{post.title}</h3>
          {post.excerpt && (
            <p className="pcard__excerpt">{post.excerpt}</p>
          )}
          <span className="pcard__tags">
            {tags.map((t) => (
              <span key={t.slug} className="ptag">{t.name}</span>
            ))}
          </span>
          <span className="pcard__foot">
            <span
              className="avatar"
              style={{ width: 24, height: 24, fontSize: 11, fontWeight: 700 }}
              aria-hidden="true"
            />
            <span className="pcard__who">
              <span className="pcard__by">AUCTORITAS</span>
            </span>
            <span className="pcard__metaline">
              {dateStr && <time dateTime={post.published_at ?? ""}>{dateStr}</time>}
              <span className="dotsep" aria-hidden="true">·</span>
              {readingTime}분
            </span>
          </span>
        </span>
      </a>
    </article>
  );
}
```

- [ ] **Step 10: TypeScript 확인**

```bash
pnpm tsc --noEmit 2>&1 | head -15
```

- [ ] **Step 11: 커밋**

```bash
git add src/components/ArticleList.tsx
git commit -m "feat: add ArticleList client component (filters, cards, URL sync)"
```

---

## Task 11: TweaksPanel 컴포넌트

**Files:**
- Create: `src/components/TweaksPanel.tsx`

design/tweaks-panel.jsx + tweaks-journal.jsx를 TypeScript React Client Component로 이식한다. 패널은 `__activate_edit_mode` postMessage로 열린다.

- [ ] **Step 1: TweaksPanel.tsx 작성**

```tsx
// src/components/TweaksPanel.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const LS_KEY = "auctoritas.tweaks.v4";

const DEFAULTS = {
  font: "pretendard" as string,
  thumb: "on" as "on" | "off",
  reading: "railed" as "railed" | "centered" | "wide",
  tagstyle: "hash" as string,
};

type Tweaks = typeof DEFAULTS;

function loadTweaks(): Tweaks {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULTS };
}

function saveTweaks(v: Tweaks) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(v));
  } catch {}
}

function applyTweaks(v: Tweaks) {
  const r = document.documentElement;
  r.style.setProperty("--accent", "#3B82F6");
  r.setAttribute("data-font", v.font);
  r.setAttribute("data-shape", "rounded");
  r.setAttribute("data-carousel", "overlay");
  r.setAttribute("data-filter", "rail");
  r.setAttribute("data-card", "list");
  r.setAttribute("data-tagstyle", v.tagstyle);
  r.setAttribute("data-reading", v.reading);
  r.setAttribute("data-thumb", v.thumb);
}

// ── TweaksPanel shell (드래그 가능, postMessage 프로토콜) ──────────────────
export function TweaksPanel() {
  const [open, setOpen] = useState(false);
  const [t, setT] = useState<Tweaks>(DEFAULTS);
  const dragRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 16, y: 16 });
  const page =
    typeof document !== "undefined"
      ? (document.documentElement.getAttribute("data-page") ?? "home")
      : "home";

  // 초기 로드: localStorage에서 트윅 복원
  useEffect(() => {
    const loaded = loadTweaks();
    setT(loaded);
    applyTweaks(loaded);
  }, []);

  // 트윅 변경 시 적용 + 저장
  useEffect(() => {
    applyTweaks(t);
    saveTweaks(t);
    window.dispatchEvent(new CustomEvent("tweakchange", { detail: t }));
  }, [t]);

  // postMessage 프로토콜
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === "__activate_edit_mode") setOpen(true);
      else if (e.data?.type === "__deactivate_edit_mode") setOpen(false);
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({ type: "__edit_mode_dismissed" }, "*");
  };

  const clamp = useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const PAD = 16;
    const maxRight = Math.max(PAD, window.innerWidth - panel.offsetWidth - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - panel.offsetHeight - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y)),
    };
    panel.style.right = offsetRef.current.x + "px";
    panel.style.bottom = offsetRef.current.y + "px";
  }, []);

  useEffect(() => {
    if (!open) return;
    clamp();
    const ro = new ResizeObserver(clamp);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clamp]);

  const onDragStart = (e: React.MouseEvent) => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX, sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = (ev: MouseEvent) => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy),
      };
      clamp();
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  if (!open) return null;

  const set = (key: keyof Tweaks, val: string) =>
    setT((prev) => ({ ...prev, [key]: val }));

  return (
    <>
      <style>{TWEAKS_STYLE}</style>
      <div
        ref={dragRef}
        className="twk-panel"
        style={{ right: offsetRef.current.x, bottom: offsetRef.current.y }}
      >
        <div className="twk-hd" onMouseDown={onDragStart}>
          <b>Tweaks</b>
          <button className="twk-x" aria-label="Close tweaks" onClick={dismiss}>
            ✕
          </button>
        </div>
        <div className="twk-body">
          {/* 아티클 카드 썸네일 (home + detail 공통) */}
          <div className="twk-sect">아티클 카드</div>
          <TweakRadio
            label="썸네일"
            value={t.thumb}
            options={[
              { value: "on", label: "표시" },
              { value: "off", label: "숨김" },
            ]}
            onChange={(v) => set("thumb", v)}
          />

          {/* 본문 레이아웃 (detail 전용) */}
          {page === "detail" && (
            <>
              <div className="twk-sect">본문 레이아웃</div>
              <TweakRadio
                label="읽기"
                value={t.reading}
                options={[
                  { value: "railed", label: "목차" },
                  { value: "centered", label: "중앙" },
                  { value: "wide", label: "와이드" },
                ]}
                onChange={(v) => set("reading", v)}
              />
            </>
          )}

          {/* 서체 */}
          <div className="twk-sect">서체</div>
          <TweakSelect
            label="글꼴"
            value={t.font}
            options={[
              { value: "pretendard", label: "Pretendard (기본)" },
              { value: "noto", label: "Noto Sans KR" },
              { value: "plex", label: "IBM Plex Sans KR" },
              { value: "system", label: "시스템" },
            ]}
            onChange={(v) => set("font", v)}
          />
        </div>
      </div>
    </>
  );
}
```

그 다음, 파일 하단에 `TweakRadio`, `TweakSelect` 컴포넌트를 추가한다 (tweaks-panel.jsx에서 이식, TypeScript로):

```tsx
// ── 컨트롤 컴포넌트 ──────────────────────────────────────────────────────

interface TweakRadioProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}

function TweakRadio({ label, value, options, onChange }: TweakRadioProps) {
  const n = options.length;
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  const trackRef = useRef<HTMLDivElement>(null);

  return (
    <div className="twk-row">
      <div className="twk-lbl"><span>{label}</span></div>
      <div ref={trackRef} role="radiogroup" className="twk-seg"
        onClick={(e) => {
          const el = trackRef.current;
          if (!el) return;
          const r = el.getBoundingClientRect();
          const i = Math.floor(((e.clientX - r.left - 2) / (r.width - 4)) * n);
          const opt = options[Math.max(0, Math.min(n - 1, i))];
          if (opt) onChange(opt.value);
        }}
      >
        <div
          className="twk-seg-thumb"
          style={{
            left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
            width: `calc((100% - 4px) / ${n})`,
          }}
        />
        {options.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={o.value === value}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface TweakSelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}

function TweakSelect({ label, value, options, onChange }: TweakSelectProps) {
  return (
    <div className="twk-row">
      <div className="twk-lbl"><span>{label}</span></div>
      <select
        className="twk-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
```

파일 상단에 TWEAKS_STYLE 상수 (tweaks-panel.jsx의 `__TWEAKS_STYLE` 그대로 이식):

```tsx
const TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}
  .twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}
  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none;cursor:default}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2}
`;
```

- [ ] **Step 2: TypeScript 확인**

```bash
pnpm tsc --noEmit 2>&1 | head -10
```

- [ ] **Step 3: 커밋**

```bash
git add src/components/TweaksPanel.tsx
git commit -m "feat: add TweaksPanel client component (localStorage persist, FOUC safe)"
```

---

## Task 12: 홈페이지 page.tsx 작성

**Files:**
- Modify: `src/app/page.tsx`

Server Component로 전체 데이터를 fetch하고 클라이언트 컴포넌트에 전달한다.

- [ ] **Step 1: page.tsx 작성**

```tsx
// src/app/page.tsx
import { getAllPosts, getCategories } from "@/lib/posts";
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
  searchParams: Promise<{ cat?: string; tag?: string }>;
}

export default async function HomePage({ searchParams }: Props) {
  const sp = await searchParams;
  const [allPosts, categories] = await Promise.all([
    getAllPosts(),
    getCategories(),
  ]);

  const featuredPosts = allPosts.slice(0, 5);
  const jsonLd = buildSiteJsonLd();

  return (
    <>
      <PageInit page="home" />
      {/* LegalService JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ItemList JSON-LD (클라이언트에서 동적 갱신) */}
      <script type="application/ld+json" id="ld-list" />

      <SiteHeader />

      <main>
        {/* 히어로 */}
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

        {/* 캐러셀 */}
        <FeaturedCarousel posts={featuredPosts} />

        {/* 필터 + 카드 그리드 */}
        <ArticleList
          posts={allPosts}
          categories={categories}
          initialCat={sp.cat}
          initialTag={sp.tag}
        />
      </main>

      <SiteFooter />
      <div id="tweaks-root">
        <TweaksPanel />
      </div>
    </>
  );
}
```

- [ ] **Step 2: 개발 서버 실행 + 브라우저 확인**

```bash
pnpm dev
```

브라우저에서 http://localhost:3000 확인:
- 히어로 섹션 노출
- 캐러셀 렌더링 (이미지 없으면 회색 placeholder)
- 필터 사이드바 노출
- 포스트 카드 그리드 노출 (Supabase에 데이터 있으면)
- 콘솔 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add src/app/page.tsx
git commit -m "feat: implement homepage with carousel, filters, and post grid"
```

---

## Task 13: TocWatcher 컴포넌트

**Files:**
- Create: `src/components/TocWatcher.tsx`

- [ ] **Step 1: TocWatcher.tsx 작성**

design/article.html의 `wireToc()` 함수를 이식한다.

```tsx
// src/components/TocWatcher.tsx
"use client";

import { useEffect } from "react";
import type { Heading } from "@/utils/toc";

interface Props {
  headings: Heading[];
}

export function TocWatcher({ headings }: Props) {
  useEffect(() => {
    if (!headings.length) return;

    const links = new Map<string, HTMLAnchorElement>();
    document.querySelectorAll<HTMLAnchorElement>("#toc a").forEach((l) => {
      const id = l.getAttribute("href")?.slice(1);
      if (id) links.set(id, l);
    });

    const secs = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);

    function onScroll() {
      const headerH =
        parseInt(
          getComputedStyle(document.documentElement).getPropertyValue("--headerH"),
        ) || 64;
      const top = window.scrollY + headerH + 60;
      let cur = secs[0];
      secs.forEach((s) => {
        if (s.offsetTop <= top) cur = s;
      });
      links.forEach((link, id) => {
        link.classList.toggle("is-active", cur?.id === id);
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [headings]);

  return null;
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/components/TocWatcher.tsx
git commit -m "feat: add TocWatcher client component (scroll spy)"
```

---

## Task 14: 아티클 상세 page.tsx 작성

**Files:**
- Modify: `src/app/(blog)/posts/[slug]/page.tsx`

design/article.html의 전체 렌더 로직을 Server Component로 이식한다.

- [ ] **Step 1: posts/[slug]/page.tsx 작성**

```tsx
// src/app/(blog)/posts/[slug]/page.tsx
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

  const authorInitials =
    post.author?.name?.charAt(0) ?? "A";

  return (
    <>
      <PageInit page="detail" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SiteHeader />

      <main className="wrap" id="article-main">
        {/* 브레드크럼 */}
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

        {/* 아티클 헤더 */}
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

        {/* 본문 + 목차 그리드 */}
        <div className="artbody">
          {/* 목차 (railed 레이아웃에서만 보임) */}
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
            {/* 본문 */}
            <article
              className="prose"
              id="prose"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />

            {/* 아티클 푸터 */}
            <div className="artfoot">
              {/* 태그 */}
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

              {/* 저자 박스 */}
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

              {/* 상담 박스 (detail 전용 인라인 스타일) */}
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

        {/* 관련 아티클 */}
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

      {/* 목차 스크롤 스파이 */}
      <TocWatcher headings={headings} />

      <SiteFooter />
      <div id="tweaks-root">
        <TweaksPanel />
      </div>

      {/* consult-note 인라인 스타일 (design 명세 준수: journal.css에 중복 정의 금지) */}
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
```

- [ ] **Step 2: 개발 서버에서 아티클 상세 확인**

```bash
# Supabase에 데이터가 있으면 슬러그로 접근
open http://localhost:3000/posts/<실제-slug>
```

확인 항목:
- 브레드크럼 노출
- 본문 렌더링 (HTML content)
- 목차 좌측 표시 (railed 모드)
- 스크롤 시 목차 하이라이트
- 관련 아티클 3개
- consult-note 좌우 배치

- [ ] **Step 3: TypeScript 확인**

```bash
pnpm tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: 커밋**

```bash
git add src/app/(blog)/posts/[slug]/page.tsx
git commit -m "feat: implement article detail page with TOC, related posts, JSON-LD"
```

---

## Task 15: /posts 리다이렉트 처리

**Files:**
- Modify: `src/app/(blog)/posts/page.tsx`

- [ ] **Step 1: posts/page.tsx를 홈 리다이렉트로 교체**

홈 페이지가 전체 아티클 목록 역할을 하므로, `/posts`는 홈으로 리다이렉트한다.

```tsx
// src/app/(blog)/posts/page.tsx
import { redirect } from "next/navigation";
import type { SearchParams } from "@/types";

interface Props {
  searchParams: Promise<{ cat?: string; tag?: string }>;
}

export default async function PostsRedirect({ searchParams }: Props) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  if (sp.cat) params.set("cat", sp.cat);
  if (sp.tag) params.set("tag", sp.tag);
  const qs = params.toString();
  redirect(qs ? `/?${qs}` : "/");
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/app/(blog)/posts/page.tsx
git commit -m "feat: redirect /posts to homepage (home page handles listing)"
```

---

## Task 16: sitemap.ts 업데이트

**Files:**
- Modify: `src/app/sitemap.ts`

- [ ] **Step 1: sitemap.ts 업데이트**

```typescript
// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { getAllPostSlugs } from "@/lib/posts";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fightingspirit.kr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllPostSlugs();

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...slugs.map((slug) => ({
      url: `${SITE_URL}/posts/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
```

- [ ] **Step 2: 빌드 + 최종 확인**

```bash
pnpm build 2>&1 | tail -30
```

Expected: Build succeeds. Static params generated for all post slugs.

- [ ] **Step 3: 반응형 확인 (브라우저 DevTools)**

크롬 DevTools에서 다음 뷰포트 폭 확인:
- 390px (모바일): 필터 숨김/접힘 토글, 카드 1열
- 768px (태블릿): 필터 static, 카드 2열
- 1024px (데스크톱 소): 아티클 상세 목차 static
- 1920px (데스크톱 대): 사이드바 필터 + 3열 카드, 목차 sticky

- [ ] **Step 4: 최종 커밋**

```bash
git add src/app/sitemap.ts
git commit -m "feat: update sitemap for AUCTORITAS LAB post URLs"
```

---

## 완료 기준 체크리스트

- [ ] 콘솔 에러 0
- [ ] 캐러셀: 5초 자동, 화살표/점/hover 정지/탭 비활성 정지
- [ ] 필터: 검색·카테고리·태그(AND)·아카이브·활성칩·모두지우기, URL 쿼리 복원/동기화
- [ ] 모바일 필터 접힘(`#fmore`) 동작
- [ ] 헤더 스크롤 숨김/복원
- [ ] 상세: 목차 자동생성 + 스크롤 스파이 하이라이트
- [ ] 읽기 레이아웃 3종 + `≤1024px`에서 목차 static
- [ ] 관련글 스코어링 3개, 태그 링크로 홈 복귀+필터
- [ ] JSON-LD (LegalService/ItemList/BlogPosting/BreadcrumbList) 출력
- [ ] 트윅 저장·복원 + 첫 페인트 FOUC 없음
- [ ] 반응형: 390/768/1024/1920 폭에서 깨짐 없음
- [ ] `pnpm build` 성공

---

## 주의사항

1. **Supabase 환경변수**: `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` 설정 필요. 없으면 데이터 빈 상태로 UI만 확인 가능.

2. **is_visible 컬럼**: teamcho 레포가 `is_visible=true` 필터를 사용한다. 동일 DB이므로 이 컬럼이 존재할 가능성이 높음. `getAllPosts()`에서 에러 발생 시 `.eq("is_visible", true)` 줄을 추가한다.

3. **tags 관계**: Supabase에서 `tags(id, name, slug)` 직접 조인 구문이 junction table(`post_tags`)을 통한 관계 조회다. 현재 프로젝트의 `getPosts()` 쿼리가 이미 이 패턴을 사용하므로 동작 확인됨.

4. **읽기시간 계산**: DB에 `reading_time` 컬럼이 있다면 `calcReadingTime()`보다 DB 값을 우선 사용. `Post` 타입에 해당 필드 추가 후 분기 처리.

5. **consult-note 스타일**: `journal.css`에 이 클래스를 추가하지 말 것 — 디자인 명세 준수. `posts/[slug]/page.tsx`의 인라인 `<style>` 태그에만 정의.
