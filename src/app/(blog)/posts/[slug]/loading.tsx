import React from 'react';

const skel = {
  background: 'var(--surface-2)',
  borderRadius: '4px',
  animation: 'pulse 1.5s ease-in-out infinite',
} as React.CSSProperties;

export default function Loading() {
  return (
    <>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>

      {/* 헤더 높이 유지 */}
      <div style={{ height: 'var(--header-h, 60px)' }} />

      <main className="wrap" id="article-main" aria-hidden="true">
        {/* 브레드크럼 */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <div style={{ ...skel, width: '24px', height: '14px' }} />
          <div style={{ ...skel, width: '6px', height: '14px' }} />
          <div style={{ ...skel, width: '80px', height: '14px' }} />
          <div style={{ ...skel, width: '6px', height: '14px' }} />
          <div style={{ ...skel, width: '160px', height: '14px' }} />
        </div>

        {/* arthead: 제목 + 커버 */}
        <header className="arthead">
          <div className="arthead__text">
            {/* 카테고리 라인 */}
            <div
              style={{
                ...skel,
                width: '80px',
                height: '14px',
                marginBottom: '12px',
              }}
            />
            {/* 제목 2줄 */}
            <div
              style={{
                ...skel,
                width: '85%',
                height: '36px',
                marginBottom: '10px',
              }}
            />
            <div
              style={{
                ...skel,
                width: '65%',
                height: '36px',
                marginBottom: '16px',
              }}
            />
            {/* 메타 1줄 */}
            <div style={{ ...skel, width: '200px', height: '16px' }} />
          </div>
          <figure className="artcover" style={{ margin: 0 }}>
            <div
              style={{
                ...skel,
                width: '100%',
                aspectRatio: '16/9',
                borderRadius: '8px',
              }}
            />
          </figure>
        </header>

        {/* 본문 스켈레톤 */}
        <div className="artbody">
          {/* 사이드 목차 자리 */}
          <div className="artrail" />

          {/* 본문 텍스트 라인들 */}
          <div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                paddingTop: '8px',
              }}
            >
              {[
                '100%',
                '95%',
                '88%',
                '100%',
                '92%',
                '70%',
                '100%',
                '97%',
                '85%',
                '100%',
                '60%',
              ].map((w, i) => (
                <div key={i} style={{ ...skel, width: w, height: '16px' }} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
