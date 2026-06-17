# Handoff: 아티클 FAQ 섹션 (Post detail · 자주 묻는 질문)

## Overview

법무법인 저널(AUCTORITAS LAB / "Team CHO Journal")의 **포스트 상세 페이지**(`/posts/{slug}`)
본문 하단에 **FAQ(자주 묻는 질문) 섹션**을 추가합니다.

- 위치: 글 본문(`.prose`) 아래 **artfoot** 영역 안 — **태그 목록 → [신규] FAQ → 작가 박스** 순서.
- 데이터: `posts.faq` (jsonb) 컬럼의 `{ q, a }[]` 배열. **null/빈 배열이면 섹션 자체를 렌더하지 않음.**
- 동작: 네이티브 `<details>/<summary>` 아코디언 — 추가 JS 0줄, 한 번에 하나만 열림.
- 목적: 독자에게 핵심 질의응답을 빠르게 제공하고, **FAQPage 구조화 데이터**로 검색/AEO 노출 강화.

---

## About the Design Files

`prototypes/` 안 파일은 **HTML로 만든 디자인 레퍼런스**다 — 의도한 모양·동작을 보여주는 시안이지
그대로 배포할 코드가 아니다. 정적 HTML + Atlas 토큰으로 렌더링되며 디자인 검수용이다.

**대상 코드베이스는 정해져 있다** — 마운트된 `journal/` 레포(Next.js App Router + React +
TypeScript + **vanilla-extract** + **Supabase**). 따라서 `src/`에 **그 레포 스택에 맞춘 즉시
적용 가능한 실제 구현**을 함께 담았다.

- `prototypes/` → "이렇게 보이고 이렇게 동작해야 한다"는 **시각/동작 기준**.
- `src/`, `patches/` → `journal/` 레포에 반영하는 실제 소스(아래 §Files 참조).

---

## Fidelity

**High-fidelity.** 색·타입·간격·인터랙션이 모두 확정된 목업이다. 새 색/폰트/간격을 만들지 말고
코드베이스가 이미 쓰는 **Atlas 토큰**(`ds-system.css` + `journal.css`의 CSS 변수)과 기존 전역
클래스(`.artfoot`, `.prose`, `.authorbox`, `.eyebrow`)를 그대로 쓴다.

> **디자인 시스템 주의.** 이 프로젝트엔 두 시스템(FENCIL, Team CHO/Atlas)이 바인딩돼 있지만,
> 이 페이지가 들어갈 `journal/` 레포는 **Atlas(Team CHO)** 기반이며 토큰을 자체 vendoring 한다.
> 별도 번들 로드 없이 기존 토큰/클래스만 쓰면 된다. FENCIL 토큰은 이 표면과 무관하다.

---

## 구조 변경 — 왜 `<article>` 래핑인가 (중요)

기존 상세 페이지의 본문 영역은 이런 모양이었다:

```
<div className="artbody">
  <nav className="artrail"> 목차
  <div>                                  ← 의미 없는 wrapper
    <article className="prose">…본문…</article>
    <div className="artfoot"> tags · authorbox </div>   ← <article> 의 형제 = 본문 밖
  </div>
</div>
```

여기서 artfoot(따라서 FAQ)은 `<article className="prose">`의 **형제**라, **본문 article 요소
바깥**에 놓인다. FAQ는 글의 일부로 취급돼야 하므로 두 가지를 바꾼다:

1. **바깥 wrapper `<div>` → `<article className="post-article">`** 로 승격.
   tags·FAQ·authorbox 가 모두 article 시맨틱 범위 안에 들어온다.
2. **본문 `<article className="prose">` → `<div className="prose">`** 로 강등.
   (article 중첩 방지. `.prose` 스타일은 **클래스 선택자**라 태그를 바꿔도 그대로 적용된다.)

변경 후:

```
<div className="artbody">
  <nav className="artrail"> 목차
  <article className="post-article">     ← 글 전체 = 하나의 article
    <div className="prose">…본문…</div>
    <div className="artfoot">
      tags
      <FaqSection faq={post.faq} />       ← 신규
      authorbox
    </div>
  </article>
</div>
```

> 이 태그 교체는 **레이아웃 중립**이다(`.artbody` 그리드의 자식 위치·`display:block` 동일).
> 시각은 그대로, 시맨틱만 정확해진다.

---

## FAQ 섹션 스펙

