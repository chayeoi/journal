/* ============================================================
   metadata 패치 — src/lib/metadata.ts 에 병합
   FAQPage JSON-LD. AEO(answer engine) / 리치 결과를 위한 구조화 데이터.
   ============================================================ */

import type { FaqItem } from "@/types";

/**
 * FAQPage 노드 빌더.
 * faq 가 비어 있으면 null 을 반환 → 호출부에서 graph 에 넣지 않는다.
 * answer 텍스트는 평문만 권장(HTML 태그 금지) — 구글 FAQ 가이드라인.
 */
export function buildFaqJsonLd(faq?: FaqItem[] | null) {
  if (!faq || faq.length === 0) return null;
  return {
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

/* ── buildPostJsonLd 에 합치는 방법 ──────────────────────────
   기존 함수가 { "@context", "@graph": [BlogPosting, BreadcrumbList] } 를
   반환하므로, FAQPage 노드를 같은 @graph 에 conditional 하게 push 한다.

   export function buildPostJsonLd(post: Post) {
     const excerpt = getExcerpt(post.content);
     const graph: object[] = [
       { "@type": "BlogPosting", ... },     // 기존
       { "@type": "BreadcrumbList", ... },  // 기존
     ];

     const faqNode = buildFaqJsonLd(post.faq);   // ← 추가
     if (faqNode) graph.push(faqNode);           // ← 추가

     return { "@context": "https://schema.org", "@graph": graph };
   }

   → 별도 <script> 를 또 만들 필요 없이 기존 한 개의 JSON-LD 안에 합쳐진다.
     (page.tsx 는 이미 buildPostJsonLd 결과를 출력하므로 추가 작업 없음.)
   ──────────────────────────────────────────────────────────── */
