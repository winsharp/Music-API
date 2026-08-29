// Service file to browse Discogs releases by genre, without needing a search query.

import axios from "axios";
import type { SearchResponse } from "../types/search";
import { DISCOGS_BASE_URL as BASE_URL, DISCOGS_TOKEN as TOKEN } from "./discogsConfig";

interface BrowseParams {
    genre?: string;
    // Discogs splits its taxonomy into a broad "genre" facet and a narrower
    // "style" facet nested under it (e.g. K-Pop is a style under Pop/Rock,
    // not a genre) — sending a style value as `genre` returns zero results.
    style?: string;
    page?: number;
}

/**
 * Browses Discogs releases by genre/style without a search query, paginated.
 *
 * No explicit `sort` here on purpose: Discogs' own default ordering surfaces
 * well-known releases first. Forcing sort=year or sort=title instead skews
 * results toward obscure new pressings or an alphabetical-collation artifact
 * (checked both against the live API before settling on this).
 */
export const browseReleases = async ({ genre, style, page }: BrowseParams): Promise<SearchResponse> => {
    const response = await axios.get<SearchResponse>(`${BASE_URL}/database/search`, {
        params: {
            type: "release",
            genre,
            style,
            token: TOKEN,
            page,
        },
    });
    return response.data;
};