**컨테이너** — `.artfaq`. **본문 `.prose` 와 동일한 너비**로 맞춘다. `--measure`(68ch)는 prose(18px)와
artfoot(16px)에서 ch 계산이 달라 폭이 어긋나므로, `max-width: calc(var(--measure) * 18 / 16)` 로
폰트 비율을 보정해 prose 폭에 정렬한다(태그·작가 박스도 같은 폭). 상단 `border-top: 1px solid var(--line)`
+ `padding-top: 40px`. 작가 박스와 **40px 이상** 간격.

**구성요소**

| 요소 | 스펙 |
|---|---|
| 섹션 라벨 (eyebrow) | "자주 묻는 질문" — `.artfaq__eyebrow`, 12px/700, `letter-spacing 0.18em`, uppercase, `--fg-3` |
| 항목 컨테이너 | `<details className="faqq" name="article-faq">` — `name` 공유로 **한 번에 하나만** 열림 |
| 첫 항목 | `open` (기본 펼침) |
| 항목 사이 구분선 | `1px solid var(--line-2)` (`.faqq` border-top, 첫 항목 제외) |
| Q 마커 | serif 글리프 "Q", `var(--font-serif)`/700/18px, **`--accent`**(포인트 컬러, Q에만 절제) |
| 질문 (summary) | `.faqq__qt`, 16.5px/700, `--ink`, `word-break: keep-all`. 호버 시 `--accent` |
| 셰브론 | 20×20 인라인 SVG, 열림 시 180° 회전 (`--d`/`--ease`) |
| A 마커 | serif "A", `--fg-3` |
| 답변 | `.faqq__at`, 15.5px/1.72, `--fg-2`, `word-break: keep-all`, `text-wrap: pretty` |

**동작 / 접근성**
- 네이티브 `<details>` — **추가 JS 없음**. `name="article-faq"` 로 exclusive accordion.
  - 브라우저 지원: Chrome 120+ / Safari 17.2+ / Firefox 130+. 미지원 구버전에선 **각 항목이
    독립 토글**로 우아하게 폴백(콘텐츠 손실 없음).
- 진입 애니메이션(`faq-reveal`)은 **점진적 향상**으로만 — `@media (prefers-reduced-motion:
  no-preference)` + `[open]` 게이트. 기본 상태가 이미 visible 이라 인쇄/PDF/reduced-motion 에서도
  답변이 항상 보인다.
- 마커·셰브론은 `aria-hidden`. summary 가 native 토글 버튼 역할 → 스크린리더 호환.

**렌더 규칙** — `faq` 가 `null` 이거나 `[]` 이면 `FaqSection` 이 `null` 을 반환해 **섹션 자체가
사라진다**(eyebrow·border 포함 전부).

**반응형** — 390px 에서 마커/간격 축소(grid 11px gap, 18px columns), 폰트 한 단계 축소.

---

## Design Tokens

새 값 없음 — 전부 Atlas 토큰.

| 역할 | 토큰 | 값 |
|---|---|---|
| 질문·기본 텍스트 | `--ink` | `#161616` |
| 답변·본문 | `--fg-2` | `#717171` |
| eyebrow·A 마커·셰브론 | `--fg-3` | `#B0B0B0` |
| Q 마커·링크·호버 포인트 | `--accent` | `#3B82F6` |
| 섹션 상단/작가 구분선 | `--line` | `#DDDDDD` |
| 항목 사이 구분선 | `--line-2` | `#EBEBEB` |
| 페이지 배경 | `--surface` | `#FFFFFF` |
| 모션 | `--d` / `--ease` | ≈200ms / cubic-bezier |
| Q·A 글리프 | `--font-serif` | (저널 serif 스택) |

타이포: 본문 Pretendard(`var(--font)`), 마커만 `--font-serif`. 한글 `word-break: keep-all`.

---

## Data

`posts.faq` (**jsonb**, nullable) 컬럼을 사용한다. 형태:

```json
[ { "q": "질문 텍스트", "a": "답변 텍스트" }, ... ]
```

- **컬럼이 이미 있으면 마이그레이션 불필요.** 없으면 `alter table posts add column faq jsonb;` 한 줄.
- **`getPostByNumber` 의 select 에 `faq` 를 포함**시켜야 한다(누락 시 항상 미렌더됨). 상세 전용이라
  `PostListItem`/목록 쿼리엔 넣지 않는다.
- answer 텍스트는 **평문 권장**(구글 FAQ 가이드라인 — HTML 태그 지양). 프로토타입 더미 3건 동봉.

---

## SEO / AEO (JSON-LD)

