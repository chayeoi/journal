import Link from "next/link";
import type { AuthorListItem } from "@/types";
import styles from "./styles.css";

interface Props {
  author: AuthorListItem;
}

function AuthorCard({ author }: Props) {
  const initial = (author.display_name ?? "A").charAt(0);

  return (
    <article className={styles.root}>
      <Link
        className={styles.link}
        href={`/authors/${author.id}`}
        aria-label={`${author.display_name} 프로필`}
      >
        {author.avatar_url ? (
          <img
            src={author.avatar_url}
            alt={author.display_name}
            width={60}
            height={60}
            className={styles.avatarImg}
          />
        ) : (
          <span className={`avatar avatar--dark ${styles.avatarInitial}`} aria-hidden="true">
            {initial}
          </span>
        )}

        <span className={styles.main}>
          <span className={styles.name}>{author.display_name}</span>
          {author.bio && <span className={styles.bio}>{author.bio}</span>}
        </span>

        <span className={styles.go} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </span>
      </Link>
    </article>
  );
}

export default AuthorCard;
