import { createHash } from "node:crypto";
import type { Context, Next } from "hono";

interface CacheEntry {
  body: string;
  etag: string;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const DEFAULT_TTL = 2 * 60 * 1000; // 2 minutes
const MAX_ENTRIES = 500;

function generateEtag(body: string): string {
  return createHash("md5").update(body).digest("hex").slice(0, 16);
}

function evictExpired(ttl: number) {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now - entry.timestamp >= ttl) {
      cache.delete(key);
    }
  }
}

export function cacheMiddleware(ttl = DEFAULT_TTL) {
  return async (c: Context, next: Next) => {
    if (c.req.method !== "GET") {
      await next();
      return;
    }

    const tenantSlug = (c.get("tenant") as { slug: string } | undefined)?.slug;
    if (!tenantSlug) {
      await next();
      return;
    }

    const url = new URL(c.req.url);
    const cacheKey = `${tenantSlug}:${url.pathname}:${url.search}`;

    const cached = cache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < ttl) {
      const ifNoneMatch = c.req.header("if-none-match");
      if (ifNoneMatch === cached.etag) {
        c.header("X-Cache", "HIT");
        return c.body(null, 304);
      }

      c.header("X-Cache", "HIT");
      c.header("ETag", cached.etag);
      c.header("Cache-Control", "private, no-store");
      c.header("Content-Type", "application/json; charset=UTF-8");
      return c.body(cached.body, 200);
    }

    await next();

    if (c.res.status === 200) {
      if (cache.size >= MAX_ENTRIES) {
        evictExpired(ttl);
      }
      if (cache.size >= MAX_ENTRIES) {
        // Evict the single oldest entry rather than clearing the whole cache
        let oldestKey: string | undefined;
        let oldestTime = Number.POSITIVE_INFINITY;
        for (const [key, entry] of cache) {
          if (entry.timestamp < oldestTime) {
            oldestTime = entry.timestamp;
            oldestKey = key;
          }
        }
        if (oldestKey !== undefined) cache.delete(oldestKey);
      }

      const cloned = c.res.clone();
      const body = await cloned.text();
      const etag = generateEtag(body);

      cache.set(cacheKey, { body, etag, timestamp: Date.now() });

      c.header("X-Cache", "MISS");
      c.header("ETag", etag);
      c.header("Cache-Control", "private, no-store");
    }
  };
}
