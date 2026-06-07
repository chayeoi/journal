"use client";

import { useEffect } from "react";

interface Props {
  page: "home" | "detail";
}

export function PageInit({ page }: Props) {
  useEffect(() => {
    document.documentElement.setAttribute("data-page", page);
  }, [page]);
  return null;
}
