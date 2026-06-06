import { getPosts } from "@/lib/posts";

export default async function HomePage() {
  const { data: posts } = await getPosts({ pageSize: 6 });

  return (
    <main>
      <section>
        <h1>최신 아티클</h1>
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <a href={`/posts/${post.slug}`}>{post.title}</a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
