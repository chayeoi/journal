import type { ImageLoaderProps } from "next/image";

export default function supabaseImageLoader({ src, width, quality }: ImageLoaderProps): string {
  const url = new URL(src);
  url.pathname = url.pathname.replace(
    "/storage/v1/object/public/",
    "/storage/v1/render/image/public/",
  );
  url.searchParams.set("width", String(width));
  url.searchParams.set("quality", String(quality ?? 75));
  return url.toString();
}
