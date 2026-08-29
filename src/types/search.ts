import type { DiscogsPagination } from "./pagination";

/**
 * Shape of a single item from Discogs' GET /database/search (used by both
 * `searchService` and `browseService`) — one album/release. Optional fields
 * may be omitted by Discogs depending on how much data that entry has.
 */
export interface SearchResult {
    id: number;
    type: string;
    title: string;
    thumb: string;
    year?: string;
    genre?: string[];
    style?: string[];
    format?: string[];
    country?: string;
    resource_url: string;
}

/** Full GET /database/search response: a page of results plus pagination info. */
export interface SearchResponse {
    pagination: DiscogsPagination;
    results: SearchResult[];
}