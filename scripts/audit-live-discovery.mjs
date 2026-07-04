#!/usr/bin/env node

const SITE = normalizeSite(
  process.env.JOURNAL_SITE_URL || 'https://journal.fightingspirit.kr',
);
const API_PAGE_LIMIT = Number(process.env.JOURNAL_LIVE_AUDIT_PAGE_LIMIT || 20);
const PAGE_SAMPLE_LIMIT = Number(
  process.env.JOURNAL_LIVE_AUDIT_PAGE_SAMPLE_LIMIT || 5,
);
const TIMEOUT_MS = Number(process.env.JOURNAL_LIVE_AUDIT_TIMEOUT_MS || 15000);
const USER_AGENT = 'Journal-LiveDiscoveryAudit/1.0';

const errors = [];

function normalizeSite(site) {
  return site.replace(/\/+$/, '');
}

function normalizeUrl(url) {
  return url.replace(/\/+$/, '');
}

function postUrl(postNumber) {
  return `${SITE}/posts/${postNumber}`;
}

function extractAttribute(tag, name) {
  const match = tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, 'i'));
  return match?.[1] || '';
}

function parseSitemapLocs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map(match =>
    normalizeUrl(match[1]),
  );
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': USER_AGENT,
        accept:
          'text/html,application/xhtml+xml,application/xml,text/xml,application/json;q=0.9,*/*;q=0.8',
      },
    });
    const body = await response.text();
    if (!response.ok) {
      throw new Error(
        `${url} returned HTTP ${response.status}: ${body.slice(0, 240)}`,
      );
    }
    return body;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson(url) {
  const body = await fetchText(url);
  try {
    return JSON.parse(body);
  } catch (error) {
    throw new Error(`${url} did not return valid JSON: ${error.message}`);
  }
}

async function collectApiPosts() {
  const byPostNumber = new Map();
  let expectedTotal = null;
  let page = 1;

  while (page <= API_PAGE_LIMIT) {
    const payload = await fetchJson(`${SITE}/api/posts?page=${page}`);
    if (!Array.isArray(payload.posts)) {
      errors.push(`/api/posts?page=${page}: expected posts array`);
      break;
    }

    if (Number.isFinite(payload.total)) {
      expectedTotal = payload.total;
    }

    for (const post of payload.posts) {
      const postNumber = Number(post.post_number);
      if (!Number.isInteger(postNumber) || postNumber <= 0) {
        errors.push(
          `/api/posts?page=${page}: post is missing a positive post_number (${post.title || post.id || 'untitled'})`,
        );
        continue;
      }
      byPostNumber.set(postNumber, post);
    }

    if (!payload.hasMore) break;
    page += 1;
  }

  if (page > API_PAGE_LIMIT) {
    errors.push(
      `API pagination exceeded JOURNAL_LIVE_AUDIT_PAGE_LIMIT=${API_PAGE_LIMIT}`,
    );
  }

  if (expectedTotal !== null && byPostNumber.size < expectedTotal) {
    errors.push(
      `API returned ${byPostNumber.size}/${expectedTotal} unique posts before the audit stopped`,
    );
  }

  return {
    posts: [...byPostNumber.values()].sort(
      (a, b) => Number(b.post_number) - Number(a.post_number),
    ),
    expectedTotal,
  };
}

function assertRobots(robots) {
  if (
    !new RegExp(
      `Sitemap:\\s*${SITE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/sitemap\\.xml`,
      'i',
    ).test(robots)
  ) {
    errors.push(
      `robots.txt: missing Sitemap directive for ${SITE}/sitemap.xml`,
    );
  }

  const blocks = robots
    .split(/\n\s*\n/)
    .map(block => block.trim())
    .filter(Boolean);
  const globalBlock = blocks.find(block => /^user-agent:\s*\*/im.test(block));
  if (!globalBlock) {
    errors.push('robots.txt: missing global User-agent: * block');
    return;
  }

  if (/^disallow:\s*\/\s*$/im.test(globalBlock)) {
    errors.push('robots.txt: global crawler block has Disallow: /');
  }
}

async function assertPageIndexable(post) {
  const url = postUrl(post.post_number);
  const html = await fetchText(url);
  const headEnd = html.search(/<\/head>/i);
  const head = headEnd === -1 ? html.slice(0, 12000) : html.slice(0, headEnd);

  const canonicalTags = [
    ...head.matchAll(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi),
  ].concat([
    ...head.matchAll(
      /<link\b[^>]*href=["'][^"']+["'][^>]*rel=["']canonical["'][^>]*>/gi,
    ),
  ]);
  const canonical = canonicalTags
    .map(match => extractAttribute(match[0], 'href'))
    .find(Boolean);
  if (normalizeUrl(canonical || '') !== url) {
    errors.push(
      `${url}: canonical should be ${url}, found ${canonical || 'none'}`,
    );
  }

  const robotsTags = [
    ...head.matchAll(/<meta\b[^>]*name=["']robots["'][^>]*>/gi),
  ];
  const robotsContent = robotsTags
    .map(match => extractAttribute(match[0], 'content'))
    .join(', ');
  if (/noindex/i.test(robotsContent)) {
    errors.push(`${url}: robots meta contains noindex (${robotsContent})`);
  }

  if (
    !/"@type"\s*:\s*"BlogPosting"/.test(html) &&
    !/"@type":"BlogPosting"/.test(html)
  ) {
    errors.push(`${url}: missing BlogPosting JSON-LD`);
  }

  if (!html.includes(post.title || '')) {
    errors.push(
      `${url}: page HTML does not include API title (${post.title || 'untitled'})`,
    );
  }
}

async function main() {
  const [robots, sitemapXml, apiResult] = await Promise.all([
    fetchText(`${SITE}/robots.txt`),
    fetchText(`${SITE}/sitemap.xml`),
    collectApiPosts(),
  ]);

  assertRobots(robots);

  const sitemapLocs = parseSitemapLocs(sitemapXml);
  const sitemapSet = new Set(sitemapLocs);
  if (!sitemapSet.has(SITE)) {
    errors.push(`sitemap.xml: missing home URL ${SITE}`);
  }

  const publicPosts = apiResult.posts;
  const missing = publicPosts.filter(
    post => !sitemapSet.has(postUrl(post.post_number)),
  );

  if (missing.length) {
    errors.push(
      `sitemap.xml: missing ${missing.length}/${publicPosts.length} public post URLs from /api/posts`,
    );
  }

  const pageSamples = new Map();
  for (const post of publicPosts.slice(0, 3))
    pageSamples.set(post.post_number, post);
  for (const post of missing.slice(0, 2))
    pageSamples.set(post.post_number, post);

  await Promise.all(
    [...pageSamples.values()]
      .slice(0, PAGE_SAMPLE_LIMIT)
      .map(assertPageIndexable),
  );

  if (errors.length) {
    console.error('Live discovery audit failed:');
    for (const error of errors) console.error(`- ${error}`);
    if (missing.length) {
      console.error('\nFirst missing sitemap post URLs:');
      for (const post of missing.slice(0, 30)) {
        console.error(
          `- ${postUrl(post.post_number)} | ${post.title || 'untitled'}`,
        );
      }
      if (missing.length > 30)
        console.error(`- ...and ${missing.length - 30} more`);
    }
    process.exit(1);
  }

  console.log(
    `Live discovery audit OK: ${publicPosts.length} public posts, ${sitemapLocs.length} sitemap URLs.`,
  );
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
