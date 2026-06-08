"use client";

import { useEffect } from "react";

interface Props {
  page: "home" | "detail";
  cover?: "overlay"; // locked: only overlay; not exposed in tweaks panel
}

export function PageInit({ page, cover }: Props) {
  useEffect(() => {
    const r = document.documentElement;
    r.setAttribute("data-page", page);
    if (cover) r.setAttribute("data-cover", cover);
    else r.removeAttribute("data-cover");
  }, [page, cover]);
  return null;
}
