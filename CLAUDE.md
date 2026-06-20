# 법무법인 저널 (Law Firm Blog)

## 프로젝트 개요

- 법무법인이 운영하는 법률 저널(블로그) 사이트 — 글 표시 전용 (read-only display)
- 어드민 대시보드(글 작성/발행)는 별도 구현됨. 이 레포는 퍼블릭 블로그만 담당
- 데이터 소스: Supabase (PostgreSQL) — 별도 CMS 서비스 없음

## 기술 스택

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** vanilla-extract
- **Database:** Supabase (`@supabase/ssr` for Server Components)
- **Package manager:** pnpm

## 핵심 요구사항

- SEO / AEO / GEO 최우선 — 모든 페이지 서버 렌더링, JSON-LD 구조화 데이터 필수
- 글 탐색: 키워드 검색, 카테고리·태그·작성자 필터, 연도/월 아카이브, 관련 글 추천

## 환경

- `.env.local.example` 참고해 `.env.local` 설정 (SUPABASE_URL, ANON_KEY, SITE_URL 등)
- `pnpm dlx` 사용 (npx 미설치)
- `pnpm-workspace.yaml`의 `allowBuilds`에 `sharp`, `unrs-resolver`, `@swc/core`, `esbuild` 허용 설정 있음

## 컴포넌트 작성 규칙

컴포넌트는 `src/components/<Name>/` 폴더 안에 아래 3개 파일로 구성한다.

```
src/components/<Name>/
├── <Name>.tsx       # 구현
├── styles.css.ts    # 스타일
└── index.ts         # 외부 노출
```

**`<Name>.tsx`** — 구현 파일. props가 있는 경우에만 `interface Props`를 선언하고, 컴포넌트는 `function` 키워드로 작성한다. props가 없는 컴포넌트는 `interface Props`를 선언하지 않는다. `styles.css.ts`에서 가져온 `styles` 객체를 `styles.root` 형태로 사용한다. 파일 끝은 빈 줄 + `export default <Name>`.

**`styles.css.ts`** — 스타일 파일. 컴포넌트에 적용할 스타일이 있는 경우에만 만든다. 스타일이 불필요한 컴포넌트는 이 파일을 생성하지 않는다. 각 스타일을 `const`로 선언한 뒤 `styles` 객체에 묶어 `export default styles`로 내보낸다.

```ts
const root = style({});
const text = style({});

const styles = { root, text };

export default styles;
```

**`index.ts`** — re-export 전용. 아래 한 줄만 작성한다.

```ts
export { default } from './<Name>';
```

## 하네스 (검증 스크립트)

코드를 수정한 뒤 반드시 아래 명령으로 검증한다. CI도 동일한 스크립트를 실행한다.

```bash
pnpm typecheck      # TypeScript 타입 오류 확인
pnpm lint           # ESLint 오류 확인
pnpm format:check   # Prettier 포맷 확인
pnpm validate       # typecheck + lint 한 번에 (커밋 전 기본 검증)
pnpm format         # 포맷 자동 수정 (필요 시)
```

- **커밋 시**: Husky pre-commit hook이 `lint-staged`를 실행하여 스테이징된 파일에 ESLint + Prettier를 자동 적용
- **CI**: push/PR 시 `validate` job(typecheck → lint → format:check) → `build` job 순으로 실행
- **빌드 환경변수**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`는 GitHub Secrets에 등록 필요

## 코딩 컨벤션

### TypeScript / React

- **컴포넌트**: `function` 키워드 사용, 화살표 함수 컴포넌트 금지
- **Props 타입**: props가 있으면 항상 `interface Props`로 선언한다. props가 없으면 선언하지 않는다
- **import 순서**: 프레임워크 → 라이브러리 → `@/lib` → `@/types` → `@/utils` → `@/components` → `./styles.css`
- **타입 전용 import**: `import type { X }` 사용 (`import { type X }` 아님)
- **경로 alias**: 모든 src 내부 참조는 `@/` 사용 (상대경로 금지)
- **서버/클라이언트 컴포넌트**: App Router 기본은 서버 컴포넌트. `"use client"` 지시어는 훅·이벤트 핸들러·브라우저 API가 필요한 경우에만 파일 최상단에 추가
- **named export**: 유틸·lib 함수는 named export. 컴포넌트는 `export default`
- **스타일 import**: `import styles from './styles.css'` — `.ts` 확장자 없이 쓴다

### 포맷팅

- Prettier 설정: `singleQuote: true`, `semi: true`, `trailingComma: "all"`, `arrowParens: "avoid"`
- 코드 수정 후 `pnpm format`으로 포맷 통일 (따옴표·세미콜론·후행 쉼표 자동 정리)

## vanilla-extract CSS 스타일링

### 기본 구조

```ts
// styles.css.ts
import { style, globalStyle } from '@vanilla-extract/css';

const root = style({ ... });

