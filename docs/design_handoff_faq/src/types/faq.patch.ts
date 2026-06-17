/* ============================================================
   types 패치 — src/types/index.ts 에 병합
   ============================================================ */

/** posts.faq (jsonb) 한 항목. null/빈 배열이면 섹션 미렌더. */
export type FaqItem = {
  q: string;
  a: string;
};

/* 그리고 기존 `Post` 타입에 faq 필드를 추가한다:

export type Post = {
  id: string;
  post_number: number;
  title: string;
  content: string;
  excerpt: string | null;
  reading_minutes: number | null;
  // …기존 필드 유지…
  tags: string[];
  faq: FaqItem[] | null;   // ← 추가 (jsonb, nullable)
  author?: Profile;
};

   PostListItem 에는 추가하지 않는다 — FAQ 는 상세 페이지에서만 쓰인다.
*/
