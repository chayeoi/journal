'use client';

import { useEffect } from 'react';

interface Props {
  postId: string | number;
}

/**
 * Closes the marketing measurement loop: increments posts.views once per post
 * per session. RLS allows anon PATCH on posts.views. Best-effort — never blocks
 * article rendering. Feeds marketing-director 3-day pulse (collect_post_performance
 * in another-pipe) via the shared Supabase posts table.
 *
 * Concurrency: read-modify-write is not atomic, so two near-simultaneous first
 * reads can lose one count. This is an acceptable ±1 error for a view counter
 * and avoids a schema-level RPC dependency. sessionStorage dedups within a session;
 * a true unique-visitor counter would need an idempotent RPC (out of scope).
 */
function ViewTracker({ postId }: Props) {
  useEffect(() => {
    const id = Number(postId);
    if (!Number.isFinite(id) || id <= 0) return;
    const KEY = `viewed_post_${id}`;
    try {
      if (sessionStorage.getItem(KEY)) return;
      sessionStorage.setItem(KEY, '1');
    } catch {
      // sessionStorage blocked (private mode etc.); proceed best-effort
    }
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return;
    let cancelled = false;
    (async () => {
      try {
        const headers: Record<string, string> = {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        };
        const curRes = await fetch(
          `${url}/rest/v1/posts?id=eq.${encodeURIComponent(id)}&select=views`,
          { headers },
        );
        if (!curRes.ok) return;
        const curJson = await curRes.json();
        const cur =
          Array.isArray(curJson) &&
          curJson[0] &&
          typeof curJson[0].views === 'number'
            ? curJson[0].views
            : 0;
        if (cancelled) return;
        await fetch(`${url}/rest/v1/posts?id=eq.${encodeURIComponent(id)}`, {
          method: 'PATCH',
          headers: { ...headers, Prefer: 'return=minimal' },
          body: JSON.stringify({ views: cur + 1 }),
        });
      } catch {
        // best-effort: view tracking must never break article rendering
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [postId]);
  return null;
}

export default ViewTracker;