`buildFaqJsonLd(faq)` 로 **FAQPage** 노드를 만들어 기존 `buildPostJsonLd` 의 `@graph` 에
conditional push 한다(별도 `<script>` 불필요). 비어 있으면 `null` 반환 → graph 에 안 들어감.

```
@graph: [ BlogPosting, BreadcrumbList, FAQPage? ]
```

- 시각적 FAQ 위치와 **독립적으로** 구조화 데이터를 제공 → 리치 결과/AI 답변 노출.
- 적용 후 **Rich Results Test** 로 FAQPage 인식 확인.

---

## Files

### `prototypes/` — 디자인 레퍼런스 (브라우저로 바로 열기)
- `article.html` — **실제 포스트 상세 페이지 전체**에 FAQ 가 통합된 모습. 기본 로드되는 글
  (기성고 감정)에 `faq` 더미 3건이 들어 있어, 본문 → 태그 → **FAQ** → 작가 박스 순서가
  실제 맥락 그대로 보인다. **여기가 시각/동작 기준.** (data.js·footer.js·images 동봉)
- `journal.css`, `ds-system.css` — Atlas 토큰 + 저널 전역 스타일(레포가 이미 보유; 참고용).
- `data.js` 외 — 프로토타입 렌더 런타임(참고용). 첫 번째 글에 `faq` 필드 예시가 들어 있다.

### `src/` — `journal/` 레포에 반영하는 실제 구현
| 경로 | 역할 | 신규/수정 |
|---|---|---|
| `src/components/FaqSection/FaqSection.tsx` · `index.ts` | FAQ 섹션 서버 컴포넌트(`<details>` 렌더, 빈 배열 가드) | **신규** |
| `src/app/(blog)/posts/[slug]/page.tsx` | `<article>` 래핑 + `.prose` div 강등 + `<FaqSection>` 삽입 | **수정**(전체 파일 동봉) |
| `src/types/faq.patch.ts` | `FaqItem` 타입 + `Post.faq` 필드 | **수정 가이드**(기존 `types/index.ts` 에 병합) |
| `src/lib/metadata.faq.patch.ts` | `buildFaqJsonLd` + `buildPostJsonLd` 합치는 법 | **수정 가이드**(기존 `metadata.ts` 에 병합) |

### `patches/`
- `journal.css.faq.patch.css` — `.artfaq` / `.faqq` 전역 스타일. 레포의 `src/styles/journal.css`
  **끝에 append**(또는 별도 partial 로 import). `.artfoot`·`.authorbox` 와 같은 전역 레이어.

### 적용 체크리스트
- [ ] `patches/journal.css.faq.patch.css` 를 `src/styles/journal.css` 에 추가.
- [ ] `FaqSection/` 컴포넌트 복사.
- [ ] `page.tsx` 반영: ① import 추가 ② wrapper `<div>`→`<article className="post-article">`
      ③ `<article className="prose">`→`<div className="prose">` ④ tags 뒤 `<FaqSection faq={post.faq} />`.
- [ ] `types/index.ts` 에 `FaqItem` + `Post.faq` 병합.
- [ ] `lib/metadata.ts` 에 `buildFaqJsonLd` 추가 + `buildPostJsonLd` @graph 에 conditional push.
- [ ] `getPostByNumber` select 에 `faq` 포함. `posts.faq` jsonb 컬럼 존재 확인(없으면 1줄 추가).
- [ ] 빌드 후 `faq` 있는 글/없는 글 둘 다 확인 + Rich Results Test 로 FAQPage 검증.
- [ ] 반응형 확인: 390 / 768 / 1920 폭.

---

## 한 줄 요약 (Claude Code 지시)

> 마운트된 `journal/` 레포(Next.js App Router + vanilla-extract + Supabase)의 포스트 상세
> 페이지에 FAQ 섹션을 추가해줘. `prototypes/article.html` 이 시각/동작 기준(실제 페이지에 통합된
> 모습)이고, `src/`·`patches/` 에 즉시 적용 가능한 구현이 있어. ① journal.css 에 FAQ 스타일 패치
> 추가 ② FaqSection 컴포넌트 복사 ③ page.tsx 를 `<article>` 래핑 + `.prose` div 강등 +
> `<FaqSection>` 삽입으로 수정 ④ types 에 `Post.faq` 추가 ⑤ metadata 에 FAQPage(buildFaqJsonLd)
> 합치고 getPostByNumber select 에 faq 포함. 스타일은 새 값 만들지 말고 기존 Atlas 토큰만 사용.
> `faq` 가 null/빈 배열이면 섹션을 렌더하지 않아야 해.