const styles = { root };
export default styles;
```

### `style()` vs `globalStyle()` 사용 기준

| 상황                                 | 방법                                                        |
| ------------------------------------ | ----------------------------------------------------------- |
| 컴포넌트 자체 스타일                 | `style()`                                                   |
| `data-*` 속성(html 요소)에 따른 변형 | `style()` 안의 `selectors: { 'html[data-X="y"] &': {...} }` |
| 미디어 쿼리 내 scoped 클래스 참조    | `globalStyle(\`html[...] .\${cls}\`, { '@media': {...} })`  |
| 부모/형제 hover → 자식 스타일 변화   | `globalStyle(\`\${parent}:hover .\${child}\`, {...})`       |
| 자식 태그 직접 선택 (예: `img`)      | `globalStyle(\`\${wrapper} img\`, {...})`                   |

```ts
// ✅ data-* 속성 변형은 selectors 안에서
const thumb = style({
  aspectRatio: '16 / 10',
  selectors: {
    'html[data-card="overlay"] &': { aspectRatio: '3 / 4' },
    'html[data-thumb="off"] &': { display: 'none' },
  },
});

// ✅ 미디어 쿼리 + scoped 클래스는 globalStyle
globalStyle(`html[data-card="list"] .${link}`, {
  '@media': { '(max-width: 720px)': { flexDirection: 'column' } },
});

// ✅ 부모 hover → 자식 색상 변화
globalStyle(`${link}:hover .${title}`, {
  color: 'var(--accent-strong)',
});
```

### CSS 토큰 (ds-system.css)

컴포넌트 안에서 직접 색상·크기 값을 쓰지 말고 항상 CSS 변수 사용:

```ts
// ❌ 하드코딩
color: '#161616';
// ✅ 토큰
color: 'var(--ink)';
```

주요 토큰:

| 범주       | 변수                                                            |
| ---------- | --------------------------------------------------------------- |
| 텍스트     | `--ink` (주), `--fg`, `--fg-2`, `--fg-3`                        |
| 배경       | `--bg`, `--surface`, `--surface-2`                              |
| 강조색     | `--accent`, `--accent-strong`, `--accent-soft`, `--accent-ring` |
| 선         | `--line`, `--line-2`                                            |
| 타이포     | `--font`, `--fs-display`~`--fs-xs`, `--lh-tight`~`--lh-body`    |
| 간격 (8pt) | `--s1`(4px) ~ `--s10`(128px)                                    |
| 모서리     | `--r-btn`, `--r-card`, `--r-input`, `--r-chip`                  |
| 그림자     | `--sh-1` ~ `--sh-4`, `--card-shadow`                            |
| 모션       | `--d` (200ms), `--ease`                                         |

### 전역 유틸리티 클래스 (Global CSS)

`ds-system.css`와 `journal.css`에 정의된 유틸리티 클래스는 `className`에 직접 사용:

```tsx
// 글로벌 클래스 단독 사용
<span className="eyebrow">카테고리</span>
<span className="dotsep">·</span>
<span className="ptag">태그</span>
<span className="avatar avatar--dark">A</span>

// 글로벌 클래스 + scoped 스타일 혼합
<span className={`eyebrow ${styles.kicker}`}>...</span>
<span className={`avatar avatar--accent ${styles.avatarInitial}`}>...</span>
```

주요 글로벌 클래스: `.wrap`, `.wrap--narrow`, `.eyebrow`, `.ptag`, `.dotsep`, `.avatar`, `.avatar--dark`, `.avatar--accent`, `.btn`, `.btn--primary`, `.btn--ghost`, `.chip`, `.chip--active`, `.badge`, `.prose`, `.on-dark`, `.sec`, `.sec__head`, `.listhead`, `hero-lite`

### data-\* 테마 시스템

`<html>` 요소의 `data-*` 속성이 전체 레이아웃 변형을 제어한다. 새 컴포넌트에서 이 변형을 지원할 때 반드시 `selectors`에 추가:

| 속성           | 값                                            |
| -------------- | --------------------------------------------- |
| `data-card`    | `stacked` \| `minimal` \| `list` \| `overlay` |
| `data-thumb`   | `on` \| `off`                                 |
| `data-shape`   | `sharp` \| `soft` \| `rounded` \| `pill`      |
| `data-reading` | `centered` \| `railed` \| `wide`              |
| `data-cover`   | `none` \| `banner` \| `overlay` \| `split`    |
| `data-font`    | `pretendard` \| `noto` \| `plex` \| `system`  |
| `data-fill`    | `solid` \| `gradient` \| `outline`            |

## 데이터 페칭 패턴

- **`unstable_cache`**: Supabase 쿼리 결과를 ISR 방식으로 캐싱 (`revalidate` 초 단위 지정)
- **`cache()` (React)**: 동일 요청 내 중복 호출 방지 (request-level dedup)
- **`createStaticClient()`**: 빌드 타임·서버사이드 Supabase 클라이언트 (`src/lib/supabase/static.ts`)
- 페이지 컴포넌트에서 Supabase 직접 호출 금지 — 반드시 `src/lib/` 함수 경유
- 페이지 레벨 ISR: `export const revalidate = 60` (초)

## 주요 파일

- `src/lib/supabase/server.ts` — Server Component용 Supabase 클라이언트
- `src/lib/supabase/client.ts` — 브라우저용 Supabase 클라이언트
- `src/lib/posts.ts` — 글 목록·상세·관련글 쿼리 함수
- `src/lib/metadata.ts` — OG 메타데이터 및 JSON-LD 빌더
- `src/types/index.ts` — Post, Author, Category, Tag 타입 정의
- `src/styles/ds-system.css` — ATLAS 디자인 시스템 (토큰, 버튼, 인풋 등 전역 클래스)
- `src/styles/journal.css` — 저널 레이아웃 레이어 (wrap, prose, arthead, toc 등)
