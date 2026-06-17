import type { FaqItem } from "@/types";

/**
 * 아티클 본문 하단(artfoot) FAQ 섹션.
 *
 * 위치: <article> 안, .artfoot__tags 다음 · .authorbox 앞.
 * 동작: 네이티브 <details>/<summary> 아코디언. name="article-faq" 로
 *       한 번에 하나만 열리는 exclusive accordion(추가 JS 0줄).
 * 렌더 규칙: faq 가 null 이거나 빈 배열이면 아무것도 렌더하지 않는다.
 *
 * 스타일은 전역 journal.css(.artfaq / .faqq …)에 있음 — patches/ 참조.
 */

const CHEVRON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;

type Props = { faq?: FaqItem[] | null };

export default function FaqSection({ faq }: Props) {
  if (!faq || faq.length === 0) return null;

  return (
    <section className="artfaq" aria-labelledby="artfaq-h">
      <h2 className="artfaq__eyebrow" id="artfaq-h">자주 묻는 질문</h2>
      <div className="artfaq__list">
        {faq.map((item, i) => (
          <details
            key={i}
            className="faqq"
            name="article-faq"
            open={i === 0}
          >
            <summary className="faqq__q">
              <span className="faqq__mark" aria-hidden="true">Q</span>
              <span className="faqq__qt">{item.q}</span>
              <span
                className="faqq__chev"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: CHEVRON }}
              />
            </summary>
            <div className="faqq__a">
              <span className="faqq__mark faqq__mark--a" aria-hidden="true">A</span>
              <p className="faqq__at">{item.a}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
