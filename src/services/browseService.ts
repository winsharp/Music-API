// Service file to browse Discogs releases by genre, without needing a search query.

import axios from "axios";
import type { SearchResponse } from "../types/search";

const BASE_URL = import.meta.env.VITE_DISCOGS_BASE_URL;
const TOKEN = import.meta.env.VITE_DISCOGS_TOKEN;

interface BrowseParams {
    genre?: string;
    page?: number;
}

export const browseReleases = async ({ genre, page }: BrowseParams): Promise<SearchResponse> => {
    // No explicit `sort` here on purpose: Discogs' own default ordering surfaces
    // well-known releases first. Forcing sort=year or sort=title instead skews
    // results toward obscure new pressings or an alphabetical-collation artifact
    // (checked both against the live API before settling on this).
    const response = await axios.get<SearchResponse>(`${BASE_URL}/database/search`, {
        params: {
            type: "release",
            genre,
            token: TOKEN,
            page,
        },
    });
    return response.data;
};
