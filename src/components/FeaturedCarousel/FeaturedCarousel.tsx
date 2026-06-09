"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PostListItem } from "@/types";
import { ICON } from "@/utils/icons";
import { fmtDate } from "@/utils/format";
import styles from "./styles.css";

interface Props {
  posts: PostListItem[];
}

const DELAY = 5000;

function FeaturedCarousel({ posts }: Props) {
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
        className={styles.root}
        onMouseEnter={stopTimer}
        onMouseLeave={startTimer}
      >
        <div
          className={styles.track}
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {posts.map((post, i) => (
            <Link
              key={post.id}
              className={styles.slide}
              href={`/posts/${post.post_number}`}
              aria-hidden={i !== current}
            >
              <span className={styles.slideMedia}>
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
              <span className={styles.slideShade} />
              <span className={styles.slideInner}>
                {post.category && (
                  <span className={styles.slideCat}>{post.category}</span>
                )}
                <span className={styles.slideTitle}>{post.title}</span>
                <span className={styles.slideExcerpt}>{post.excerpt ?? ""}</span>
                <span className={styles.slideMeta}>
                  {post.author?.avatar_url ? (
                    <img
                      src={post.author.avatar_url}
                      alt={post.author.display_name}
                      className={styles.slideAvatar}
                      width={30}
                      height={30}
                    />
                  ) : (
                    <span
                      className={`avatar avatar--accent ${styles.avatarInitial}`}
                      aria-hidden="true"
                    >
                      {(post.author?.display_name ?? "A").charAt(0)}
                    </span>
                  )}
                  <span>
                    {post.author?.display_name ?? "AUCTORITAS"}
                    <span className="dotsep" aria-hidden="true">·</span>
                    {post.published_at ? fmtDate(post.published_at, "long") : ""}
                  </span>
                </span>
              </span>
            </Link>
          ))}
        </div>

        <button
          className={`${styles.arrow} ${styles.arrowPrev}`}
          aria-label="이전 슬라이드"
          onClick={(e) => { e.preventDefault(); goSlide(current - 1); startTimer(); }}
          dangerouslySetInnerHTML={{ __html: ICON.chevron }}
        />
        <button
          className={`${styles.arrow} ${styles.arrowNext}`}
          aria-label="다음 슬라이드"
          onClick={(e) => { e.preventDefault(); goSlide(current + 1); startTimer(); }}
          dangerouslySetInnerHTML={{ __html: ICON.chevron }}
        />

        <div className={styles.dots} role="tablist" aria-label="슬라이드 선택">
          {posts.map((post, i) => (
            <button
              key={post.id}
              className={i === current ? `${styles.dot} ${styles.dotActive}` : styles.dot}
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

export default FeaturedCarousel;
