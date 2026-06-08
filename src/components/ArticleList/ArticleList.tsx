"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { PostListItem, CategoryCount, ArchiveDate } from "@/types";
import { ICON } from "@/utils/icons";
import PostCard from "@/components/PostCard";
import styles from "./styles.css";

interface Filters {
  cat: string;
  tag: string;
  q: string;
  archive: string;
}

interface Props {
  initialPosts: PostListItem[];
  total: number;
  hasMore: boolean;
  categoryCounts: CategoryCount[];
  archiveDates: ArchiveDate[];
  filters: Filters;
}

type ActiveChip = { type: string; val?: string; label: string };

function ArticleList({
  initialPosts,
  total,
  hasMore: initialHasMore,
  categoryCounts,
  archiveDates,
  filters,
}: Props) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [localQ, setLocalQ] = useState(filters.q);
  const [fmoreOpen, setFmoreOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setPosts(initialPosts);
    setHasMore(initialHasMore);
    setPage(1);
  }, [initialPosts, initialHasMore]);

  useEffect(() => {
    setLocalQ(filters.q);
  }, [filters.q]);

  useEffect(() => {
    if (fmoreOpen) document.documentElement.setAttribute("data-fmore", "open");
    else document.documentElement.removeAttribute("data-fmore");
  }, [fmoreOpen]);

  useEffect(() => {
    const el = document.getElementById("ld-list");
    if (!el) return;
    el.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "AUCTORITAS LAB 아티클",
      numberOfItems: total,
      itemListElement: posts.slice(0, 20).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${window.location.origin}/posts/${p.id}`,
        name: p.title,
      })),
    });
  }, [posts, total]);

  const buildURL = useCallback(
    (patch: Partial<Filters>) => {
      const merged = { ...filters, ...patch };
      const params = new URLSearchParams();
      if (merged.cat) params.set("cat", merged.cat);
      if (merged.tag) params.set("tag", merged.tag);
      if (merged.q) params.set("q", merged.q);
      if (merged.archive) params.set("archive", merged.archive);
      const qs = params.toString();
      return qs ? `/?${qs}` : "/";
    },
    [filters],
  );

  const navigate = useCallback(
    (patch: Partial<Filters>) => {
      router.replace(buildURL(patch), { scroll: false });
    },
    [buildURL, router],
  );

  const handleQChange = (value: string) => {
    setLocalQ(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => navigate({ q: value }), 400);
  };

  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    const params = new URLSearchParams();
    if (filters.cat) params.set("cat", filters.cat);
    if (filters.tag) params.set("tag", filters.tag);
    if (filters.q) params.set("q", filters.q);
    if (filters.archive) params.set("archive", filters.archive);
    params.set("page", String(nextPage));
    try {
      const res = await fetch(`/api/posts?${params}`);
      const data = await res.json();
      setPosts((prev) => [...prev, ...data.posts]);
      setHasMore(data.hasMore);
      setPage(nextPage);
    } catch {
      // 실패 시 현재 상태 유지
    } finally {
      setLoadingMore(false);
    }
  };

  const allTags = useMemo(() => {
    const m = new Map<string, number>();
    posts.forEach((p) => (p.tags ?? []).forEach((t) => m.set(t, (m.get(t) ?? 0) + 1)));
    return Array.from(m.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([tag]) => tag);
  }, [posts]);

  const activeChips = useMemo<ActiveChip[]>(() => {
    const chips: ActiveChip[] = [];
    if (filters.cat) chips.push({ type: "cat", label: filters.cat });
    if (filters.archive) {
      const arc = archiveDates.find((a) => a.key === filters.archive);
      if (arc) chips.push({ type: "archive", label: arc.label });
    }
    if (filters.tag) chips.push({ type: "tag", val: filters.tag, label: `#${filters.tag}` });
    if (filters.q.trim()) chips.push({ type: "q", label: `"${filters.q.trim()}"` });
    return chips;
  }, [filters, archiveDates]);

  function clearChip(type: string, val?: string) {
    if (type === "cat") navigate({ cat: "" });
    else if (type === "archive") navigate({ archive: "" });
    else if (type === "q") { setLocalQ(""); navigate({ q: "" }); }
    else if (type === "tag" && val) navigate({ tag: "" });
  }

  function clearAll() {
    setLocalQ("");
    navigate({ cat: "", tag: "", q: "", archive: "" });
  }

  return (
    <section className="wrap home-articles" id="articles" aria-label="아티클">
      <div className={styles.listBody}>
        <aside className={styles.filters} aria-label="필터">
          <div className={`${styles.fsearch} fgroup`}>
            <span dangerouslySetInnerHTML={{ __html: ICON.search }} />
            <input
              id="q"
              type="search"
              placeholder="키워드로 검색 (예: 유치권, 권리금)"
              value={localQ}
              aria-label="키워드 검색"
              onChange={(e) => handleQChange(e.target.value)}
            />
          </div>

          <div className={styles.barselects}>
            <select
              id="bar-archive"
              aria-label="기간"
              value={filters.archive}
              onChange={(e) => navigate({ archive: e.target.value })}
            >
              <option value="">전체 기간</option>
              {archiveDates.map((a) => (
                <option key={a.key} value={a.key}>{a.label}</option>
              ))}
            </select>
          </div>

          <div className="fgroup fgroup--cat">
            <div className={styles.fgroupLabel}>카테고리</div>
            <div className={styles.fcat}>
              {categoryCounts.map((c) => (
                <button
                  key={c.category}
                  className={styles.fcatBtn}
                  data-cat={c.category}
                  aria-pressed={
                    c.category === "all" ? !filters.cat : filters.cat === c.category
                  }
                  onClick={() =>
                    navigate({ cat: c.category === "all" ? "" : c.category })
                  }
                >
                  {c.category === "all" ? "전체" : c.category}
                  <span className={styles.fcatCount}>{c.count}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className={styles.fmoreToggle}
            id="fmoreToggle"
            aria-expanded={fmoreOpen}
            aria-controls="fmore"
            onClick={() => setFmoreOpen((v) => !v)}
          >
            <span>태그 · 아카이브</span>
            <span dangerouslySetInnerHTML={{ __html: ICON.chevron }} />
          </button>

          <div className={styles.fmore} id="fmore">
            {allTags.length > 0 && (
              <div className="fgroup fgroup--tags">
                <div className={styles.fgroupLabel}>태그</div>
                <div className={styles.fchips}>
                  {allTags.map((t) => (
                    <button
                      key={t}
                      className={styles.fchip}
                      data-tag={t}
                      aria-pressed={filters.tag === t}
                      onClick={() => navigate({ tag: filters.tag === t ? "" : t })}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {archiveDates.length > 0 && (
              <div className="fgroup fgroup--archive">
                <div className={styles.fgroupLabel}>아카이브</div>
                <div className={styles.farchive}>
                  {archiveDates.map((a) => (
                    <button
                      key={a.key}
                      className={styles.farchiveBtn}
                      data-archive={a.key}
                      aria-pressed={filters.archive === a.key}
                      onClick={() =>
                        navigate({ archive: filters.archive === a.key ? "" : a.key })
                      }
                    >
                      {a.label}
                      <span className={styles.farchiveCount}>{a.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        <section className={styles.results} aria-live="polite">
          <div className={styles.resultsBar}>
            <div className={styles.resultsCount}>
              <b>총 {total}</b>건의 아티클
            </div>
            {activeChips.length > 0 && (
              <div className={styles.resultsActive}>
                {activeChips.map((c, i) => (
                  <button
                    key={i}
                    className={styles.activechip}
                    onClick={() => clearChip(c.type, c.val)}
                  >
                    {c.label}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
                      <path d="M6 6l12 12M18 6 6 18" />
                    </svg>
                  </button>
                ))}
                <button className={styles.resultsClear} onClick={clearAll}>
                  모두 지우기
                </button>
              </div>
            )}
          </div>

          {posts.length > 0 ? (
            <>
              <div className={styles.cardgrid}>
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>

              {hasMore && (
                <div className={styles.loadmoreWrap}>
                  <button
                    className={styles.loadmoreBtn}
                    onClick={loadMore}
                    disabled={loadingMore}
                    aria-label="아티클 더 보기"
                  >
                    {loadingMore ? "불러오는 중…" : "더 보기"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className={styles.empty}>
              <h3>조건에 맞는 아티클이 없어요</h3>
              <p>필터를 줄이거나 다른 키워드로 검색해 보세요.</p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

export default ArticleList;
