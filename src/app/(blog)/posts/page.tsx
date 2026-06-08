import { redirect } from "next/navigation";

interface Props {
  searchParams: Promise<{ cat?: string; tag?: string }>;
}

export default async function PostsRedirect({ searchParams }: Props) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  if (sp.cat) params.set("cat", sp.cat);
  if (sp.tag) params.set("tag", sp.tag);
  const qs = params.toString();
  redirect(qs ? `/?${qs}` : "/");
}
