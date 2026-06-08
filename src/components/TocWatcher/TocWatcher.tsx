"use client";

import { useEffect } from "react";
import type { Heading } from "@/utils/toc";

interface Props {
  headings: Heading[];
}

function TocWatcher({ headings }: Props) {
  useEffect(() => {
    if (!headings.length) return;

    const links = new Map<string, HTMLAnchorElement>();
    document.querySelectorAll<HTMLAnchorElement>("#toc a").forEach((l) => {
      const id = l.getAttribute("href")?.slice(1);
      if (id) links.set(id, l);
    });

    const secs = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);

    function onScroll() {
      const headerH =
        parseInt(
          getComputedStyle(document.documentElement).getPropertyValue("--headerH"),
        ) || 64;
      const top = window.scrollY + headerH + 60;
      let cur = secs[0];
      secs.forEach((s) => {
        if (s.offsetTop <= top) cur = s;
      });
      links.forEach((link, id) => {
        link.classList.toggle("is-active", cur?.id === id);
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [headings]);

  return null;
}

export default TocWatcher;
