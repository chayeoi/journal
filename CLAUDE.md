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

## 주요 파일
- `src/lib/supabase/server.ts` — Server Component용 Supabase 클라이언트
- `src/lib/supabase/client.ts` — 브라우저용 Supabase 클라이언트
- `src/lib/posts.ts` — 글 목록·상세·관련글 쿼리 함수
- `src/lib/metadata.ts` — OG 메타데이터 및 JSON-LD 빌더
- `src/types/index.ts` — Post, Author, Category, Tag 타입 정의
