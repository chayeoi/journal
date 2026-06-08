"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import type { PostListItem } from "@/types";
import { ICON } from "@/utils/icons";
import { fmtDate } from "@/utils/format";

interface Props {
  posts: PostListItem[];
}

const DELAY = 5000;

export function FeaturedCarousel({ posts }: Props) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const n = posts.length;

  const goSlide = useCallback(
    (i: number) => setCurrent(((i % n) + n) % n),
    [n],
  );

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % n), DELAY);
  }, [n]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    startTimer();
    const onVis = () => (document.hidden ? stopTimer() : startTimer());
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stopTimer();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [startTimer, stopTimer]);

  if (!posts.length) return null;

  return (
    <section className="wrap" aria-label="대표 아티클" aria-roledescription="carousel">
      <div
        className="carousel"
        onMouseEnter={stopTimer}
        onMouseLeave={startTimer}
      >
        <div
          className="carousel__track"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {posts.map((post, i) => (
            <a
              key={post.id}
              className={`cslide${i === current ? " is-active" : ""}`}
              href={`/posts/${post.id}`}
              aria-hidden={i !== current}
            >
              <span className="cslide__media">
                {post.thumbnail_url ? (
                  <Image
                    src={post.thumbnail_url}
                    alt=""
                    fill
                    style={{ objectFit: "cover" }}
                    priority={i === 0}
                    sizes="(max-width: 720px) 100vw, 1180px"
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "var(--ink-bg)" }} />
                )}
              </span>
              <span className="cslide__shade" />
              <span className="cslide__inner">
                {post.category && (
                  <span className="cslide__cat eyebrow">{post.category}</span>
                )}
                <span className="cslide__title">{post.title}</span>
                <span className="cslide__excerpt">{post.excerpt ?? ""}</span>
                <span className="cslide__meta">
                  {post.author?.avatar_url ? (
                    <img
                      src={post.author.avatar_url}
                      alt={post.author.display_name}
                      width={30}
                      height={30}
                      style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                    />
                  ) : (
                    <span
                      className="avatar avatar--accent"
                      style={{ width: 30, height: 30, fontSize: 13, fontWeight: 700 }}
                      aria-hidden="true"
                    >
                      {(post.author?.display_name ?? "A").charAt(0)}
                    </span>
                  )}
                  <span>
                    {post.author?.display_name ?? "AUCTORITAS"}
                    <span className="dotsep" aria-hidden="true">·</span>
                    {post.published_at
                      ? fmtDate(post.published_at, "long")
                      : ""}
                  </span>
                </span>
              </span>
            </a>
          ))}
        </div>

        {/* 화살표 */}
        <button
          className="carousel__arrow carousel__arrow--prev"
          aria-label="이전 슬라이드"
          onClick={(e) => { e.preventDefault(); goSlide(current - 1); startTimer(); }}
          dangerouslySetInnerHTML={{ __html: ICON.chevron }}
        />
        <button
          className="carousel__arrow carousel__arrow--next"
          aria-label="다음 슬라이드"
          onClick={(e) => { e.preventDefault(); goSlide(current + 1); startTimer(); }}
          dangerouslySetInnerHTML={{ __html: ICON.chevron }}
        />

        {/* 점 */}
        <div className="carousel__dots" role="tablist" aria-label="슬라이드 선택">
          {posts.map((post, i) => (
            <button
              key={post.id}
              className={`cdot${i === current ? " is-on" : ""}`}
              role="tab"
              aria-selected={i === current}
              aria-label={`${i + 1}번 슬라이드: ${post.title}`}
              onClick={(e) => { e.preventDefault(); goSlide(i); startTimer(); }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
