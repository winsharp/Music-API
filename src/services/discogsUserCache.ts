// Tiny in-memory cache so navigating between a profile and its "View All"
// section pages (or back) doesn't re-fetch and re-show a loading state for
// data we just fetched a moment ago. Cleared automatically after TTL_MS, and
// naturally reset on a full page reload since it just lives in memory.

const TTL_MS = 60_000;

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

export function getCached<T>(key: string): T | undefined {
    const entry = cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
        cache.delete(key);
        return undefined;
    }
    return entry.data as T;
}

export function setCached<T>(key: string, data: T): void {
    cache.set(key, { data, expiresAt: Date.now() + TTL_MS });
}

// Exposed for tests, so each test starts with a clean cache.
export function clearCache(): void {
    cache.clear();
}
