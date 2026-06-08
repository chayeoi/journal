/**
 * Cookie-free Supabase client for use in static contexts:
 * - generateStaticParams
 * - sitemap()
 * - Any build-time data fetching that cannot access request cookies
 */
import { createClient } from "@supabase/supabase-js";

export function createStaticClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
