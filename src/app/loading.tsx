import React from "react";

const skel = {
  background: "var(--surface-2)",
  borderRadius: "4px",
  animation: "pulse 1.5s ease-in-out infinite",
} as React.CSSProperties;

const cardSkel = {
  ...skel,
  height: "280px",
  borderRadius: "8px",
} as React.CSSProperties;

export default function Loading() {
  return (
    <>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>

      {/* 헤더 높이 유지 */}
      <div style={{ height: "var(--header-h, 60px)" }} />

      <main>
        {/* 히어로 영역 */}
        <section className="hero-lite wrap" aria-hidden="true">
          <div style={{ ...skel, width: "140px", height: "16px", marginBottom: "12px" }} />
          <div style={{ ...skel, width: "60%", height: "36px", marginBottom: "8px" }} />
          <div style={{ ...skel, width: "45%", height: "36px", marginBottom: "16px" }} />
          <div style={{ ...skel, width: "80%", height: "18px" }} />
        </section>

        {/* FeaturedCarousel 플레이스홀더 */}
        <div
          aria-hidden="true"
          style={{
            ...skel,
            width: "100%",
            aspectRatio: "21/9",
            borderRadius: "0",
            maxHeight: "480px",
          }}
        />

        {/* ArticleList 플레이스홀더 */}
        <div className="wrap" style={{ marginTop: "var(--sp-10, 40px)" }} aria-hidden="true">
          {/* 카테고리 필터 줄 */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                style={{ ...skel, width: i === 0 ? "60px" : "80px", height: "32px", borderRadius: "20px" }}
              />
            ))}
          </div>

          {/* 카드 그리드 6개 */}
          <div className="cardgrid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={cardSkel} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
