"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

export function SiteHeader() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = ref.current;
    if (!header) return;
    let lastY = window.scrollY;
    let ticking = false;

    function update() {
      const y = window.scrollY;
      const delta = y - lastY;
      if (Math.abs(delta) > 6) {
        if (delta > 0 && y > 80) header!.setAttribute("data-hidden", "true");
        else header!.removeAttribute("data-hidden");
        lastY = y;
      }
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="site-header" ref={ref}>
      <div className="site-header__in">
        <Link className="brand" href="/">
          AUCTORITAS LAB
        </Link>
        <span className="site-header__spacer" />
        <a className="site-header__cta" href="#site-footer">
          <span>상담 문의</span>
        </a>
      </div>
    </header>
  );
}
