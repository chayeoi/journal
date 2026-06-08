"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { PostListItem, CategoryCount, ArchiveDate } from "@/types";
import { ICON } from "@/utils/icons";
import { fmtDate } from "@/utils/format";

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

export function ArticleList({
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

  // 서버에서 새 initialPosts가 오면 (필터 변경) 상태 리셋
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

  // JSON-LD ItemList 업데이트
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

  // 로드된 포스트에서 태그 집계 (사이드바용)
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
      <div className="listbody">
        <aside className="filters" aria-label="필터">
          <div className="fsearch fgroup">
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

          <div className="barselects">
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
            <div className="fgroup__label">카테고리</div>
            <div className="fcat">
              {categoryCounts.map((c) => (
                <button
                  key={c.category}
                  data-cat={c.category}
                  aria-pressed={
                    c.category === "all" ? !filters.cat : filters.cat === c.category
                  }
                  onClick={() =>
                    navigate({ cat: c.category === "all" ? "" : c.category })
                  }
                >
                  {c.category === "all" ? "전체" : c.category}
                  <span className="fcat__count">{c.count}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="fmore-toggle"
            id="fmoreToggle"
            aria-expanded={fmoreOpen}
            aria-controls="fmore"
            onClick={() => setFmoreOpen((v) => !v)}
          >
            <span>태그 · 아카이브</span>
            <span dangerouslySetInnerHTML={{ __html: ICON.chevron }} />
          </button>

          <div className="fmore" id="fmore">
            {allTags.length > 0 && (
              <div className="fgroup fgroup--tags">
                <div className="fgroup__label">태그</div>
                <div className="fchips">
                  {allTags.map((t) => (
                    <button
                      key={t}
                      className="fchip"
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
                <div className="fgroup__label">아카이브</div>
                <div className="farchive">
                  {archiveDates.map((a) => (
                    <button
                      key={a.key}
                      data-archive={a.key}
                      aria-pressed={filters.archive === a.key}
                      onClick={() =>
                        navigate({ archive: filters.archive === a.key ? "" : a.key })
                      }
                    >
                      {a.label}
                      <span className="farchive__count">{a.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        <section className="results" aria-live="polite">
          <div className="results__bar">
            <div className="results__count">
              <b>총 {total}</b>건의 아티클
            </div>
            {activeChips.length > 0 && (
              <div className="results__active">
                {activeChips.map((c, i) => (
                  <button
                    key={i}
                    className="activechip"
                    onClick={() => clearChip(c.type, c.val)}
                  >
                    {c.label}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
                      <path d="M6 6l12 12M18 6 6 18" />
                    </svg>
                  </button>
                ))}
                <button className="results__clear" onClick={clearAll}>
                  모두 지우기
                </button>
              </div>
            )}
          </div>

          {posts.length > 0 ? (
            <>
              <div className="cardgrid">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>

              {hasMore && (
                <div style={{ display: "flex", justifyContent: "center", paddingTop: 40 }}>
                  <button
                    className="loadmore-btn"
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
            <div className="empty">
              <h3>조건에 맞는 아티클이 없어요</h3>
              <p>필터를 줄이거나 다른 키워드로 검색해 보세요.</p>
            </div>
          )}
        </section>
      </div>

      <style>{`
        .loadmore-btn {
          padding: 12px 32px;
          font-size: 14px;
          font-weight: 700;
          color: var(--ink);
          background: var(--surface-2);
          border: 1.5px solid var(--border);
          border-radius: var(--r-btn);
          cursor: pointer;
          transition: background var(--d) var(--ease), border-color var(--d) var(--ease);
        }
        .loadmore-btn:hover:not(:disabled) {
          background: var(--accent);
          border-color: var(--accent);
          color: #fff;
        }
        .loadmore-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </section>
  );
}

function PostCard({ post }: { post: PostListItem }) {
  const tags = (post.tags ?? []).slice(0, 3);
  const readingTime = post.reading_minutes ?? 1;
  const dateStr = post.published_at ? fmtDate(post.published_at, "short") : "";

  return (
    <article className="pcard" data-cat={post.category ?? ""}>
      <a className="pcard__link" href={`/posts/${post.id}`} aria-label={post.title}>
        <span className="pcard__thumb">
          {post.thumbnail_url ? (
            <img
              src={post.thumbnail_url}
              alt=""
              loading="lazy"
              width={1600}
              height={900}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "var(--surface-2)" }} />
          )}
          {post.category && (
            <span className="pcard__cat eyebrow">{post.category}</span>
          )}
        </span>
        <span className="pcard__body">
          {post.category && (
            <span className="pcard__kicker eyebrow">{post.category}</span>
          )}
          <h3 className="pcard__title">{post.title}</h3>
          {post.excerpt && (
            <p className="pcard__excerpt">{post.excerpt}</p>
          )}
          <span className="pcard__tags">
            {tags.map((t) => (
              <span key={t} className="ptag">{t}</span>
            ))}
          </span>
          <span className="pcard__foot">
            {post.author?.avatar_url ? (
              <img
                src={post.author.avatar_url}
                alt={post.author.display_name}
                width={24}
                height={24}
                style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
              />
            ) : (
              <span
                className="avatar avatar--accent"
                style={{ width: 24, height: 24, fontSize: 11, fontWeight: 700 }}
                aria-hidden="true"
              >
                {(post.author?.display_name ?? "A").charAt(0)}
              </span>
            )}
            <span className="pcard__who">
              <span className="pcard__by">
                {post.author?.display_name ?? "AUCTORITAS"}
              </span>
            </span>
            <span className="pcard__metaline">
              {dateStr && <time dateTime={post.published_at ?? ""}>{dateStr}</time>}
              <span className="dotsep" aria-hidden="true">·</span>
              {readingTime}분
            </span>
          </span>
        </span>
      </a>
    </article>
  );
}
