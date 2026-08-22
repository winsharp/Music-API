// Service file to browse Discogs releases by genre, without needing a search query.

import axios from "axios";
import type { SearchResponse } from "../types/search";

const BASE_URL = import.meta.env.VITE_DISCOGS_BASE_URL;
const TOKEN = import.meta.env.VITE_DISCOGS_TOKEN;

interface BrowseParams {
    genre?: string;
    // Discogs splits its taxonomy into a broad "genre" facet and a narrower
    // "style" facet nested under it (e.g. K-Pop is a style under Pop/Rock,
    // not a genre) — sending a style value as `genre` returns zero results.
    style?: string;
    page?: number;
}

export const browseReleases = async ({ genre, style, page }: BrowseParams): Promise<SearchResponse> => {
    // No explicit `sort` here on purpose: Discogs' own default ordering surfaces
    // well-known releases first. Forcing sort=year or sort=title instead skews
    // results toward obscure new pressings or an alphabetical-collation artifact
    // (checked both against the live API before settling on this).
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
