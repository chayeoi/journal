import type { PostListItem } from "@/types";
import { fmtDate } from "@/utils/format";
import styles from "./styles.css";

interface Props {
  post: PostListItem;
  showReadingTime?: boolean;
}

function PostCard({ post, showReadingTime = true }: Props) {
  const tags = (post.tags ?? []).slice(0, 3);
  const readingTime = post.reading_minutes ?? 1;
  const dateStr = post.published_at ? fmtDate(post.published_at, "short") : "";

  return (
    <article className={styles.root} data-cat={post.category ?? ""}>
      <a className={styles.link} href={`/posts/${post.id}`} aria-label={post.title}>
        <span className={styles.thumb}>
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
            <span className={`eyebrow ${styles.thumbCat}`}>{post.category}</span>
          )}
        </span>
        <span className={styles.body}>
          {post.category && (
            <span className={`eyebrow ${styles.kicker}`}>{post.category}</span>
          )}
          <h3 className={styles.title}>{post.title}</h3>
          {post.excerpt && (
            <p className={styles.excerpt}>{post.excerpt}</p>
          )}
          <span className={styles.tags}>
            {tags.map((t) => (
              <span key={t} className="ptag">{t}</span>
            ))}
          </span>
          <span className={styles.foot}>
            {post.author?.avatar_url ? (
              <img
                src={post.author.avatar_url}
                alt={post.author.display_name}
                className={styles.avatarImg}
                width={24}
                height={24}
              />
            ) : (
              <span
                className={`avatar avatar--accent ${styles.avatarInitial}`}
                aria-hidden="true"
              >
                {(post.author?.display_name ?? "A").charAt(0)}
              </span>
            )}
            <span className={styles.who}>
              <span className={styles.by}>
                {post.author?.display_name ?? "AUCTORITAS"}
              </span>
            </span>
            <span className={styles.metaline}>
              {dateStr && <time dateTime={post.published_at ?? ""}>{dateStr}</time>}
              {showReadingTime && (
                <>
                  <span className="dotsep" aria-hidden="true">·</span>
                  {readingTime}분
                </>
              )}
            </span>
          </span>
        </span>
      </a>
    </article>
  );
}

export default PostCard;
