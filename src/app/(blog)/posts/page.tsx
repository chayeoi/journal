import { getPosts } from "@/lib/posts";
import type { PostSearchParams } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "아티클",
};

type Props = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    tag?: string;
    author?: string;
    page?: string;
    year?: string;
    month?: string;
  }>;
};

export default async function PostsPage({ searchParams }: Props) {
  const sp = await searchParams;

  const params: PostSearchParams = {
    query: sp.q,
    category: sp.category,
    tag: sp.tag,
    author: sp.author,
    page: sp.page ? Number(sp.page) : 1,
    year: sp.year ? Number(sp.year) : undefined,
    month: sp.month ? Number(sp.month) : undefined,
  };

  const { data: posts, total, page, totalPages } = await getPosts(params);

  return (
    <main>
      <h1>아티클</h1>
      <p>
        {total}개의 아티클 · {page} / {totalPages} 페이지
      </p>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <a href={`/posts/${post.slug}`}>{post.title}</a>
            {post.category && <span>{post.category.name}</span>}
            {post.tags?.map((tag) => (
              <span key={tag.id}>#{tag.name}</span>
            ))}
          </li>
        ))}
      </ul>
    </main>
  );
}
