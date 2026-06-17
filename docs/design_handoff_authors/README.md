# Handoff: 집필진 페이지 (Authors / 작가 목록 · 상세)

## Overview

법무법인 저널(AUCTORITAS LAB / "Team CHO Journal") 사이트에 **집필진(작가)** 표면을 추가합니다.
E-E-A-T(경험·전문성·권위·신뢰)를 강화하기 위한 저자 페이지로, 두 개의 라우트로 구성됩니다.

- **`/authors`** — 발행 글을 가진 변호사를 위에서 아래로 흐르는 **로스터 리스트**로 보여줌. 행마다 이름 · 간략 소개.
- **`/authors/{id}`** — 한 변호사의 **이름 · 간략 소개 · N편의 아티클 · 작성한 글 목록**.

목적은 "글을 누가 썼는가"를 명확히 드러내 검색엔진과 독자 모두에게 권위를 전달하는 것.
보여주는 데이터는 **최소**다 — 학력·경력·등록·전문분야·이메일 같은 정보는 다루지 않는다.

---

## About the Design Files

이 번들의 `prototypes/` 안 파일들은 **HTML로 만든 디자인 레퍼런스**다 — 의도한 모양과 동작을 보여주는
프로토타입이지, 그대로 복사해 배포할 프로덕션 코드가 아니다. 정적 HTML + 바닐라 JS로 렌더링되며
디자인 검수용이다.

**대상 코드베이스는 이미 정해져 있다** — 마운트된 `journal/` 레포(Next.js App Router + React +
TypeScript + **vanilla-extract** + **Supabase**). 따라서 이 핸드오프는 이례적으로 구체적이다:
`src/` 폴더에 **그 레포의 스택과 컨벤션에 맞춰 작성한, 바로 적용 가능한 실제 구현**을 함께 담았다.

요약하면:
- `prototypes/` → "이렇게 보이고 이렇게 동작해야 한다"는 **시각/동작 기준**.
- `src/` → `journal/` 레포에 **그대로 복사**하면 되는 실제 소스(아래 §Files 참조).

---

## Fidelity

**High-fidelity (hifi).** 최종 색·타입·간격·인터랙션이 모두 확정된 목업이다. 픽셀 단위로 재현하되,
새 색/폰트/간격을 만들지 말고 코드베이스가 이미 사용하는 **Atlas 디자인 토큰**(`ds-system.css` +
`journal.css`의 CSS 변수)과 기존 전역 클래스를 그대로 쓴다.

> **디자인 시스템 주의.** 이 프로젝트에는 두 디자인 시스템(FENCIL, Team CHO/Atlas)이 바인딩돼
> 있지만, **이 페이지가 들어갈 `journal/` 코드베이스는 Atlas(Team CHO) 기반**이다. 저널 레포는
> Atlas 토큰을 자체적으로 vendoring 해 쓰고 있으므로, 별도 번들 로드 없이 기존 토큰/클래스를
> 그대로 사용하면 된다. FENCIL 토큰은 이 표면과 무관하다.

---

## Screens / Views

### 1. 작가 목록 — `/authors`

**Purpose** — 발행 글을 가진 변호사 전체를 훑고, 한 명을 골라 상세로 진입.

**Layout**
- 컨테이너: 기존 `.wrap` (사이트 공용 max-width 컨테이너, 좌우 패딩 포함).
- 브레드크럼(`.breadcrumb`) → 페이지 헤더(`.listhead`) → 작가 리스트(`.author-list`).
- **리스트는 세로 1열 flex column.** 그리드 아님. 위에서 아래로 흐른다.
- 각 행(`.acard__link`)은 **3열 그리드**: `auto | 1fr | auto` = 아바타 · 본문 · 화살표.
  - 열 간격 `gap: clamp(16px, 3vw, 32px)`, 행 패딩 `26px 16px`.
  - 행 사이 헤어라인 구분선(아래 스타일 변형의 기본값 `plain`).

**Components**

