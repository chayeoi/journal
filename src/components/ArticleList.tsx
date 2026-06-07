"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type { PostListItem, Category } from "@/types";
import { ICON } from "@/utils/icons";
import { fmtDate } from "@/utils/format";
import { calcReadingTime } from "@/utils/reading-time";

interface FilterState {
  q: string;
  cat: string;
  tags: string[];
  archive: string;
  sort: "new" | "old";
}

interface ArchiveItem {
  key: string;
  label: string;
  count: number;
}

interface Props {
  posts: PostListItem[];
  categories: Category[];
  initialCat?: string;
  initialTag?: string;
}

type ActiveChip = { type: string; val?: string; label: string };

export function ArticleList({ posts, categories, initialCat, initialTag }: Props) {
  const [state, setState] = useState<FilterState>({
    q: "",
    cat: initialCat ?? "all",
    tags: initialTag ? [initialTag] : [],
    archive: "all",
    sort: "new",
  });

  const allTags = useMemo(() => {
    const m = new Map<string, { slug: string; name: string; count: number }>();
    posts.forEach((p) =>
      p.tags?.forEach((t) => {
        const e = m.get(t.slug);
        if (e) e.count++;
        else m.set(t.slug, { slug: t.slug, name: t.name, count: 1 });
      }),
    );
    return Array.from(m.values()).sort((a, b) => b.count - a.count);
  }, [posts]);

  const archiveDates = useMemo<ArchiveItem[]>(() => {
    const m = new Map<string, number>();
    posts.forEach((p) => {
      if (!p.published_at) return;
      const key = p.published_at.slice(0, 7);
      m.set(key, (m.get(key) ?? 0) + 1);
    });
    return Array.from(m.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, count]) => {
        const [y, mo] = key.split("-");
        return { key, label: `${y}년 ${parseInt(mo)}월`, count };
      });
  }, [posts]);

  const catCount = useCallback(
    (slug: string) => posts.filter((p) => p.category?.slug === slug).length,
    [posts],
  );

  const filtered = useMemo(() => {
    const q = state.q.trim().toLowerCase();
    return posts
      .filter((p) => {
        if (state.cat !== "all" && p.category?.slug !== state.cat) return false;
        if (state.archive !== "all") {
          if (!p.published_at || !p.published_at.startsWith(state.archive))
            return false;
        }
        if (state.tags.length) {
          const pSlugs = p.tags?.map((t) => t.slug) ?? [];
          if (!state.tags.every((t) => pSlugs.includes(t))) return false;
        }
        if (q) {
          const hay = [
            p.title,
            p.excerpt ?? "",
            p.tags?.map((t) => t.name).join(" ") ?? "",
            p.author?.name ?? "",
            p.category?.name ?? "",
          ]
            .join(" ")
            .toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const da = a.published_at ?? a.created_at;
        const db = b.published_at ?? b.created_at;
        return state.sort === "new"
          ? db.localeCompare(da)
          : da.localeCompare(db);
      });
  }, [posts, state]);

  const syncURL = useCallback((s: FilterState) => {
    const p = new URLSearchParams();
    if (s.cat !== "all") p.set("cat", s.cat);
    if (s.tags.length === 1) p.set("tag", s.tags[0]);
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, []);

  const update = useCallback(
    (patch: Partial<FilterState>) => {
      setState((prev) => {
        const next = { ...prev, ...patch };
        syncURL(next);
        return next;
      });
    },
    [syncURL],
  );

  useEffect(() => {
    const el = document.getElementById("ld-list");
    if (!el) return;
    const data = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "AUCTORITAS LAB 아티클",
      numberOfItems: filtered.length,
      itemListElement: filtered.slice(0, 20).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${window.location.origin}/posts/${p.slug}`,
        name: p.title,
      })),
    };
    el.textContent = JSON.stringify(data);
  }, [filtered]);

  const activeChips = useMemo<ActiveChip[]>(() => {
    const chips: ActiveChip[] = [];
    if (state.cat !== "all") {
      const cat = categories.find((c) => c.slug === state.cat);
      if (cat) chips.push({ type: "cat", label: cat.name });
    }
    if (state.archive !== "all") {
      const arc = archiveDates.find((a) => a.key === state.archive);
      if (arc) chips.push({ type: "archive", label: arc.label });
    }
    state.tags.forEach((t) => {
      const tag = allTags.find((a) => a.slug === t);
      chips.push({ type: "tag", val: t, label: `#${tag?.name ?? t}` });
    });
    if (state.q.trim()) chips.push({ type: "q", label: `"${state.q.trim()}"` });
    return chips;
  }, [state, categories, archiveDates, allTags]);

  function clearChip(type: string, val?: string) {
    if (type === "cat") update({ cat: "all" });
    else if (type === "archive") update({ archive: "all" });
    else if (type === "q") update({ q: "" });
    else if (type === "tag" && val) {
      update({ tags: state.tags.filter((t) => t !== val) });
    }
  }

  const [fmoreOpen, setFmoreOpen] = useState(false);

  useEffect(() => {
    if (fmoreOpen) document.documentElement.setAttribute("data-fmore", "open");
    else document.documentElement.removeAttribute("data-fmore");
  }, [fmoreOpen]);

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
              value={state.q}
              aria-label="키워드 검색"
              onChange={(e) => update({ q: e.target.value })}
            />
          </div>

          <div className="barselects">
            <select
              id="bar-archive"
              aria-label="기간"
              value={state.archive}
              onChange={(e) => update({ archive: e.target.value })}
            >
              <option value="all">전체 기간</option>
              {archiveDates.map((a) => (
                <option key={a.key} value={a.key}>{a.label}</option>
              ))}
            </select>
          </div>

          <div className="fgroup fgroup--cat">
            <div className="fgroup__label">카테고리</div>
            <div className="fcat">
              <button
                data-cat="all"
                aria-pressed={state.cat === "all"}
                onClick={() => update({ cat: "all" })}
              >
                전체<span className="fcat__count">{posts.length}</span>
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  data-cat={c.slug}
                  aria-pressed={state.cat === c.slug}
                  onClick={() => update({ cat: c.slug })}
                >
                  {c.name}
                  <span className="fcat__count">{catCount(c.slug)}</span>
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
            <div className="fgroup fgroup--tags">
              <div className="fgroup__label">태그</div>
              <div className="fchips">
                {allTags.map((t) => (
                  <button
                    key={t.slug}
                    className="fchip"
                    data-tag={t.slug}
                    aria-pressed={state.tags.includes(t.slug)}
                    onClick={() => {
                      const i = state.tags.indexOf(t.slug);
                      update({
                        tags:
                          i > -1
                            ? state.tags.filter((x) => x !== t.slug)
                            : [...state.tags, t.slug],
                      });
                    }}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="fgroup fgroup--archive">
              <div className="fgroup__label">아카이브</div>
              <div className="farchive">
                {archiveDates.map((a) => (
                  <button
                    key={a.key}
                    data-archive={a.key}
                    aria-pressed={state.archive === a.key}
                    onClick={() =>
                      update({
                        archive: state.archive === a.key ? "all" : a.key,
                      })
                    }
                  >
                    {a.label}
                    <span className="farchive__count">{a.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <section className="results" aria-live="polite">
          <div className="results__bar">
            <div className="results__count">
              <b>총 {filtered.length}</b>건의 아티클
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
                <button
                  className="results__clear"
                  onClick={() =>
                    update({ q: "", cat: "all", tags: [], archive: "all" })
                  }
                >
                  모두 지우기
                </button>
              </div>
            )}
          </div>

          {filtered.length > 0 ? (
            <div className="cardgrid">
              {filtered.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <h3>조건에 맞는 아티클이 없어요</h3>
              <p>필터를 줄이거나 다른 키워드로 검색해 보세요.</p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

function PostCard({ post }: { post: PostListItem }) {
  const tags = (post.tags ?? []).slice(0, 3);
  const readingTime = calcReadingTime(post.excerpt ?? "");
  const dateStr = post.published_at
    ? fmtDate(post.published_at, "short")
    : "";

  return (
    <article className="pcard" data-cat={post.category?.slug ?? ""}>
      <a className="pcard__link" href={`/posts/${post.slug}`} aria-label={post.title}>
        <span className="pcard__thumb">
          {post.cover_image_url ? (
            <img
              src={post.cover_image_url}
              alt=""
              loading="lazy"
              width={1600}
              height={900}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "var(--surface-2)" }} />
          )}
          <span className="pcard__cat eyebrow">{post.category?.name ?? ""}</span>
        </span>
        <span className="pcard__body">
          <span className="pcard__kicker eyebrow">{post.category?.name ?? ""}</span>
          <h3 className="pcard__title">{post.title}</h3>
          {post.excerpt && (
            <p className="pcard__excerpt">{post.excerpt}</p>
          )}
          <span className="pcard__tags">
            {tags.map((t) => (
              <span key={t.slug} className="ptag">{t.name}</span>
            ))}
          </span>
          <span className="pcard__foot">
            <span
              className="avatar"
              style={{ width: 24, height: 24, fontSize: 11, fontWeight: 700 }}
              aria-hidden="true"
            />
            <span className="pcard__who">
              <span className="pcard__by">AUCTORITAS</span>
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
