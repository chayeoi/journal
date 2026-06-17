import type { FaqItem } from "@/types";

const CHEVRON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;

interface Props {
  faq?: FaqItem[] | null;
}

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
