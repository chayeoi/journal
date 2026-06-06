export type PostStatus = "draft" | "published";

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  author_id: string;
  category_id: string | null;
  status: PostStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author?: Author;
  category?: Category;
  tags?: Tag[];
};

export type Author = {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
};

export type PostListItem = Pick<
  Post,
  | "id"
  | "slug"
  | "title"
  | "excerpt"
  | "cover_image_url"
  | "published_at"
  | "created_at"
> & {
  author?: Pick<Author, "id" | "name" | "avatar_url">;
  category?: Pick<Category, "id" | "name" | "slug">;
  tags?: Pick<Tag, "id" | "name" | "slug">[];
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type PostSearchParams = {
  query?: string;
  category?: string;
  tag?: string;
  author?: string;
  page?: number;
  pageSize?: number;
  year?: number;
  month?: number;
};
