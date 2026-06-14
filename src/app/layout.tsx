// src/app/layout.tsx
import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { defaultMetadata } from "@/lib/metadata";
import "@/styles/ds-system.css";
import "@/styles/journal.css";
import "./globals.css";

// FOUC 방지: localStorage 트윅을 첫 페인트 전에 html 속성으로 적용
const FOUC_SCRIPT = `(function(){try{
  var d=JSON.parse(localStorage.getItem("auctoritas.tweaks.v4")||"{}"),r=document.documentElement;
  r.style.setProperty("--accent","#3B82F6");
  if(d.font)r.setAttribute("data-font",d.font);
  r.setAttribute("data-thumb",d.thumb||"on");
  r.setAttribute("data-shape","rounded");
  r.setAttribute("data-carousel","overlay");
  r.setAttribute("data-card","list");
  r.setAttribute("data-filter","rail");
  r.setAttribute("data-tagstyle",d.tagstyle||"hash");
  if(d.reading)r.setAttribute("data-reading",d.reading);
}catch(e){}})();`;

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ko"
      data-shape="rounded"
      data-carousel="overlay"
      data-card="list"
      data-thumb="on"
      data-filter="rail"
      data-tagstyle="hash"
      data-font="pretendard"
      data-reading="railed"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: FOUC_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>
        {children}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
