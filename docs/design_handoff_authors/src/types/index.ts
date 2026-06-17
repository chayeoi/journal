export type Profile = {
  id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
};

export type Post = {
  id: string;
  post_number: number;
  title: string;
  content: string;
  excerpt: string | null;
  reading_minutes: number | null;
  thumbnail_url: string | null;
  author_id: string | null;
  category: string | null;
  status: string;
  is_visible: boolean;
  published_at: string | null;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
  tags: string[];
  author?: Profile;
};

export type PostListItem = {
  id: string;
  post_number: number;
  title: string;
  thumbnail_url: string | null;
  author_id: string | null;
  category: string | null;
  published_at: string | null;
  created_at: string;
  tags: string[];
  excerpt: string | null;
  reading_minutes: number | null;
  author?: Pick<Profile, "id" | "display_name" | "avatar_url">;
};

export const CATEGORY_ORDER = [
  "공사대금",
  "임대차",
  "부동산매매",
  "상속",
  "행정",
  "재개발·재건축",
  "가사·가족",
  "AI·디지털",
  "명도·인도",
  "기타",
] as const;

export type PostsResult = {
  posts: PostListItem[];
  total: number;
  hasMore: boolean;
};

export type CategoryCount = {
  category: string;
  count: number;
};

export type ArchiveDate = {
  key: string;
  label: string;
  count: number;
};

export type PostSearchParams = {
  category?: string;
  tag?: string;
  query?: string;
  archive?: string; // "YYYY-MM"
  page?: number;
  upToPage?: number; // 초기 로드 시 1~N 페이지를 한 번에 가져옴
};

// ============================================================
//  AUTHORS (집필진 / E-E-A-T)
// ============================================================

/** /authors 목록용 — 이름 + 간략 소개. */
export type AuthorListItem = {
  id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
};

/** /authors/{id} 상세용 — 프로필 + 집필 수 + 쓴 글 목록. */
export type AuthorDetail = Profile & {
  post_count: number;
  posts: PostListItem[];
};