| 요소 | 스펙 |
|---|---|
| 페이지 헤더 eyebrow | "집필진 · CONTRIBUTORS" — `.eyebrow`, 12px/700, `letter-spacing 0.18em`, uppercase, `--fg-3`, 하단 margin 14px |
| 페이지 제목 (h1) | "공간분쟁을 직접 다루는 변호사들" — `clamp(30px,4vw,46px)`/800, `letter-spacing -0.03em`, `--ink` |
| 페이지 서브타이틀 (p) | "모든 글은 그 분야를 직접 맡아 온 변호사가 판례와 실무를 근거로 씁니다." — 16px/`--fg-2`, **max-width 없음**(컨테이너 폭) |
| 헤더 하단 border | **없음** (`.listhead`의 기본 `border-bottom`을 `.listhead--authors`에서 제거) |
| 아바타 (col 1) | 60×60. `avatar_url` 있으면 `<img>` 원형(`border-radius:50%; object-fit:cover`). 없으면 **검은 원(#000)에 흰 글씨로 이름 첫 글자**, 폰트 sans-serif(`var(--font)`), 700 |
| 이름 (col 2) | 20px/800, `letter-spacing -0.02em`, `--ink`. 호버 시 하단 1px 밑줄(背景 그라데이션 트릭) |
| 간략 소개 (col 2) | 14.5px/1.6, `--fg-2`, `word-break: keep-all`, **2줄 클램프**(`-webkit-line-clamp:2`), 이름 아래 margin-top 6px |
| 화살표 (col 3) | Lucide `arrow-right`, 20×20, `--n-06`. 호버 시 `translateX(4px)` + `--ink`로 진해짐 |
| 행 호버(plain) | 행 배경 `--surface-2`로 살짝 떠오름 |

> **집필 수는 목록에 표기하지 않는다** (정렬에만 사용).

**빈 상태** — 발행 글을 가진 변호사가 없으면 리스트 대신 중앙 정렬 안내:
제목 "등록된 집필진이 없어요" + 문단 "발행된 글이 쌓이면 작성한 변호사가 이곳에 표시돼요."

### 2. 작가 상세 — `/authors/{id}`

**Purpose** — 한 변호사의 소개와 그가 쓴 글을 확인.

**Layout**
- 컨테이너 `.wrap`. 브레드크럼 → 프로필 히어로(`.aprofile`) → "작성한 글" 섹션(`.aposts`).
- **프로필 히어로**는 `auto | 1fr` 2열 그리드(아바타 · 텍스트), `align-items:center`,
  `gap: clamp(24px,4vw,48px)`, 패딩 `40px 0 36px`, **하단 border 없음**.
  - 620px 이하에서 1열로 스택.
- **"작성한 글" 섹션**: 기존 `.sec__head`(제목+링크 행) + 글 카드 리스트. 패딩 `56px 0 0`.

**Components**

| 요소 | 스펙 |
|---|---|
| 아바타 | `clamp(96px,14vw,124px)` 정사각. 이미지(원형) 또는 검은 원 + 흰 첫 글자, `font-size clamp(42px,6vw,54px)`, sans-serif |
| eyebrow | "집필진 · CONTRIBUTOR" — `.eyebrow`, 색 `--fg-3`, 하단 margin 14px |
| 이름 (h1) | `clamp(30px,4.4vw,48px)`/800, `letter-spacing -0.035em`, `line-height 1.05`, `--ink` |
| 간략 소개 (p) | `clamp(15.5px,1.7vw,18px)`/1.6, `--fg-2`, `letter-spacing -0.01em`, `word-break: keep-all`, margin-top 18px, **max-width 없음** |
| 메타 | 이름/소개 아래 margin-top 22px, 13.5px/`--fg-3`. 텍스트: "**N**편의 아티클" (숫자 `<b>`는 `--ink`/700) |
| 섹션 제목 (h2) | "작성한 글" — 기존 `.sec__title` |
| 섹션 서브 | "총 N편" — 기존 `.sec__sub` |
| 섹션 링크 | "더 보기" + Lucide arrow — 기존 `.sec__link`, `/?author={id}`로 이동. 글이 0편이면 숨김 |
| 글 목록 | 기존 **`PostCard`** 컴포넌트 재사용. 저널이 `data-card="list"`라 자동 행 레이아웃 |
| 빈 상태 | "아직 발행된 글이 없어요." 중앙 정렬 |

**404 / not-found** — 존재하지 않는 `id`면 Next의 `notFound()`로 처리.

---

## Interactions & Behavior

- **목록 행 클릭** → `/authors/{id}` 이동. 행 전체가 단일 `<a>`.
- **포스트 상세 → 작가 상세** → 포스트 상세(`/posts/{slug}`) 하단의 작가 박스(`.authorbox`)를 통째로 `/authors/{id}` 링크로 만들었다. 실제 이름·검은 아바타·화살표 표시, 호버 시 이름 밑줄 + 화살표 슬라이드. (구현: `src/app/(blog)/posts/[slug]/page.tsx` + `patches/journal.css.authorbox.patch.css`)
- **상세 "더 보기" 클릭** → `/?author={id}` (홈 글 목록을 해당 저자로 필터; 저널의 기존 쿼리 규칙).
- **호버 전이** — 모두 `transition: ... var(--d) var(--ease)` (≈ Atlas 토큰 `--d` 200ms, `--ease` cubic-bezier). 색 시프트가 아닌 미세한 움직임/밑줄.
- **헤더 스크롤 동작** — 사이트 공용 헤더는 아래로 스크롤 시 숨고 위로 스크롤 시 나타남(기존 `SiteHeader` 동작 그대로). 프로토타입에도 동일 로직 포함.
- **반응형** — 목록 행은 560px 이하에서 패딩/아바타 축소(`48×48`). 상세 히어로는 620px 이하에서 1열 스택.
- **리스트 스타일 변형(옵션)** — `html[data-acard]` 한 속성으로 4가지 룩 전환. 디자인 탐색용 Tweaks이며, **기본값은 `plain`(구분선 리스트)**. 프로덕션에선 `plain` 하나만 구현해도 충분하다.
  - `plain` — 행 사이 헤어라인 구분선 (기본)
  - `filled` — 행마다 `--surface-2` 면 채움, 행 간격 12px
  - `border` — 행마다 헤어라인 보더 카드, 간격 12px
  - `shadow` — 행마다 부드러운 그림자 카드, 간격 14px, 호버 시 `translateY(-2px)`

---

## State Management

서버 컴포넌트 기반(Next App Router) — 클라이언트 상태 없음.

- **데이터 페칭**: 서버에서 Supabase로 조회. `getAuthors()`(목록), `getAuthorById(id)`(상세),
  `getAllAuthorIds()`(정적 파라미터/사이트맵). 자세한 시그니처는 `src/lib/authors.ts`.
- **캐시**: 목록은 `unstable_cache(..., { revalidate: 300 })`, 상세는 React `cache`로 메모이즈,
  페이지는 `export const revalidate = 300`.
- **노출 규칙**: 발행(`is_visible = true`) 글이 1편 이상인 저자만 목록에 노출.
- **정렬**: 집필 수(내림차순) → 이름(가나다). *집필 수는 정렬에만 쓰고 목록 화면엔 표기 안 함.*

---

## Design Tokens

새 값 만들지 않음 — 전부 Atlas 토큰(`ds-system.css` / `journal.css`)에서 가져옴.

**Color**
| 역할 | 토큰 | 값 |
|---|---|---|
| 기본 텍스트 · 아바타 배경 | `--ink` | `#161616` |
| 본문/소개 | `--fg-2` | `#717171` |
| 메타 · 보조 | `--fg-3` | `#B0B0B0` |
| 화살표 기본 | `--n-06` | (중간 회색) |
| 포인트(링크 등, 절제) | `--accent` | `#3B82F6` |
| 상단/헤더 구분선 | `--line` | `#DDDDDD` |
| 행 구분선 | `--line-2` | `#EBEBEB` |
| 호버·채움 면 | `--surface-2` | `#F7F7F7` |
| 페이지 배경 | `--surface` | `#FFFFFF` |

**Typography** — Pretendard(`var(--font)`). 이름 20px/800(상세 h1 clamp 30–48), 소개 14.5px/1.6(상세 clamp 15.5–18), 메타 13–13.5px, eyebrow 12px/700 uppercase. 한글 대응 `letter-spacing -0.02 ~ -0.035em`, `word-break: keep-all`.

**Spacing** — 행 패딩 `26px 16px`(모바일 `22px 12px`), 열 간격 `clamp(16–32)px`, 히어로 패딩 `40px 0 36px`, 글 섹션 `56px 0 0`.

**Radius** — `--r-card`(12px). `plain` 리스트는 0(구분선만). `data-shape="sharp"`일 때 4px.

**Shadow** (shadow 변형 한정) — rest `0 1px 2px rgba(0,0,0,.03), 0 12px 28px -14px rgba(0,0,0,.16)`, hover `0 2px 4px rgba(0,0,0,.04), 0 20px 40px -18px rgba(0,0,0,.2)`.

**Motion** — `--d`(≈200ms) / `--ease`(cubic-bezier). 색 시프트 금지, 미세 이동·밑줄만.

---

## Data (마이그레이션 없음)

`profiles`의 **기본 컬럼만** 사용 → **DB 스키마 변경 불필요.**

| UI | 컬럼 / 쿼리 |
|---|---|
| 이름 | `profiles.display_name` |
| 간략 소개 | `profiles.bio` (목록·상세 공용, 단일 필드) |
| 아바타 | `profiles.avatar_url` (없으면 이름 첫 글자 폴백) |
| 집필 수 · 글 목록 | `posts where author_id = id and is_visible = true` (최신순) |

`anon` 키로 `profiles`/`posts`를 읽으므로 **두 테이블이 공개 select(RLS)인지만 확인**하면 된다
(기존 글 목록이 이미 읽히고 있으면 추가 작업 없음).

---

## SEO / E-E-A-T (JSON-LD)

`src/lib/metadata.ts`의 빌더로 생성.

- `/authors` → `CollectionPage › ItemList<Person>` (Person: `name` · `description` · `url` · `worksFor`).
- `/authors/{id}` → `ProfilePage › Person` + `BreadcrumbList` (Person에 `subjectOf` = 쓴 글).
- 본문 글 JSON-LD(`buildPostJsonLd`)의 `author.url`을 `/authors/{id}`로 연결 → 글↔저자 양방향 신호.
- `src/app/sitemap.ts`에 `/authors` + 각 `/authors/{id}` 포함.
- 푸터 "저널" 칼럼에 `<Link href="/authors">집필진</Link>` 추가(프로토타입은 `footer.js`에 반영).

---

## Assets

- **아이콘**: Lucide `arrow-right`(20×20, 2px stroke). 저널 레포는 `@/utils/icons`의 `ICON.arrow`를
  사용 — 실제 소스가 이를 참조한다. 별도 에셋 없음.
- **이미지/일러스트 없음.** 아바타는 사용자 업로드(`avatar_url`) 또는 타이포 폴백.

---

## Files

### `prototypes/` — 디자인 레퍼런스 (브라우저로 바로 열어 확인)
- `authors.html` — 작가 목록 화면. `?` 없이 열면 됨.
- `author.html` — 작가 상세. `author.html?id=kim` (또는 `lee`, `park`)로 열어야 데이터가 뜸.
- `authors.css` — 두 화면의 신규 스타일(목록 행/리스트 변형/상세 히어로). **여기가 시각 스펙의 핵심.**
- `data.js` — 더미 작가/글 데이터 + 렌더 헬퍼(프로토타입 전용).
- `journal.css`, `ds-system.css` — Atlas 토큰 + 저널 전역 스타일(레포가 이미 보유; 참고용).
- `footer.js`, `tweaks-panel.jsx`, `tweaks-journal.jsx` — 프로토타입 셸 지원 파일.

### `src/` — `journal/` 레포에 그대로 복사하는 실제 구현
| 경로 | 역할 | 신규/수정 |
|---|---|---|
| `src/lib/authors.ts` | 저자 데이터 레이어 (getAuthors · getAuthorById · getAllAuthorIds) | **신규** |
| `src/components/AuthorCard/` | 목록 행 컴포넌트 (`AuthorCard.tsx` · `styles.css.ts` · `index.ts`) | **신규** |
| `src/app/(blog)/authors/page.tsx` + `styles.css.ts` | `/authors` 목록 | **신규** |
| `src/app/(blog)/authors/[id]/page.tsx` + `styles.css.ts` | `/authors/{id}` 상세 | **신규** |
| `src/types/index.ts` | `AuthorListItem` / `AuthorDetail` 타입 추가 | **수정**(기존 보존하며 병합) |
| `src/lib/metadata.ts` | 저자 메타데이터 + JSON-LD 빌더 추가 | **수정** |
| `src/app/sitemap.ts` | 저자 경로 추가 | **수정** |
| `src/app/(blog)/posts/[slug]/page.tsx` | 작가 박스를 `/authors/{id}` 링크로 (포스트→작가 연결) | **수정** |

> **CSS 패치** — 위 작가 박스 링크 스타일은 `patches/journal.css.authorbox.patch.css` 에 있다.
> 레포의 `src/styles/journal.css` 기존 `.authorbox` 블록을 이 내용으로 교체.

### 적용 체크리스트
- [ ] `src/` 파일을 레포에 반영 (신규 그대로 복사, 수정 3개는 기존 내용 보존하며 병합).
- [ ] `profiles`/`posts`가 공개 select(RLS)인지 확인 (마이그레이션은 없음).
- [ ] `SiteFooter`의 "저널" 칼럼에 `<Link href="/authors">집필진</Link>` 추가.
- [ ] `PageInit`이 page 화이트리스트를 쓴다면 `"authors"`, `"author"` 추가(패스스루면 불필요).
- [ ] `/authors`, `/authors/{id}` 빌드 + JSON-LD(Rich Results Test) 확인.
- [ ] 반응형 확인: 390 / 768 / 1024 / 1920 폭.

---

## 한 줄 요약 (Claude Code에 전달할 지시)

> 마운트된 `journal/` 레포(Next.js App Router + vanilla-extract + Supabase)에 집필진 페이지를 추가해줘.
> `prototypes/`의 HTML이 시각/동작 기준이고, `src/`에 레포 스택에 맞춘 즉시 적용 가능한 구현이 들어있어.
> `src/` 파일들을 반영(신규 복사 + 수정 3개 병합)하고, `profiles`/`posts`의 RLS가 공개 select인지 확인한 뒤
> `SiteFooter`에 집필진 링크 한 줄 추가, `/authors`·`/authors/{id}` 빌드와 JSON-LD를 검증해줘.
> 스타일은 새 값 만들지 말고 기존 Atlas 토큰(`ds-system.css`/`journal.css`)만 사용.
